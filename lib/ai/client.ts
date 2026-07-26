import { buildSystemPrompt } from './prompt';
import { AnalysisResultSchema, type AnalysisResult } from '@/lib/schemas';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GEMINI_API_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

type AiProvider = 'groq' | 'gemini';

interface AnalyzeOptions {
  imageBase64: string;
  mimeType: string;
  model?: AiProvider;
}

async function analyzeWithGroq(imageBase64: string, mimeType: string): Promise<unknown> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error('GROQ_API_KEY is not set');

  const response = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'qwen/qwen3.6-27b',
      messages: [
        {
          role: 'system',
          content: buildSystemPrompt(),
        },
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: {
                url: `data:${mimeType};base64,${imageBase64}`,
              },
            },
            {
              type: 'text',
              text: 'Analyze this UI screenshot and provide a detailed design critique.',
            },
          ],
        },
      ],
      temperature: 0.2,
      max_tokens: 4096,
      response_format: { type: 'json_object' },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Groq API error (${response.status}): ${error}`);
  }

  const data = await response.json();
  return JSON.parse(data.choices?.[0]?.message?.content || '{}');
}

async function analyzeWithGemini(imageBase64: string, mimeType: string): Promise<unknown> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY is not set');

  const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        {
          role: 'user',
          parts: [
            {
              inlineData: {
                mimeType,
                data: imageBase64,
              },
            },
            {
              text: buildSystemPrompt(),
            },
            {
              text: 'Analyze this UI screenshot and provide a detailed design critique. Respond with valid JSON only.',
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 4096,
        responseMimeType: 'application/json',
      },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Gemini API error (${response.status}): ${error}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
  return JSON.parse(text);
}

export async function analyzeImage(options: AnalyzeOptions): Promise<AnalysisResult> {
  const { imageBase64, mimeType, model = 'groq' } = options;

  const providers: { name: AiProvider; fn: () => Promise<unknown> }[] = [
    {
      name: 'groq',
      fn: () => analyzeWithGroq(imageBase64, mimeType),
    },
    {
      name: 'gemini',
      fn: () => analyzeWithGemini(imageBase64, mimeType),
    },
  ];

  const orderedProviders = model === 'gemini' ? providers.reverse() : providers;

  let lastError: Error | null = null;

  for (const provider of orderedProviders) {
    try {
      const raw = await provider.fn();
      const result = AnalysisResultSchema.parse(raw);
      return result;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');
      console.warn(`${provider.name} failed:`, lastError.message);
    }
  }

  console.error('All AI providers failed:', lastError?.message);
  throw lastError ?? new Error('All AI providers failed');
}

// Groq/Gemini error bodies are raw provider JSON (quota metrics, internal
// rate-limit URLs, RetryInfo blobs, ...) — never fit to show a user. Call
// sites (API routes) should log the real Error server-side and send only
// this sanitized string to the client.
export function toFriendlyAiErrorMessage(error: unknown): string {
  const raw = error instanceof Error ? error.message : String(error);
  const lower = raw.toLowerCase();

  if (
    lower.includes('429') ||
    lower.includes('resource_exhausted') ||
    lower.includes('quota') ||
    lower.includes('rate limit')
  ) {
    return "Our AI provider is rate-limited right now — please try again in a minute.";
  }

  if (
    lower.includes('401') ||
    lower.includes('403') ||
    lower.includes('api key') ||
    lower.includes('api_key') ||
    lower.includes('unauthorized')
  ) {
    return "There's a configuration issue with our AI provider — we've been notified.";
  }

  return "The analysis didn't come back as expected — please try again.";
}
