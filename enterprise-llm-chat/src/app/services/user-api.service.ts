import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ApiKeyUpdate {
  service: 'jira';
  key: string;
}

export interface SignupData {
  username: string;
  password: string;
  email: string;
  firstName: string;
  lastName: string;
  signupCode: string;
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

  signup(userData: SignupData): Observable<any> {
    return this.http.post(`${this.API_URL}/signup/`, userData);
  }

  updateApiKey(service: string, key: string): Observable<any> {
    return this.http.post(`${this.API_URL}/api-keys/update`, { service, key });
  }

  getApiKeys(): Observable<any> {
    return this.http.get(`${this.API_URL}/api-keys`);
  }
}