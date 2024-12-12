import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Conversation } from '@models';
import { environment } from '../../environments/environment';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private readonly API_URL = environment.apiUrl;
  private initialMessage: string | null = null;

  constructor(private cookieService: CookieService, private http: HttpClient) {}

  setInitialMessage(message: string) {
    this.initialMessage = message;
  }

  getConversation(conversationId: string): Observable<Conversation> {
    return this.http.get<Conversation>(`${this.API_URL}/get-conversation/${conversationId}`);
  }

  getInitialMessage(): string | null {
    const message = this.initialMessage;
    this.initialMessage = null; // Clear it after retrieving
    return message;
  }

  saveConversation(conversation: Conversation): Observable<any> {
    return this.http.post(`${this.API_URL}/save-conversation`, conversation);
  }
} 