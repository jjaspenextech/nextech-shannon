import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Project } from '@models';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  private readonly API_URL = environment.apiUrl;

  constructor(private http: HttpClient) {}

  createProject(project: Project): Observable<Project> {
    return this.http.post<Project>(`${this.API_URL}/project/`, project);
  }

  getProject(projectId: string): Observable<Project> {
    return this.http.get<Project>(`${this.API_URL}/project/${projectId}`);
  }

  updateProject(project: Project): Observable<Project> {
    return this.http.put<Project>(`${this.API_URL}/project/`, project);
  }

  deleteProject(projectId: string): Observable<any> {
    return this.http.delete(`${this.API_URL}/project/${projectId}`);
  }

  listProjects(): Observable<Project[]> {
    return this.http.get<Project[]>(`${this.API_URL}/projects/`);
  }

  listUserProjects(): Observable<Project[]> {
    return this.http.get<Project[]>(`${this.API_URL}/projects/user/`);
  }

  listPublicProjects(): Observable<Project[]> {
    return this.http.get<Project[]>(`${this.API_URL}/projects/public/`);
  }
} 