import { Component, Input, Output, EventEmitter } from '@angular/core';
import { trigger, transition, style, animate, state } from '@angular/animations';
import { MatDialog } from '@angular/material/dialog';
import { UserApiService } from '../../services/user-api.service';
import { ApiKeyModalComponent } from '../api-key-modal/api-key-modal.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-side-dashboard',
  templateUrl: './side-dashboard.component.html',
  styleUrls: ['./side-dashboard.component.css'],
  animations: [
    trigger('slideInOut', [
      state('void', style({
        transform: 'translateX(-100%)'
      })),
      state('*', style({
        transform: 'translateX(0)'
      })),
      transition(':enter', [
        animate('200ms ease-out')
      ]),
      transition(':leave', [
        animate('200ms ease-in')
      ])
    ])
  ]
})
export class SideDashboardComponent {
  @Input() isOpen = false;
  @Output() closePanel = new EventEmitter<void>();
  @Output() openPanel = new EventEmitter<void>();

  constructor(
    private dialog: MatDialog,
    private userApiService: UserApiService,
    private router: Router
  ) {}

  onMouseEnter() {
    this.openPanel.emit();
  }

  onMouseLeave() {
    this.closePanel.emit();
  }

  onClose() {
    this.closePanel.emit();
  }

  openApiKeyModal() {
    this.userApiService.getApiKeys().subscribe(
      apiKeys => {
        this.dialog.open(ApiKeyModalComponent, {
          data: { currentKey: apiKeys.jira },
          width: '500px',
          panelClass: 'custom-dialog-container'
        });
      }
    );
  }

  navigateToProjects() {
    this.router.navigate(['/projects']);
  }
} 