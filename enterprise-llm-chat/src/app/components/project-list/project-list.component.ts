import { Component, OnInit } from '@angular/core';
import { ProjectService } from '../../services/project.service';
import { Project } from '@models';
import { Router } from '@angular/router';

@Component({
  selector: 'app-project-list',
  templateUrl: './project-list.component.html',
  styleUrls: ['./project-list.component.css']
})
export class ProjectListComponent implements OnInit {
  projects: Project[] = [];
  error: string | null = null;

  constructor(private projectService: ProjectService, private router: Router) {}

  ngOnInit(): void {
    this.loadUserProjects();
  }

  loadUserProjects(): void {
    this.projectService.listUserProjects().subscribe({
      next: (projects) => {
        this.projects = projects;
      },
      error: (err) => {
        this.error = 'Failed to load projects';
        console.error(err);
      }
    });
  }

  navigateToCreateProject(): void {
    this.router.navigate(['/projects/create']);
  }

  navigateToProject(projectId: string): void {
    this.router.navigate(['/projects', projectId]);
  }
} 