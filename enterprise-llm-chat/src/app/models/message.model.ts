export interface Message {
  message_id?: string;
  conversation_id?: string;
  content?: string;
  context?: any[];
  sequence: number;
  formattedContent?: string;
  role: string;
  description?: string;
} 