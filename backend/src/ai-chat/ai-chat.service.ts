import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, isValidObjectId } from 'mongoose';
import { DesignsService } from '../designs/designs.service';
import { MaterialsService } from '../materials/materials.service';
import { CloudinaryService } from '../common/cloudinary/cloudinary.service';
import {
  AiConversation,
  AiConversationDocument,
  AiDesignRef,
  AiMessage,
} from './schemas/ai-conversation.schema';
import {
  GeminiClient,
  GeminiContent,
  GeminiError,
  GeminiFunctionDeclaration,
  GeminiPart,
} from './gemini.client';
import { RateLimiter } from './rate-limiter';
import { missingRangeFields, REFERENCE_SIZES, roundDown, toPriceRange } from './ai-pricing';

interface Requester {
  id?: string;
  firstName?: string;
  ip: string;
}

interface CatalogDesign {
  id: string;
  designCode: string;
  title: string;
  category: string;
  systemType?: string;
  imageUrl?: string;
}

const HISTORY_LIMIT = 12; // previous messages sent to the model each turn
const MAX_TOOL_ROUNDS = 3;
const CATALOG_TTL_MS = 5 * 60 * 1000;

const COLORS = ['black', 'white', 'silver', 'wood-finish (30% surcharge)'];

/**
 * Everything the workshop can fabricate, whether or not it is in the catalogue.
 * The catalogue only holds example designs — edit this list to match the real business.
 */
const CAPABILITIES = [
  'Doors and windows: sliding, swing (casement / hinged), fixed, top-hung, louvre',
  'Shop fronts and glass entrance doors',
  'Office and glass partitions',
  'Kitchen cupboards, pantry cupboards and wardrobes (aluminium framed)',
  'Ceilings and ceiling panels',
  'Mosquito / insect screens and aluminium grills',
  'Repairs of existing aluminium work (rollers, locks, handles, glass, rubber beading)',
];
const NOT_OFFERED = ['uPVC', 'timber / wooden frames', 'wrought iron or steel gates', 'frameless structural glass facades'];

const TOOLS: GeminiFunctionDeclaration[] = [
  {
    name: 'get_price_range',
    description:
      'Indicative price RANGE (Sri Lankan Rupees) for an aluminium window or door. Call ONLY when the customer has given ALL of: ' +
      'product type, opening system, width, height, number of panels and colour. Never guess missing values.',
    parameters: {
      type: 'object',
      properties: {
        productType: { type: 'string', enum: ['window', 'door'] },
        systemType: { type: 'string', enum: ['sliding', 'swing', 'fixed'] },
        widthFt: { type: 'number', description: 'Overall width in feet (convert inches/cm/mm to feet)' },
        heightFt: { type: 'number', description: 'Overall height in feet (convert inches/cm/mm to feet)' },
        panels: { type: 'integer', description: 'Number of panels / leaves' },
        color: { type: 'string', enum: ['black', 'white', 'silver', 'wood-finish'] },
      },
      required: ['productType', 'systemType', 'widthFt', 'heightFt', 'panels', 'color'],
    },
  },
  {
    name: 'get_starting_price',
    description:
      'Starting-from price for a small standard-size window or door. Use when the customer names the product ' +
      '(and maybe the opening system) but has not given full size/panel/colour details.',
    parameters: {
      type: 'object',
      properties: {
        productType: { type: 'string', enum: ['window', 'door'] },
        systemType: {
          type: 'string',
          enum: ['sliding', 'swing', 'fixed'],
          description: 'Leave out to get starting prices for every available system',
        },
      },
      required: ['productType'],
    },
  },
];

@Injectable()
export class AiChatService {
  private readonly logger = new Logger(AiChatService.name);
  private readonly anonLimiter: RateLimiter;
  private readonly userLimiter: RateLimiter;
  private catalogCache?: { text: string; designs: CatalogDesign[]; expires: number };

  constructor(
    @InjectModel(AiConversation.name) private readonly conversationModel: Model<AiConversationDocument>,
    private readonly gemini: GeminiClient,
    private readonly designsService: DesignsService,
    private readonly materialsService: MaterialsService,
    private readonly cloudinary: CloudinaryService,
    config: ConfigService,
  ) {
    const windowMs = 10 * 60 * 1000;
    this.anonLimiter = new RateLimiter(Number(config.get('AI_CHAT_ANON_LIMIT', 15)), windowMs);
    this.userLimiter = new RateLimiter(Number(config.get('AI_CHAT_USER_LIMIT', 40)), windowMs);
  }

  // ---------- Public API ----------

  async getConversation(id: string, requester: Requester) {
    const conversation = await this.findOwned(id, requester);
    return this.toResponse(conversation);
  }

  async sendMessage(
    input: { conversationId?: string; message?: string; image?: Express.Multer.File },
    requester: Requester,
  ) {
    const text = (input.message ?? '').trim();
    if (!text && !input.image) throw new BadRequestException('Type a message or attach an image');
    if (!this.gemini.isConfigured) {
      throw new ServiceUnavailableException('The AI assistant is not available right now');
    }

    const allowed = requester.id
      ? this.userLimiter.take(`u:${requester.id}`)
      : this.anonLimiter.take(`ip:${requester.ip}`);
    if (!allowed) {
      throw new HttpException(
        'You have sent a lot of messages. Please wait a few minutes and try again.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    const conversation = input.conversationId
      ? await this.findOwned(input.conversationId, requester)
      : new this.conversationModel({
          user: requester.id ? new Types.ObjectId(requester.id) : undefined,
          messages: [],
        });
    if (!conversation.user && requester.id) conversation.user = new Types.ObjectId(requester.id);

    let imageUrl: string | undefined;
    if (input.image) {
      try {
        const uploaded = await this.cloudinary.uploadFile(input.image, 'alumate/ai-chat', 'image');
        imageUrl = uploaded.secure_url;
      } catch (err) {
        this.logger.warn(`Image upload failed, continuing without stored copy: ${err}`);
      }
    }

    const catalog = await this.getCatalog();
    const contents = this.buildContents(conversation.messages, text, input.image);
    const replyText = await this.runModel(this.systemPrompt(catalog.text, requester.firstName), contents);

    const userMessage: AiMessage = { role: 'user', text, imageUrl, designs: [] };
    const assistantMessage: AiMessage = {
      role: 'assistant',
      text: replyText,
      designs: this.findMentionedDesigns(replyText, catalog.designs),
    };
    conversation.messages.push(userMessage, assistantMessage);
    await conversation.save();

    const saved = conversation.messages[conversation.messages.length - 1];
    return { conversationId: conversation._id.toString(), reply: saved };
  }

  // ---------- Model interaction ----------

  /**
   * Runs one customer turn. If a model is overloaded at any step (including
   * after a tool call), the whole turn is restarted on the next fallback model.
   */
  private async runModel(systemInstruction: string, contents: GeminiContent[]): Promise<string> {
    const models = this.gemini.models;
    let lastError: unknown;
    for (const [i, model] of models.entries()) {
      try {
        return await this.runTurn(model, systemInstruction, [...contents]);
      } catch (err) {
        lastError = err;
        const retryable = err instanceof GeminiError && GeminiClient.isRetryable(err.status);
        if (!retryable || i === models.length - 1) break;
        this.logger.warn(`Model ${model} failed (${(err as GeminiError).status}), restarting turn on ${models[i + 1]}`);
      }
    }

    const err = lastError;
    if (err instanceof GeminiError) {
      if (err.status === 429) {
        throw new HttpException(
          'Our AI assistant is very busy right now. Please try again in a minute.',
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }
      throw new ServiceUnavailableException('The AI assistant is temporarily unavailable. Please try again later.');
    }
    if ((err as Error)?.name === 'TimeoutError') {
      throw new ServiceUnavailableException('The AI assistant took too long to respond. Please try again.');
    }
    throw err;
  }

  /** The model/tool loop for one turn on a single model (thought signatures are model-specific). */
  private async runTurn(model: string, systemInstruction: string, contents: GeminiContent[]): Promise<string> {
    for (let round = 0; round <= MAX_TOOL_ROUNDS; round++) {
      const response = await this.gemini.generate({
        model,
        systemInstruction,
        contents,
        tools: round < MAX_TOOL_ROUNDS ? TOOLS : undefined,
      });

      const calls = response.parts.filter(
        (p): p is Extract<GeminiPart, { functionCall: unknown }> => 'functionCall' in p,
      );
      if (!calls.length) {
        const text = response.parts
          .filter((p): p is Extract<GeminiPart, { text: string }> => 'text' in p)
          .map((p) => p.text)
          .join('')
          .trim();
        return (
          text ||
          "Sorry, I couldn't come up with an answer to that. Could you rephrase, or contact our team through Messages?"
        );
      }

      // Keep the model's turn verbatim (it may carry thought signatures), then answer each call.
      contents.push(response);
      const results = await Promise.all(calls.map((c) => this.runTool(c.functionCall.name, c.functionCall.args ?? {})));
      contents.push({
        role: 'user',
        parts: calls.map((c, i) => ({
          functionResponse: { name: c.functionCall.name, response: results[i] },
        })),
      });
    }
    return 'Sorry, I got stuck working that out. Please try asking in a different way.';
  }

  private async runTool(name: string, args: Record<string, any>): Promise<Record<string, unknown>> {
    try {
      if (name === 'get_price_range') return await this.priceRange(args);
      if (name === 'get_starting_price') return await this.startingPrice(args);
      return { error: `Unknown tool ${name}` };
    } catch (err) {
      return { error: (err as Error)?.message || 'Could not price this configuration' };
    }
  }

  /** Full details → indicative range. The exact engine figure is never given to the model. */
  private async priceRange(args: Record<string, any>) {
    const missing = missingRangeFields(args);
    if (missing.length) {
      return { error: 'Missing details — ask the customer for them before giving a range', missing };
    }
    const result = await this.materialsService.estimate(String(args.productType), String(args.systemType), {
      measurements: { width: Number(args.widthFt), height: Number(args.heightFt) },
      panels: Number(args.panels),
      color: String(args.color),
    });
    return {
      product: result.templateName,
      size: `${args.widthFt}ft x ${args.heightFt}ft`,
      panels: result.inputs.panels,
      color: args.color,
      ...toPriceRange(result.totals.total),
      warnings: result.warnings,
      note: 'Indicative range only. The exact price is calculated in the formal quotation after measurement.',
    };
  }

  /** Product (and maybe system) only → price of a small standard unit, rounded down. */
  private async startingPrice(args: Record<string, any>) {
    const productType = String(args.productType);
    const systems = (await this.materialsService.findSystems(productType)).filter(
      (s: any) => !args.systemType || s.systemType === args.systemType,
    );
    if (!systems.length) {
      return { error: `No instant pricing for ${args.systemType ?? ''} ${productType}s — suggest a quotation instead` };
    }

    const prices = [];
    for (const system of systems as any[]) {
      for (const size of REFERENCE_SIZES[productType] ?? []) {
        try {
          const result = await this.materialsService.estimate(productType, system.systemType, {
            measurements: { width: size.widthFt, height: size.heightFt },
            panels: system.minPanels,
            color: 'silver',
          });
          prices.push({
            product: system.name,
            startingFromRs: roundDown(result.totals.total),
            basis: `${size.widthFt}ft x ${size.heightFt}ft, ${system.minPanels} panel(s), standard colour`,
          });
          break;
        } catch {
          // size not valid for this system — try the next reference size
        }
      }
    }
    if (!prices.length) return { error: 'Could not work out a starting price — suggest a quotation instead' };
    return {
      prices,
      note: 'Starting-from prices for a small standard unit. Larger sizes, more panels or wood finish cost more.',
    };
  }

  private buildContents(history: AiMessage[], text: string, image?: Express.Multer.File): GeminiContent[] {
    const contents: GeminiContent[] = history.slice(-HISTORY_LIMIT).map((m) => {
      const note = m.imageUrl ? '[The customer attached a photo here.] ' : '';
      return {
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: `${note}${m.text}`.trim() || '(empty)' }],
      };
    });

    const parts: GeminiPart[] = [];
    if (image) {
      parts.push({ inlineData: { mimeType: image.mimetype, data: image.buffer.toString('base64') } });
    }
    parts.push({
      text: text || 'Here is a photo of a product. Can your company make something like this?',
    });
    contents.push({ role: 'user', parts });
    return contents;
  }

  private systemPrompt(catalogText: string, firstName?: string) {
    return `You are "AluMate Assistant", the friendly customer assistant for AluMate, an aluminium fabrication company in Colombo, Sri Lanka.

## What AluMate can make (all custom, made to measure)
${CAPABILITIES.map((c) => `- ${c}`).join('\n')}
Not offered: ${NOT_OFFERED.join(', ')}.
- Aluminium colours: ${COLORS.join(', ')}.
- Services: on-site measurement visits and repairs of existing aluminium work.
- Contact: +94 11 234 5678 / +94 77 123 4567, info@alumate.com, 123 Industrial Zone, Colombo.

## How customers move forward (website features)
- Browse the Design Catalogue (Dashboard → Design Catalogue).
- Design their own product in the Design Studio and request a quotation.
- Book an on-site visit or a repair under Services.
- Talk to a staff member under Messages.
Customers must log in or register to use these.

## Design catalogue (example designs from the company database — NOT the full range)
The catalogue shows a sample of past/popular designs. A product that is not in the catalogue can still be custom-made if it is in "What AluMate can make".
${catalogText}

## When the customer sends a photo
1. Briefly describe what you see: product type (door, window, cupboard, partition, ceiling...), opening style, number of panels, glass type, colour/finish, any grills or special features.
2. Say honestly whether AluMate can make it, based on "What AluMate can make". If it uses something in "Not offered", say so politely and suggest the closest aluminium alternative.
3. If a catalogue design is genuinely similar, mention it by its exact design code (e.g. "WIN-001") so the website can show it. If nothing is similar, say it would be a custom job — do not force a weak match.
4. Treat details clearly visible in the photo (panel count, opening style, colour) as given, and say what you assumed (e.g. "From the photo I'll assume 3 panels in white — tell me if you want something different"). Only ask for what the photo can't show, mainly width and height. If the opening style is unclear (e.g. fixed centre with side sashes), ask which style they want.
5. Suggest a next step (price, Design Studio, quotation or site visit).

## Rules
- Never invent products, design codes, prices, stock levels or delivery dates. Use only the catalogue above and the pricing tools.
- Never state an exact price. You only ever get ranges or starting-from prices from the tools — pass them on, never narrow them or invent your own. Format prices like "Rs. 125,000".
- How to answer price questions (windows/doors in the systems listed above):
  1. Vague request (e.g. "I want an aluminium product", "how much do you charge?"): give NO price. Ask what they want to make (door, window, cupboard...) and, for windows/doors, which opening style.
  2. Product known but details missing (e.g. "how much is a sliding window?"): call get_starting_price and say "starts from Rs. X" with the basis (small standard size). Then ask for the missing details (width, height, panels, colour) to give a closer range.
  3. All details given (product, opening system, width, height, panels, colour): call get_price_range and give "around Rs. X – Rs. Y".
  Always add that the exact price is calculated in the formal quotation after measurement, and offer the next step.
- If a tool returns "missing", ask only for those missing details in one short question.
- Instant estimates exist ONLY for the window/door systems listed above. For anything else (shop fronts, partitions, cupboards, pantries, ceilings, screens, repairs, or windows/doors in a system not listed): say it can be custom-made, do NOT guess a price or a price range, ask for the useful details (what it is, approximate size, location/room, colour, a photo if possible) and direct them to request a quotation, book an on-site visit under Services, or contact the team via Messages.
- If you are not sure, or the request needs a human (complaints, order status, payments), tell them to contact the team via Messages or the phone numbers above.
- Only help with topics related to AluMate and aluminium fabrication. Politely decline anything else.
- Keep replies short and friendly: a few sentences or a short bullet list. Use plain text with simple "-" or "1." lists and **bold** only — no headings (#) and no horizontal lines (---).
- Reply in the same language the customer uses (English, Sinhala or Tamil).
${firstName ? `- The customer's first name is ${firstName}.` : ''}`;
  }

  // ---------- Catalogue context ----------

  private async getCatalog() {
    if (this.catalogCache && this.catalogCache.expires > Date.now()) return this.catalogCache;

    const [designs, systems] = await Promise.all([
      this.designsService.findAll(),
      this.materialsService.findSystems(),
    ]);
    const active = designs.filter((d: any) => d.isActive !== false);

    const designLines = active.map((d: any) => {
      const bits = [
        `${d.designCode}: ${d.title}`,
        `category=${d.category}`,
        d.systemType ? `system=${d.systemType}` : '',
        d.features?.length ? `features=${d.features.join(', ')}` : '',
        d.description ? `"${String(d.description).replace(/\s+/g, ' ').slice(0, 180)}"` : '',
      ];
      return `- ${bits.filter(Boolean).join(' | ')}`;
    });
    const systemLines = systems.map(
      (s: any) =>
        `- ${s.name} (${s.productType}, ${s.systemType}, ${s.minPanels}-${s.maxPanels} panels)${s.description ? `: ${s.description}` : ''}`,
    );

    const text = [
      '### Designs',
      designLines.length ? designLines.join('\n') : '- (no designs published yet)',
      '### Window/door systems with instant estimates',
      systemLines.length ? systemLines.join('\n') : '- (none configured)',
    ].join('\n');

    this.catalogCache = {
      text,
      designs: active.map((d: any) => ({
        id: d._id.toString(),
        designCode: d.designCode,
        title: d.title,
        category: d.category,
        systemType: d.systemType,
        imageUrl: d.imageUrls?.[0],
      })),
      expires: Date.now() + CATALOG_TTL_MS,
    };
    return this.catalogCache;
  }

  private findMentionedDesigns(text: string, designs: CatalogDesign[]): AiDesignRef[] {
    const upper = text.toUpperCase();
    return designs
      .filter((d) => {
        const code = d.designCode?.toUpperCase();
        if (!code) return false;
        const escaped = code.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        return new RegExp(`(^|[^A-Z0-9-])${escaped}([^A-Z0-9-]|$)`).test(upper);
      })
      .slice(0, 4)
      .map(({ id, designCode, title, category, imageUrl }) => ({ id, designCode, title, category, imageUrl }));
  }

  // ---------- Helpers ----------

  private async findOwned(id: string, requester: Requester) {
    if (!isValidObjectId(id)) throw new NotFoundException('Conversation not found');
    const conversation = await this.conversationModel.findById(id).exec();
    if (!conversation) throw new NotFoundException('Conversation not found');
    if (conversation.user && conversation.user.toString() !== requester.id) {
      throw new NotFoundException('Conversation not found');
    }
    return conversation;
  }

  private toResponse(conversation: AiConversationDocument) {
    return { conversationId: conversation._id.toString(), messages: conversation.messages };
  }
}
