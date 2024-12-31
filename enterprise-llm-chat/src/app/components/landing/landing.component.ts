import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { ChatService } from '../../services/chat.service';
import { UserService } from '../../services/user.service';
import { UserApiService } from '../../services/user-api.service';
import { Conversation } from '../../models/conversation.model';
import { MatDialog } from '@angular/material/dialog';
import { ApiKeyModalComponent } from '../api-key-modal/api-key-modal.component';
import { firstValueFrom } from 'rxjs';
import { ConversationApiService } from 'app/services/conversation-api.service';
import { MessagesService } from '../../services/messages.service';
import { ContextResult } from '@models';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.css']
})
export class LandingComponent implements OnInit {
  userInput: string = '';
  firstName: string = '';
  recentConversations: Conversation[] = [];
  isLoading: boolean = true;
  isDashboardOpen: boolean = false;
  fileInput: File | null = null;
  fileType: string = '';
  isSaving: boolean = false;
  firstMessageContexts: ContextResult[] = [];
  @ViewChild('landingInput') landingInput!: ElementRef<HTMLTextAreaElement>;

  constructor(
    private router: Router,
    private chatService: ChatService,
    private userService: UserService,
    private userApiService: UserApiService,
    private dialog: MatDialog,
    private conversationApiService: ConversationApiService,
    private messagesService: MessagesService
  ) {}

  ngOnInit() {
    const user = this.userService.getUser();
    if (user) {
      this.firstName = user.firstName;
      this.loadRecentConversations(user.username);
    }
    this.focusInput();
  }

  focusInput() {
    setTimeout(() => {
      this.landingInput.nativeElement.focus();
    }, 0);
  }

  async loadRecentConversations(username: string) {
    try {
      const conversations = await firstValueFrom(this.conversationApiService.getConversations(username));
      // get top 6 sorted by updated_at descending
      this.recentConversations = conversations?.sort((a, b) => new Date(b.updated_at || '').getTime() 
        - new Date(a.updated_at || '').getTime()).slice(0, 6) || [];
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      this.isLoading = false;
    }
  }

  async onSubmit() {
    if (this.userInput.trim()) {
      this.chatService.setInitialMessage(this.userInput, this.firstMessageContexts);
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

  getUserInitials(): string {
    const user = this.userService.getUser();
    if (user) {
      const initials = user.firstName.charAt(0) + user.lastName.charAt(0);
      return initials.toUpperCase();
    }
    return '';
  }

  adjustTextareaHeight(textarea: HTMLTextAreaElement): void {
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
  }

  toggleDashboard(open: boolean) {
    this.isDashboardOpen = open;
  }

  handleFileInput(event: Event): void {
    this.messagesService.handleFileInput(event).then(contexts => {
      if (contexts.length > 0) {
        this.addFileContexts(contexts);
      }
    }).catch(error => {
      console.error('Error handling file input:', error);
    });
  }

  private addFileContexts(contexts: ContextResult[]): void {
    this.firstMessageContexts.push(...contexts);
  }
} 