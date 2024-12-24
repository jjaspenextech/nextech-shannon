import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { trigger, transition, style, animate, state } from '@angular/animations';
import { MatDialog } from '@angular/material/dialog';
import { UserApiService } from '../../services/user-api.service';
import { ApiKeyModalComponent } from '../api-key-modal/api-key-modal.component';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { UserService } from '../../services/user.service';
import { Conversation } from '../../models/conversation.model';

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
export class SideDashboardComponent implements OnInit {
  @Input() isOpen = false;
  @Output() closePanel = new EventEmitter<void>();
  @Output() openPanel = new EventEmitter<void>();
  userInitials: string = '';
  recentChats: Conversation[] = [];

  constructor(
    private dialog: MatDialog,
    private userApiService: UserApiService,
    private router: Router,
    private cookieService: CookieService,
    private userService: UserService
  ) {}

  ngOnInit() {
    const user = this.userService.getUser();
    if (user) {
      this.userInitials = (user.firstName[0] + (user.lastName.length > 0 ? user.lastName[0] : '')).toUpperCase();
      this.loadRecentChats(user.username);
    }
  }

  loadRecentChats(username: string) {
    this.userApiService.getConversations(username).subscribe(
      (chats: Conversation[]) => {
        // get top 6 sorted by updated_at descending
        this.recentChats = chats.sort((a, b) => new Date(b.updated_at || '').getTime() 
          - new Date(a.updated_at || '').getTime()).slice(0, 6);
      },
      error => {
        console.error('Error loading recent chats:', error);
      }
    );
  }

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

  navigateToLanding(): void {
    this.router.navigate(['/landing']);
    this.closePanel.emit();
  }

  logout(): void {
    this.cookieService.delete('authToken', '/');
    this.cookieService.delete('username', '/');
    this.cookieService.delete('firstName', '/');
    this.cookieService.delete('lastName', '/');
    this.cookieService.delete('email', '/');
    this.router.navigate(['/login']);
    this.closePanel.emit();
  }

  openUserSettings(): void {
    this.openApiKeyModal();
  }

  onChatClick(conversationId: string) {
    if (conversationId) {
      // Handle the click event, e.g., navigate to the chat or perform another action
      console.log(`Navigating to conversation with ID: ${conversationId}`);
      // Example: this.router.navigate(['/chat'], { queryParams: { id: conversationId } });
    }
  }
} 