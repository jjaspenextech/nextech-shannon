import { Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { Message } from '@models';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class StreamingService {
  private readonly API_URL = environment.apiUrl;

  constructor(private cookieService: CookieService) {}

  async streamChatResponse(messages: Message[]): Promise<ReadableStreamDefaultReader<Uint8Array>> {
    const apiMessages = messages.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: msg.content,
      sequence: msg.sequence
    }));

    const authToken = this.cookieService.get('authToken');
    const response = await fetch(`${this.API_URL}/llm-query/stream/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` },
      body: JSON.stringify({ messages: apiMessages })
    });

    if (!response.body) {
      throw new Error('No response body received');
    }

    // if response is 422, throw error
    if (response.status === 422) {
      throw new Error('Invalid request');
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