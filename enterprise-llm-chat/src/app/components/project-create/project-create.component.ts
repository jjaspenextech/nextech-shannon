import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ProjectService } from '../../services/project.service';
import { Project } from '@models';

@Component({
  selector: 'app-project-create',
  templateUrl: './project-create.component.html',
  styleUrls: ['./project-create.component.css']
})
export class ProjectCreateComponent {
  projectName: string = '';
  projectDescription: string = '';

  constructor(private projectService: ProjectService, private router: Router) {}

  createProject(): void {
    const newProject: Project = {
      name: this.projectName,
      description: this.projectDescription,
      contexts: [],
      conversations: [],
      is_public: false,
      updated_at: new Date().toISOString()
    };

    this.projectService.createProject(newProject).subscribe({
      next: () => this.router.navigate(['/projects']),
      error: (err) => console.error('Failed to create project', err)
    });
  }

  cancel(): void {
    this.router.navigate(['/projects']);
  }
} 