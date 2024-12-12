import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommandHandler, CommandResult } from '@models';
import { environment } from '../../environments/environment';
import { firstValueFrom } from 'rxjs';

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
          const response = await firstValueFrom(
            this.http.get(`${this.apiUrl}/jira/story/${ticketId}`)
          );
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

    // Web Scraping Handler
    this.registerHandler('web', {
      pattern: /@web:(https?:\/\/[^\s]+)/,
      execute: async (match: RegExpMatchArray) => {
        const url = match[1];
        try {
          const response = await firstValueFrom(
            this.http.get<{ content: string }>(`${this.apiUrl}/web/scrape/`, { params: { url } })
          );
          return {
            type: 'web',
            content: response?.content || 'Failed to scrape web content',
          };
        } catch (error) {
          return {
            type: 'web',
            content: null,
            error: 'Failed to scrape web content',
          };
        }
      },
    });
  }
}
