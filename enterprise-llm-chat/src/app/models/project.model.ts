import { ContextResult } from '@models';

export interface Project {
  project_id?: string;
  name: string;
  description?: string;
  contexts: ContextResult[];
  conversations: string[];  // List of conversation IDs associated with this project
  username?: string;        // Optional user association
  is_public: boolean;       // Indicates if the project is public
  updated_at: Date;
}
