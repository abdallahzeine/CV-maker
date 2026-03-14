export type AIProvider = 'openai' | 'lmstudio' | 'ollama' | 'openrouter' | 'google-genai';

export interface AISettings {
  provider: AIProvider;
  model: string;
  apiKey: string;
  baseUrl?: string;
}

export interface ProviderConfig {
  id: AIProvider;
  name: string;
  description: string;
  requiresApiKey: boolean;
  defaultBaseUrl?: string;
  models: ModelInfo[];
}

export interface ModelInfo {
  id: string;
  name: string;
  description?: string;
}
