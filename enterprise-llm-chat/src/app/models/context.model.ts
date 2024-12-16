export interface ContextResult {
    type: string;
    name?: string;
    content: any;
    error?: string;
    match?: string;
    project_id?: string;
    message_id?: string;
  }