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
} 