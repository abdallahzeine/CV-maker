import type { ProviderConfig } from '../types';

export const SERVER_URL = 'http://localhost:3001';

export const QUICK_ACTIONS = [
  { label: 'Optimize for ATS', prompt: 'Optimize my CV for ATS systems — improve keywords and formatting' },
  { label: 'Fix Grammar', prompt: 'Fix any grammar and spelling mistakes throughout my CV' },
  { label: 'Suggest Skills', prompt: 'Suggest additional relevant skills I should add to my CV' },
  { label: 'Summarize Experience', prompt: 'Rewrite my professional summary to better highlight my experience' },
];

export const AI_PROVIDERS: ProviderConfig[] = [
  {
    id: 'openai',
    name: 'OpenAI',
    description: 'OpenAI API - GPT-4, GPT-3.5 models',
    requiresApiKey: true,
    models: [
      { id: 'gpt-4o', name: 'GPT-4o', description: 'Most capable multimodal model' },
      { id: 'gpt-4o-mini', name: 'GPT-4o Mini', description: 'Fast and affordable' },
      { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', description: 'High capability model' },
      { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', description: 'Fast and cost-effective' },
    ],
  },
  {
    id: 'google-genai',
    name: 'Google GenAI',
    description: 'Google Gemini models',
    requiresApiKey: true,
    models: [
      { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', description: 'Fast and efficient' },
      { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', description: 'Advanced reasoning' },
      { id: 'gemini-1.5-flash-8b', name: 'Gemini 1.5 Flash 8B', description: 'Lightweight model' },
    ],
  },
  {
    id: 'openrouter',
    name: 'OpenRouter',
    description: 'Access multiple AI models through one API',
    requiresApiKey: true,
    models: [
      { id: 'anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet', description: 'Balanced performance' },
      { id: 'anthropic/claude-3-opus', name: 'Claude 3 Opus', description: 'Most capable Claude' },
      { id: 'openai/gpt-4o', name: 'GPT-4o (via OpenRouter)', description: 'OpenAI via OpenRouter' },
      { id: 'meta-llama/llama-3.1-70b-instruct', name: 'Llama 3.1 70B', description: 'Open source model' },
      { id: 'mistralai/mistral-large', name: 'Mistral Large', description: 'Mistral\'s best model' },
    ],
  },
  {
    id: 'lmstudio',
    name: 'LM Studio',
    description: 'Local models via LM Studio',
    requiresApiKey: false,
    defaultBaseUrl: 'http://localhost:1234/v1',
    models: [
      { id: 'local-model', name: 'Local Model', description: 'Your loaded LM Studio model' },
    ],
  },
  {
    id: 'ollama',
    name: 'Ollama',
    description: 'Local models via Ollama',
    requiresApiKey: false,
    defaultBaseUrl: 'http://localhost:11434',
    models: [
      { id: 'llama3.1', name: 'Llama 3.1', description: 'Meta\'s Llama 3.1' },
      { id: 'llama3.2', name: 'Llama 3.2', description: 'Meta\'s Llama 3.2' },
      { id: 'mistral', name: 'Mistral', description: 'Mistral 7B model' },
      { id: 'qwen2.5', name: 'Qwen 2.5', description: 'Alibaba Qwen 2.5' },
      { id: 'deepseek-coder', name: 'DeepSeek Coder', description: 'Code-specialized model' },
      { id: 'phi4', name: 'Phi-4', description: 'Microsoft Phi-4' },
      { id: 'codellama', name: 'CodeLlama', description: 'Code-specialized Llama' },
    ],
  },
];

export const DEFAULT_SETTINGS = {
  provider: 'openai' as const,
  model: 'gpt-4o-mini',
  apiKey: '',
};
