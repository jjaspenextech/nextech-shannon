import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommandHandler, ContextResult } from '@models';
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
      getMatches: (text: string) => {
        const pattern = /@jira:([A-Z]+-\d+)/g;
        const matches = text.matchAll(pattern);
        return Array.from(matches, (match) => match[1]);
      },
      execute: async (text: string) => {
        try {
          const response = await firstValueFrom(
            this.http.get(`${this.apiUrl}/jira/story/${text}`)
          );
          // if the response is a string, just use it as the content
          // otherwise, stringify the response
          const content =
            typeof response === 'string' ? response : JSON.stringify(response);
          return {
            type: 'jira',
            content: content
          } as ContextResult;
        } catch (error) {
          return {
            type: 'jira',
            content: null,
            error: 'Failed to fetch Jira ticket'
          } as ContextResult;
        }
      },
    });

    // Web Scraping Handler
    this.registerHandler('web', {
      getMatches: (text: string) => {
        const pattern = /@web:(https?:\/\/[^\s]+)/g;
        const matches = text.matchAll(pattern);
        return Array.from(matches, (match) => match[1]);
      },
      execute: async (text: string) => {
        try {
          const response = await firstValueFrom(
            this.http.get<{ content: string }>(`${this.apiUrl}/web/scrape/`, {
              params: { url:text },
            })
          );
          return {
            type: 'web',
            content: response?.content || 'Failed to scrape web content',
          } as ContextResult;
        } catch (error) {
          return {
            type: 'web',
            content: null,
            error: 'Failed to scrape web content',
          } as ContextResult;
        }
      },
    });
  }
}
