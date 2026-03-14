export type ChatRole = 'user' | 'assistant' | 'error' | 'thinking';

export interface ChatMessage {
  id: string;
  role: ChatRole;
  text: string;
}
