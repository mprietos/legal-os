import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';

export type AIProvider = 'anthropic' | 'gemini';

export interface AIGenerationOptions {
  provider?: AIProvider;
  maxTokens?: number;
}

/**
 * Clase unificada para generar texto con diferentes proveedores de IA
 */
export class AIService {
  private static anthropic?: Anthropic;
  private static gemini?: GoogleGenerativeAI;

  private static getAnthropic(): Anthropic {
    if (!this.anthropic) {
      this.anthropic = new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY,
      });
    }
    return this.anthropic;
  }

  private static getGemini(): GoogleGenerativeAI {
    if (!this.gemini) {
      this.gemini = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '');
    }
    return this.gemini;
  }

  /**
   * Detecta qué proveedor usar basado en las variables de entorno
   */
  private static getDefaultProvider(): AIProvider {
    if (process.env.ANTHROPIC_API_KEY) return 'anthropic';
    if (process.env.GOOGLE_AI_API_KEY) return 'gemini';

    throw new Error('No AI provider configured. Set ANTHROPIC_API_KEY or GOOGLE_AI_API_KEY');
  }

  /**
   * Genera texto con el proveedor seleccionado
   */
  static async generateText(
    prompt: string,
    options: AIGenerationOptions = {}
  ): Promise<string> {
    const provider = options.provider || this.getDefaultProvider();
    const maxTokens = options.maxTokens || 4000;

    try {
      if (provider === 'anthropic') {
        return await this.generateWithAnthropic(prompt, maxTokens);
      } else {
        return await this.generateWithGemini(prompt, maxTokens);
      }
    } catch (error: any) {
      console.error(`Error with ${provider}:`, error);

      // Fallback: si falla un proveedor, intenta con el otro
      const fallbackProvider = provider === 'anthropic' ? 'gemini' : 'anthropic';

      if (this.isProviderAvailable(fallbackProvider)) {
        console.log(`Trying fallback to ${fallbackProvider}`);

        if (fallbackProvider === 'anthropic') {
          return await this.generateWithAnthropic(prompt, maxTokens);
        } else {
          return await this.generateWithGemini(prompt, maxTokens);
        }
      }

      throw error;
    }
  }

  /**
   * Verifica si un proveedor está configurado
   */
  private static isProviderAvailable(provider: AIProvider): boolean {
    if (provider === 'anthropic') {
      return !!process.env.ANTHROPIC_API_KEY;
    }
    return !!process.env.GOOGLE_AI_API_KEY;
  }

  /**
   * Genera texto con Anthropic Claude
   */
  private static async generateWithAnthropic(
    prompt: string,
    maxTokens: number
  ): Promise<string> {
    const anthropic = this.getAnthropic();

    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: maxTokens,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const content = message.content[0];
    if (content.type === 'text') {
      return content.text;
    }

    throw new Error('Invalid response from Anthropic');
  }

  /**
   * Genera texto con Google Gemini con reintentos y fallback
   */
  private static async generateWithGemini(
    prompt: string,
    maxTokens: number
  ): Promise<string> {
    const gemini = this.getGemini();
    const models = ['gemini-flash-latest', 'gemini-flash-lite-latest'];
    const maxRetries = 2;
    let lastError: any;

    for (const modelName of models) {
      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
          const model = gemini.getGenerativeModel({
            model: modelName,
            generationConfig: {
              maxOutputTokens: maxTokens,
              temperature: 0.7,
            },
          });

          const result = await model.generateContent(prompt);
          const response = result.response;
          const text = response.text();

          if (!text) {
            throw new Error('Invalid response from Gemini');
          }

          return text;
        } catch (error: any) {
          lastError = error;
          const status = error.status || (error.message?.includes('503') ? 503 : (error.message?.includes('429') ? 429 : null));

          if (status === 503 || status === 429) {
            console.warn(`Gemini ${modelName} attempt ${attempt + 1} failed with ${status}. ${attempt < maxRetries ? 'Retrying...' : (modelName === models[0] ? 'Trying fallback...' : '')}`);
            if (attempt < maxRetries) {
              // Exponential backoff: 1s, 2s
              await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
              continue;
            }
          } else {
            // Unrecoverable error for this model, break retry loop to try next model or throw
            console.error(`Gemini ${modelName} failed with unrecoverable error:`, error.message);
            break;
          }
        }
      }
    }

    throw lastError || new Error('Failed to generate text with Gemini');
  }

  /**
   * Obtiene información del proveedor activo
   */
  static getActiveProvider(): {
    provider: AIProvider;
    model: string;
    available: AIProvider[];
  } {
    const available: AIProvider[] = [];

    if (process.env.ANTHROPIC_API_KEY) available.push('anthropic');
    if (process.env.GOOGLE_AI_API_KEY) available.push('gemini');

    const provider = this.getDefaultProvider();
    const model = provider === 'anthropic'
      ? 'claude-3-5-sonnet-20241022'
      : 'gemini-flash-latest';

    return { provider, model, available };
  }
}
