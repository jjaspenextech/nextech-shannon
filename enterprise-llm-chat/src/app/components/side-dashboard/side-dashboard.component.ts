import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { trigger, transition, style, animate, state } from '@angular/animations';
import { MatDialog } from '@angular/material/dialog';
import { UserApiService } from '../../services/user-api.service';
import { ApiKeyModalComponent } from '../api-key-modal/api-key-modal.component';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { UserService } from '../../services/user.service';
import { Conversation } from '../../models/conversation.model';
import { ConversationApiService } from '../../services/conversation-api.service';
import { ThemeService } from '../../services/theme.service';
import { UserSettingsComponent } from '../user-settings/user-settings.component';

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
  isLoadingRecentChats: boolean = false;

  constructor(
    private dialog: MatDialog,
    private conversationApiService: ConversationApiService,
    private router: Router,
    private cookieService: CookieService,
    private userService: UserService,
    private userApiService: UserApiService,
    private themeService: ThemeService
  ) {}

  ngOnInit() {
    const user = this.userService.getUser();
    if (user) {
      this.userInitials = (user.firstName[0] + (user.lastName.length > 0 ? user.lastName[0] : '')).toUpperCase();
      this.loadRecentChats(user.username);
    }
  }

  loadRecentChats(username: string) {
    this.isLoadingRecentChats = true;
    this.conversationApiService.getConversations(username).subscribe(
      (chats: Conversation[]) => {
        this.recentChats = chats.sort((a, b) => new Date(b.updated_at || '').getTime() 
          - new Date(a.updated_at || '').getTime()).slice(0, 6);
        this.isLoadingRecentChats = false;
      },
      error => {
        console.error('Error loading recent chats:', error);
        this.isLoadingRecentChats = false;
      }
    );
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

  navigateToNewChat(): void {
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
    this.router.navigate(['/settings']);
  }

  onChatClick(conversationId: string) {
    if (conversationId) {
      console.log(`Navigating to conversation with ID: ${conversationId}`);
    }
  }

  toggleTheme(): void {
    const currentTheme = this.themeService.getTheme();
    const newTheme = currentTheme === 'default-theme' ? 'dark-theme' : 'default-theme';
    this.themeService.setTheme(newTheme);
  }
} 