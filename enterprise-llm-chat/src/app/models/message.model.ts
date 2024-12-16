import { ContextResult } from "@models";

export interface Message {
  message_id?: string;
  conversation_id?: string;
  content?: string;
  contexts?: ContextResult[];
  sequence: number;
  formattedContent?: string;
  role: string;
  description?: string;
  pending?: boolean;
  timestamp?: string;
} 