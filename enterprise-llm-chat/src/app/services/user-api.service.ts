import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Conversation } from '../models/conversation.model';

@Injectable({
  providedIn: 'root'
})
export class UserApiService {
  private readonly API_URL = 'http://localhost:8000';

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
} 