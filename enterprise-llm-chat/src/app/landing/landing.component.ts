import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ChatService } from '../services/chat.service';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss']
})
export class LandingComponent implements OnInit {
  userInput: string = '';
  firstName: string = '';

  constructor(
    private router: Router,
    private chatService: ChatService,
    private userService: UserService
  ) {}

  ngOnInit() {
    const user = this.userService.getUser();
    if (user) {
      this.firstName = user.firstName;
    }
  }

  async onSubmit() {
    if (this.userInput.trim()) {
      // Store the initial message in the chat service
      this.chatService.setInitialMessage(this.userInput);
      // Navigate to chat component
      this.router.navigate(['/chat']);
    }
  }

  getTimeOfDay() {
    const hour = new Date().getHours();
    if (hour < 12) return 'morning';
    if (hour < 18) return 'afternoon';
    return 'evening';
  }
} 