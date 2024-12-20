import { Message } from './message.model';

export interface Conversation {
  conversation_id?: string;
  username: string;
  messages: Message[];
  description?: string;
  project_id?: string;
  updated_at?: Date;
} 