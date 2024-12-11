import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

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
} 