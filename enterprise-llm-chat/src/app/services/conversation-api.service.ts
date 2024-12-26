import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Conversation } from '../models/conversation.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ConversationApiService {
  private readonly API_URL = environment.apiUrl;
  private conversationCache: { [username: string]: Conversation[] } = {};

  constructor(private http: HttpClient) {}

  saveConversation(conversation: Conversation): Observable<any> {
    return this.http.post(`${this.API_URL}/conversation/`, conversation).pipe(
      tap(() => {
        // Invalidate cache for the user when a new conversation is created
        if (conversation.username) {
          delete this.conversationCache[conversation.username];
        }
      })
    );
  }

  getConversation(conversationId: string): Observable<Conversation> {
    return this.http.get<Conversation>(`${this.API_URL}/conversation/${conversationId}`);
  }

  getConversations(username: string): Observable<Conversation[]> {
    if (this.conversationCache[username]) {
      // Return cached conversations if available
      return of(this.conversationCache[username]);
    }

    return this.http.get<Conversation[]>(`${this.API_URL}/conversations/${username}`).pipe(
      tap(conversations => {
        // Cache the conversations for the user
        this.conversationCache[username] = conversations;
      })
    );
  }
} 