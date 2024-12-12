import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommandHandler, CommandResult } from './types';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class CommandRegistryService {
  private apiUrl = environment.apiUrl;
  private handlers = new Map<string, CommandHandler>();

  constructor(private http: HttpClient) {
    this.registerDefaultHandlers();
  }

  registerHandler(type: string, handler: CommandHandler) {
    this.handlers.set(type, handler);
  }

  getHandlers(): Map<string, CommandHandler> {
    return this.handlers;
  }

  private registerDefaultHandlers() {
    // Jira Handler
    this.registerHandler('jira', {
      pattern: /@jira:([A-Z]+-\d+)/,
      execute: async (match: RegExpMatchArray) => {
        const ticketId = match[1];
        try {
          const response = await this.http
            .get(`${this.apiUrl}/jira/story/${ticketId}`)
            .toPromise();
          return {
            type: 'jira',
            content: response,
          };
        } catch (error) {
          return {
            type: 'jira',
            content: null,
            error: 'Failed to fetch Jira ticket',
          };
        }
      },
    });
  }
}
