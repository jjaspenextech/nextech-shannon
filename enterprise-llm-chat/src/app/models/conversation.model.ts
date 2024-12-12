import { ChatMessage } from '../services/chat.service';

export interface Conversation {
  conversation_id?: string;
  username: string;
  messages: ChatMessage[];
  description?: string;
} 