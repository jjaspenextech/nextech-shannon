import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Conversation } from '../models/conversation.model';
import { environment } from '../../environments/environment';

export interface ApiKeyUpdate {
  service: 'jira';
  key: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserApiService {
  private readonly API_URL = environment.apiUrl;

  constructor(private http: HttpClient) {}

  login(credentials: { username: string; password: string }): Observable<any> {
    return this.http.post(`${this.API_URL}/login/`, credentials);
  }

  signup(userData: { username: string; password: string; email: string; firstName: string; lastName: string }): Observable<any> {
    return this.http.post(`${this.API_URL}/signup/`, userData);
  }

  saveConversation(conversation: Conversation): Observable<any> {
    return this.http.post(`${this.API_URL}/save-conversation/`, conversation);
  }

  getConversation(username: string): Observable<Conversation> {
    return this.http.get<Conversation>(`${this.API_URL}/get-conversation/${username}`);
  }

  getConversations(username: string): Observable<Conversation[]> {
    return this.http.get<Conversation[]>(`${this.API_URL}/conversations/${username}`);
  }

  updateApiKey(service: string, key: string): Observable<any> {
    return this.http.post(`${this.API_URL}/api-keys/update`, { service, key });
  }

  getApiKeys(): Observable<any> {
    return this.http.get(`${this.API_URL}/api-keys`);
  }
} 