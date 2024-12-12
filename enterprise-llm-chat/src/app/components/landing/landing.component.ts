import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ChatService } from '../../services/chat.service';
import { UserService } from '../../services/user.service';
import { UserApiService } from '../../services/user-api.service';
import { Conversation } from '../../models/conversation.model';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss']
})
export class LandingComponent implements OnInit {
  userInput: string = '';
  firstName: string = '';
  recentConversations: Conversation[] = [];
  isLoading: boolean = true;

  constructor(
    private router: Router,
    private chatService: ChatService,
    private userService: UserService,
    private userApiService: UserApiService
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
      const conversations = await this.userApiService.getConversations(username).toPromise();
      this.recentConversations = conversations?.slice(0, 5) || [];
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      this.isLoading = false;
    }
  }

  async onSubmit() {
    if (this.userInput.trim()) {
      this.chatService.setInitialMessage(this.userInput);
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
} 