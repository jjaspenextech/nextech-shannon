import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Conversation, Message } from '@models';
import { environment } from 'environments/environment';
import { LLMService } from './llm.service';

@Injectable({
  providedIn: 'root'
})
export class ConversationService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private http: HttpClient, private llmService: LLMService) {}

  getProjectConversations(projectId: string): Observable<Conversation[]> {
    return this.http.get<Conversation[]>(`${this.apiUrl}/projects/${projectId}/conversations`);
  }

  createConversation(conversation: Conversation, firstMessage: Message): Observable<Conversation> {
    return this.http.post<Conversation>(`${this.apiUrl}/conversations`, {
      conversation,
      message: firstMessage
    });
  }

  getProjectConversationSummaries(projectId: string): Observable<Conversation[]> {
    return this.http.get<Conversation[]>(
      `${this.apiUrl}/projects/${projectId}/conversation-summaries`
    );
  }

  async startConversation(userMessage: string) {
    try {
      // Initiate both LLM calls in parallel
      const [descriptionPromise, responsePromise] = await Promise.all([
        this.llmService.getDescription(userMessage),
        this.llmService.getResponse(userMessage)
      ]);

      // Wait for the description to complete
      const description = await descriptionPromise;
      let conversation = await this.saveConversationWithDescription(userMessage, description);

      // Check if the response is ready
      const response = await responsePromise;
      if (response && conversation.conversation_id) {
        // Update the conversation with the LLM response
        conversation = await this.updateConversationWithResponse(conversation.conversation_id, response);
      }
    } catch (error) {
      console.error('Error starting conversation:', error);
    }
  }

  private async saveConversationWithDescription(userMessage: string, description: string): Promise<Conversation> {
    const conversation: Conversation = {
      conversation_id: '1',
      username: 'user', // Placeholder username
      messages: [{ content: userMessage, role: 'user', sequence: 1 }]
    };
    // Save the conversation using the API
    return this.http.post<Conversation>(`${this.apiUrl}/conversations`, conversation).toPromise().then(res => res as Conversation);
  }

  private async updateConversationWithResponse(conversationId: string, response: string): Promise<Conversation> {
    const conversation: Conversation = {
      conversation_id: conversationId,
      username: 'user', // Placeholder username
      messages: [{ content: response, role: 'assistant', sequence: 2 }]
    };
    // Update the conversation using the API
    return this.http.put<Conversation>(`${this.apiUrl}/conversations/${conversationId}`, conversation).toPromise().then(res => res as Conversation);
  }
} 