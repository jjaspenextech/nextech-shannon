import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LLMService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  async getDescription(userMessage: string, projectId?: string): Promise<string> {
    try {
      const response = await this.http.post<{ description: string }>(
        `${this.apiUrl}/llm-query/description`,
        { prompt: userMessage, project_id: projectId }
      ).toPromise();
      return response?.description || 'No description available';
    } catch (error) {
      console.error('Error fetching description:', error);
      return 'Error fetching description';
    }
  }
} 