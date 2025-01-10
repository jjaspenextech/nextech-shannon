import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ChatService } from '../../services/chat.service';
import { UserService } from '../../services/user.service';
import { UserApiService } from '../../services/user-api.service';
import { Conversation } from '../../models/conversation.model';
import { MatDialog } from '@angular/material/dialog';
import { ApiKeyModalComponent } from '../api-key-modal/api-key-modal.component';
import { firstValueFrom } from 'rxjs';
import { ConversationApiService } from 'app/services/conversation-api.service';
import { Message } from '../../models/message.model';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.css']
})
export class LandingComponent implements OnInit {
  firstName: string = '';
  recentConversations: Conversation[] = [];
  isLoading: boolean = true;
  isDashboardOpen: boolean = false;

  constructor(
    private router: Router,
    private chatService: ChatService,
    private userService: UserService,
    private userApiService: UserApiService,
    private dialog: MatDialog,
    private conversationApiService: ConversationApiService
  ) {}

  ngOnInit() {
    const user = this.userService.getUser();
    if (user) {
      this.firstName = user.firstName;
      this.loadRecentConversations(user.username);
    }
  }

  async loadRecentConversations(username: string) {
    try {
      const conversations = await firstValueFrom(this.conversationApiService.getConversations(username));
      this.recentConversations = conversations?.sort((a, b) => new Date(b.updated_at || '').getTime() 
        - new Date(a.updated_at || '').getTime()).slice(0, 6) || [];
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      this.isLoading = false;
    }
  }

  onMessageSent(message: Message) {
    if (message.content) {
      this.chatService.setInitialMessage(message);
      this.router.navigate(['/chat']);
    }
  }

  onConversationClick(conversationId: string) {
    if (conversationId) {
      this.router.navigate(['/chat'], { queryParams: { id: conversationId } });
    }
  }

  getTimeOfDay() {
    const hour = new Date().getHours();
    if (hour < 12) return 'morning';
    if (hour < 18) return 'afternoon';
    return 'evening';
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

  toggleDashboard(open: boolean) {
    this.isDashboardOpen = open;
  }
} 