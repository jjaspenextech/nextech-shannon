import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Conversation } from '../models/conversation.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ConversationApiService {
  private readonly API_URL = environment.apiUrl;

  constructor(private http: HttpClient) {}

  saveConversation(conversation: Conversation): Observable<any> {
    return this.http.post(`${this.API_URL}/conversation/`, conversation);
  }

  getConversation(conversationId: string): Observable<Conversation> {
    return this.http.get<Conversation>(`${this.API_URL}/conversation/${conversationId}`);
  }

  getConversations(username: string): Observable<Conversation[]> {
    return this.http.get<Conversation[]>(`${this.API_URL}/conversations/${username}`);
  }
} 