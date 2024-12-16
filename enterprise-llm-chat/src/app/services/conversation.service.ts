import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Conversation, Message } from '@models';
import { environment } from 'environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ConversationService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

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