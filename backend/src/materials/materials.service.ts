import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';
import { BomInput, BomResult, BomService } from './bom.service';
import { validateFormula } from './formula.util';
import { CreateProfileDto, UpdateProfileDto } from './dto/profile.dto';
import { CreateProductTemplateDto, UpdateProductTemplateDto } from './dto/product-template.dto';
import { Profile, ProfileDocument } from './schemas/profile.schema';
import {
  ProductTemplate,
  ProductTemplateDocument,
  TEMPLATE_PRODUCT_TYPES,
} from './schemas/product-template.schema';
import { SAMPLE_PROFILES, SAMPLE_TEMPLATES } from './sample-data';
import { validateShorterLengths } from './stock-lengths';

type TemplateShape = Pick<
  ProductTemplate,
  'productType' | 'systemType' | 'name' | 'minPanels' | 'maxPanels' | 'defaultPanels' | 'sizeBands'
>;

@Injectable()
export class MaterialsService implements OnModuleInit {
  private readonly logger = new Logger(MaterialsService.name);

  constructor(
    @InjectModel(Profile.name) private readonly profileModel: Model<ProfileDocument>,
    @InjectModel(ProductTemplate.name)
    private readonly templateModel: Model<ProductTemplateDocument>,
    private readonly bomService: BomService,
  ) {}

  /** Loads the sample catalogue once, so a fresh database can quote windows and doors. */
  async onModuleInit() {
    try {
      const [profileCount, templateCount] = await Promise.all([
        this.profileModel.estimatedDocumentCount(),
        this.templateModel.estimatedDocumentCount(),
      ]);
      if (profileCount === 0 && templateCount === 0) {
        await this.profileModel.insertMany(SAMPLE_PROFILES.map((p) => ({ ...p, isSample: true })));
        await this.templateModel.insertMany(SAMPLE_TEMPLATES.map((t) => ({ ...t, isSample: true })));
        this.logger.log(
          `Loaded sample material catalogue: ${SAMPLE_PROFILES.length} profiles, ${SAMPLE_TEMPLATES.length} product templates`,
        );
      }
    } catch (error) {
      this.logger.error('Could not load sample material catalogue', error as Error);
    }
  }

  // ---------- Profiles ----------

  findProfiles() {
    return this.profileModel.find().sort({ series: 1, code: 1 }).lean().exec();
  }

  async createProfile(dto: CreateProfileDto) {
    this.assertValidStockLengths(dto.barLengthFt, dto.shorterLengthsFt);
    try {
      return await this.profileModel.create({ ...dto, isSample: false });
    } catch (error) {
      throw this.mapDuplicate(error, `Profile code ${dto.code} already exists`);
    }
  }

  async updateProfile(id: string, dto: UpdateProfileDto) {
    const existing = await this.getProfileOrThrow(id);
    this.assertValidStockLengths(
      dto.barLengthFt ?? existing.barLengthFt,
      dto.shorterLengthsFt ?? existing.shorterLengthsFt,
    );

    if (dto.code && dto.code !== existing.code && (await this.isProfileUsed(existing.code))) {
      throw new ConflictException(
        `${existing.code} is used by product templates. Update those templates before renaming the code.`,
      );
    }

    try {
      return await this.profileModel
        .findByIdAndUpdate(id, { ...dto, isSample: false }, { new: true, runValidators: true })
        .lean()
        .exec();
    } catch (error) {
      throw this.mapDuplicate(error, `Profile code ${dto.code} already exists`);
    }
  }

  async deleteProfile(id: string) {
    const existing = await this.getProfileOrThrow(id);
    const usedBy = await this.templatesUsingProfile(existing.code);
    if (usedBy.length > 0) {
      throw new ConflictException(
        `${existing.code} is used by ${usedBy.join(', ')}. Remove it from those templates or deactivate it instead.`,
      );
    }
    await existing.deleteOne();
    return { deleted: true };
  }

  private assertValidStockLengths(barLengthFt: number, shorterLengthsFt?: number[]) {
    const error = validateShorterLengths(barLengthFt, shorterLengthsFt);
    if (error) throw new BadRequestException(error);
  }

  // ---------- Templates ----------

  findTemplates() {
    return this.templateModel.find().sort({ productType: 1, systemType: 1 }).lean().exec();
  }

  async findTemplate(id: string) {
    if (!isValidObjectId(id)) throw new NotFoundException('Template not found');
    const template = await this.templateModel.findById(id).lean().exec();
    if (!template) throw new NotFoundException('Template not found');
    return template;
  }

  async createTemplate(dto: CreateProductTemplateDto) {
    await this.assertValidTemplate(dto);
    try {
      return await this.templateModel.create({ ...dto, isSample: false });
    } catch (error) {
      throw this.mapDuplicate(
        error,
        `A ${dto.systemType} ${dto.productType} template already exists — edit that one instead`,
      );
    }
  }

  async updateTemplate(id: string, dto: UpdateProductTemplateDto) {
    const existing = await this.findTemplate(id);
    const merged = { ...existing, ...dto } as TemplateShape;
    await this.assertValidTemplate(merged);

    return this.templateModel
      .findByIdAndUpdate(id, { ...dto, isSample: false }, { new: true, runValidators: true })
      .lean()
      .exec();
  }

  async deleteTemplate(id: string) {
    const existing = await this.findTemplate(id);
    await this.templateModel.deleteOne({ _id: existing._id });
    return { deleted: true };
  }

  // ---------- Customer-facing ----------

  /** Opening systems a customer can choose for a product type. */
  async findSystems(productType?: string) {
    const filter: Record<string, unknown> = { isActive: true };
    if (productType) filter.productType = productType;

    const templates = await this.templateModel
      .find(filter)
      .select('productType systemType name description minPanels maxPanels defaultPanels')
      .sort({ systemType: 1 })
      .lean()
      .exec();
    return templates;
  }

  isBomProduct(productType?: string) {
    return !!productType && (TEMPLATE_PRODUCT_TYPES as readonly string[]).includes(productType);
  }

  async estimate(productType: string, systemType: string, input: BomInput): Promise<BomResult> {
    const template = await this.templateModel
      .findOne({ productType, systemType, isActive: true })
      .lean()
      .exec();
    if (!template) {
      throw new BadRequestException(`${systemType} ${productType}s are not available right now`);
    }
    return this.bomService.generate(template, input, await this.loadProfiles(template));
  }

  async preview(template: TemplateShape, input: BomInput): Promise<BomResult> {
    await this.assertValidTemplate(template);
    return this.bomService.generate(template, input, await this.loadProfiles(template));
  }

  // ---------- Helpers ----------

  private async loadProfiles(template: TemplateShape) {
    const codes = [...new Set(template.sizeBands.flatMap((band) => band.lines.map((l) => l.profileCode)))];
    const profiles = await this.profileModel.find({ code: { $in: codes } }).lean().exec();
    return new Map<string, Profile>(profiles.map((profile) => [profile.code, profile]));
  }

  private async assertValidTemplate(template: TemplateShape) {
    const errors: string[] = [];

    if (template.minPanels > template.maxPanels) {
      errors.push('Minimum panels cannot be more than maximum panels');
    }
    if (template.defaultPanels < template.minPanels || template.defaultPanels > template.maxPanels) {
      errors.push('Default panels must be between the minimum and maximum');
    }
    if (!template.sizeBands?.length) {
      errors.push('Add at least one size band');
    }

    const knownCodes = new Set(
      (await this.profileModel.find().select('code').lean().exec()).map((profile) => profile.code),
    );

    template.sizeBands?.forEach((band, bandIndex) => {
      const bandLabel = `Band ${bandIndex + 1} (${band.name})`;
      if (!band.lines?.length) errors.push(`${bandLabel}: add at least one cut-list line`);

      band.lines?.forEach((line, lineIndex) => {
        const lineLabel = `${bandLabel}, line ${lineIndex + 1} "${line.component}"`;
        if (!knownCodes.has(line.profileCode)) {
          errors.push(`${lineLabel}: unknown profile ${line.profileCode}`);
        }
        const quantityError = validateFormula(line.quantityFormula);
        if (quantityError) errors.push(`${lineLabel}: quantity — ${quantityError}`);
        const lengthError = validateFormula(line.lengthFormula);
        if (lengthError) errors.push(`${lineLabel}: length — ${lengthError}`);
      });
    });

    if (errors.length > 0) throw new BadRequestException(errors);
  }

  private async getProfileOrThrow(id: string) {
    if (!isValidObjectId(id)) throw new NotFoundException('Profile not found');
    const profile = await this.profileModel.findById(id).exec();
    if (!profile) throw new NotFoundException('Profile not found');
    return profile;
  }

  private async isProfileUsed(code: string) {
    return (await this.templatesUsingProfile(code)).length > 0;
  }

  private async templatesUsingProfile(code: string) {
    const templates = await this.templateModel
      .find({ 'sizeBands.lines.profileCode': code })
      .select('name')
      .lean()
      .exec();
    return templates.map((template) => template.name);
  }

  private mapDuplicate(error: unknown, message: string) {
    if ((error as { code?: number })?.code === 11000) return new ConflictException(message);
    return error;
  }
}
