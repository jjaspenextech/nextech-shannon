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
      pattern: /@jira:([A-Z]+-\d+)/g,
      execute: async (text: string) => {
        const matches = text.matchAll(/@jira:([A-Z]+-\d+)/g);
        const results: CommandResult[] = [];
        for (const match of matches) {
          const ticketId = match[1];
          try {
            const response = await firstValueFrom(
              this.http.get(`${this.apiUrl}/jira/story/${ticketId}`)
            );
            // if the response is a string, just use it as the content
            // otherwise, stringify the response
            const content = typeof response === 'string' ? response : JSON.stringify(response);
            results.push({
              type: 'jira',
              content: content,
            });
          } catch (error) {
            results.push({
              type: 'jira',
              content: null,
              error: 'Failed to fetch Jira ticket',
            });
          }
        }
        return results;
      },
    });

    // Web Scraping Handler
    this.registerHandler('web', {
      pattern: /@web:(https?:\/\/[^\s]+)/g,
      execute: async (text: string) => {
        const matches = text.matchAll(/@web:(https?:\/\/[^\s]+)/g);
        const results: CommandResult[] = [];
        for (const match of matches) {
          const url = match[1];
          try {
            const response = await firstValueFrom(
              this.http.get<{ content: string }>(`${this.apiUrl}/web/scrape/`, { params: { url } })
            );
            results.push({
              type: 'web',
              content: response?.content || 'Failed to scrape web content',
            });
          } catch (error) {
            results.push({
              type: 'web',
              content: null,
              error: 'Failed to scrape web content',
            });
          }
        }
        return results;
      },
    });
  }
}
