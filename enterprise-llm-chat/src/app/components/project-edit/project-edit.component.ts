import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ProjectService } from '../../services/project.service';
import { ContextResult, Project } from '@models';

interface KnowledgeItem {
  icon: string;
  title: string;
}

@Component({
  selector: 'app-project-edit',
  templateUrl: './project-edit.component.html',
  styleUrls: ['./project-edit.component.css']
})
export class ProjectEditComponent implements OnInit {
  project: Project = {
    name: '',
    description: '',
    contexts: [],
    conversations: [],
    is_public: false,
    updated_at: new Date().toISOString()
  };

  knowledgeItems: KnowledgeItem[] = [];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private projectService: ProjectService
  ) {}

  ngOnInit() {
    const projectId = this.route.snapshot.paramMap.get('id');
    if (projectId) {
      this.loadProject(projectId);
    }
  }

  loadProject(projectId: string) {
    this.projectService.getProject(projectId).subscribe({
      next: (project) => {
        this.project = project;
        this.knowledgeItems = project.contexts.map((context: ContextResult) => ({
          icon: context.type,
          title: context.content.slice(0, 100)
        }));
      },
      error: (error) => {
        console.error('Error loading project:', error);
        // Handle error (show message, redirect, etc.)
      }
    });
  }

  saveProject() {
    this.projectService.updateProject(this.project).subscribe({
      next: () => {
        // Show success message or redirect
      },
      error: (error) => {
        console.error('Error saving project:', error);
        // Handle error (show message)
      }
    });
  }

  navigateBack() {
    this.router.navigate(['/projects']);
  }
}
