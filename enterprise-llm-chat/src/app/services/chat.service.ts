import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ContextResult, Conversation, Message } from '@models';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private readonly API_URL = environment.apiUrl;
  private initialMessage: Message | null = null;
  private projectId: string | null = null;

  constructor(private http: HttpClient) {}

  processFileContext(file: File): Observable<ContextResult> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<ContextResult>(`${this.API_URL}/process-file`, formData);
  }

  setInitialMessage(message: string, contexts: ContextResult[]) {
    this.initialMessage = {
      role: 'user',
      content: message,
      contexts: contexts,
      sequence: 1
    };
  }

  setProjectId(id: string | null) {
    this.projectId = id;
  }

  getConversation(conversationId: string): Observable<Conversation> {
    return this.http.get<Conversation>(`${this.API_URL}/get-conversation/${conversationId}`);
  }

  getInitialMessage(): Message | null {
    const message = this.initialMessage;
    this.initialMessage = null; // Clear it after retrieving
    return message;
  }

  getProjectId(): string | null {
    return this.projectId;
  }

  saveConversation(conversation: Conversation): Observable<any> {
    return this.http.post(`${this.API_URL}/save-conversation`, conversation);
  }
} 