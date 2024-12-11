import { Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';

export interface ChatMessage {
  type: 'user' | 'bot';
  content: string;
  formattedContent?: string;
}

interface ApiMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private readonly API_URL = 'http://localhost:8000';

  constructor(private cookieService: CookieService) {}

  async streamChatResponse(messages: ChatMessage[]): Promise<ReadableStreamDefaultReader<Uint8Array>> {
    // Convert our frontend messages to API format
    const apiMessages: ApiMessage[] = messages.map(msg => ({
      role: msg.type === 'user' ? 'user' : 'assistant',
      content: msg.content
    }));

    const authToken = this.cookieService.get('authToken');
    const response = await fetch(`${this.API_URL}/llm-query/stream/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json',
        "Authorization": `Bearer ${authToken}`
       },
      body: JSON.stringify({ messages: apiMessages })
    });

    if (!response.body) {
      throw new Error('No response body received');
    }

    return response.body.getReader();
  }

  async processStreamResponse(
    reader: ReadableStreamDefaultReader<Uint8Array>,
    onChunk: (chunk: string) => void,
    onDone: () => void
  ): Promise<void> {
    const decoder = new TextDecoder();

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          onDone();
          break;
        }

        const chunk = decoder.decode(value);
        const lines = chunk.split('\r');

        for (const line of lines) {
          if (line === '[DONE]') {
            onDone();
            break;
          } else if (line === '') {
            onChunk('');
          } else {
            onChunk(line);
          }
        }
      }
    } catch (error) {
      console.error('Error processing stream:', error);
      throw error;
    }
  }
} 