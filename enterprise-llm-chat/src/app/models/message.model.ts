import { CommandResult } from "@models";

export interface Message {
  message_id?: string;
  conversation_id?: string;
  content?: string;
  contexts?: CommandResult[];
  sequence: number;
  formattedContent?: string;
  role: string;
  description?: string;
  pending?: boolean;
} 