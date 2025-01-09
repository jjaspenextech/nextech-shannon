import { Component } from '@angular/core';
import { Message } from '../../models/message.model';

@Component({
  selector: 'app-chat-input-test',
  templateUrl: './chat-input-test.component.html'
})
export class ChatInputTestComponent {
  messages: Message[] = [];

  onMessageSent(message: Message) {
    this.messages.push(message);
    console.log('Message sent:', message);
  }
} 