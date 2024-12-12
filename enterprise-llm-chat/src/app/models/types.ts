export interface CommandResult {
  type: string;
  content: any;
  error?: string;
}

export interface CommandHandler {
  pattern: RegExp;
  execute: (text: string) => Promise<CommandResult[]>;
} 