import { ContextResult } from "./context.model";

export interface CommandHandler {
  getMatches: (text: string) => string[];
  execute: (text: string) => Promise<ContextResult>;
} 