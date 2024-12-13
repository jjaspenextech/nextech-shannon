export interface CommandResult {
  type: string;
  content: any;
  error?: string;
  match?: string;
}

export interface CommandHandler {
  getMatches: (text: string) => string[];
  execute: (text: string) => Promise<CommandResult>;
} 