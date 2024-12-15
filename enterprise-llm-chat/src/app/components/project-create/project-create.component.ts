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
  error: string | null = null;

  constructor(private projectService: ProjectService, private router: Router) {}

  createProject(): void {
    if (!this.projectName.trim() || !this.projectDescription.trim()) {
      this.error = 'Please fill in all fields';
      return;
    }

    const newProject: Project = {
      name: this.projectName.trim(),
      description: this.projectDescription.trim(),
      contexts: [],
      conversations: [],
      is_public: false,
      updated_at: new Date().toISOString()
    };

    this.projectService.createProject(newProject).subscribe({
      next: () => this.router.navigate(['/projects']),
      error: (err) => {
        console.error('Failed to create project', err);
        this.error = 'Failed to create project. Please try again.';
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/projects']);
  }
} 