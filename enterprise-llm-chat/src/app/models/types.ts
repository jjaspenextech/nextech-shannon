export interface CommandResult {
  type: string;
  content: any;
  error?: string;
}

export interface CommandHandler {
  pattern: RegExp;
  execute: (match: RegExpMatchArray) => Promise<CommandResult>;
  previewComponent?: any; // Optional: Component type for custom preview
} 