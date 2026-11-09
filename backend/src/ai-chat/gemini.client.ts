import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * Minimal Google Gemini REST client (free tier via Google AI Studio).
 * Uses the REST API directly so no extra SDK dependency is needed.
 * Docs: https://ai.google.dev/api/generate-content
 */

export type GeminiPart =
  | { text: string; thoughtSignature?: string }
  | { inlineData: { mimeType: string; data: string } }
  | { functionCall: { name: string; args?: Record<string, unknown> }; thoughtSignature?: string }
  | { functionResponse: { name: string; response: Record<string, unknown> } };

export interface GeminiContent {
  role: 'user' | 'model';
  parts: GeminiPart[];
}

export interface GeminiFunctionDeclaration {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
}

/** Overloaded, retired or rate-limited models — worth trying the next model. */
const RETRYABLE = new Set([404, 429, 500, 503]);

export class GeminiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

@Injectable()
export class GeminiClient {
  private readonly logger = new Logger(GeminiClient.name);
  private readonly apiKey: string | undefined;
  private readonly models_: string[];

  constructor(config: ConfigService) {
    this.apiKey = config.get<string>('GEMINI_API_KEY');
    const primary = config.get<string>('GEMINI_MODEL', 'gemini-3.5-flash');
    const fallbacks = config
      .get<string>('GEMINI_FALLBACK_MODELS', 'gemini-3.5-flash-lite,gemini-3.1-flash-lite')
      .split(',')
      .map((m) => m.trim())
      .filter(Boolean);
    this.models_ = [...new Set([primary, ...fallbacks])];
    if (!this.apiKey) {
      this.logger.warn('GEMINI_API_KEY is not set — the AI assistant will be unavailable.');
    }
  }

  get isConfigured() {
    return !!this.apiKey;
  }

  /** Primary model first, then fallbacks (GEMINI_MODEL, GEMINI_FALLBACK_MODELS). */
  get models(): string[] {
    return this.models_;
  }

  static isRetryable(status: number) {
    return RETRYABLE.has(status);
  }

  /** One generateContent call on a given model, retried once after a short pause if it is overloaded. */
  async generate(params: {
    model: string;
    systemInstruction: string;
    contents: GeminiContent[];
    tools?: GeminiFunctionDeclaration[];
  }): Promise<GeminiContent> {
    if (!this.apiKey) throw new GeminiError('AI assistant is not configured', 503);
    try {
      return await this.call(params.model, params);
    } catch (err) {
      if (!(err instanceof GeminiError) || ![500, 503].includes(err.status)) throw err;
      await new Promise((r) => setTimeout(r, 1500));
      return this.call(params.model, params);
    }
  }

  private async call(
    model: string,
    params: { systemInstruction: string; contents: GeminiContent[]; tools?: GeminiFunctionDeclaration[] },
  ): Promise<GeminiContent> {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
    const body: Record<string, unknown> = {
      systemInstruction: { parts: [{ text: params.systemInstruction }] },
      contents: params.contents,
      generationConfig: { temperature: 0.4, maxOutputTokens: 2048 },
    };
    if (params.tools?.length) {
      body.tools = [{ functionDeclarations: params.tools }];
    }

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': this.apiKey! },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(45_000),
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => '');
      this.logger.error(`Gemini ${model} ${res.status}: ${detail.slice(0, 300)}`);
      throw new GeminiError(`Gemini request failed (${res.status})`, res.status);
    }

    const json: any = await res.json();
    const content = json?.candidates?.[0]?.content as GeminiContent | undefined;
    if (!content?.parts?.length) {
      const reason = json?.promptFeedback?.blockReason || json?.candidates?.[0]?.finishReason;
      this.logger.warn(`Gemini returned no content (${reason ?? 'unknown'})`);
      return { role: 'model', parts: [{ text: '' }] };
    }
    return { role: 'model', parts: content.parts };
  }
}
