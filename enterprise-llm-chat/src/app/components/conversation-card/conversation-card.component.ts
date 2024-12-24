import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Conversation } from '../../models/conversation.model';

@Component({
  selector: 'app-conversation-card',
  templateUrl: './conversation-card.component.html',
  styleUrls: ['./conversation-card.component.css']
})
export class ConversationCardComponent {
  @Input() conversation!: Conversation;
  @Input() messagePreviewLength: number = 100; // Default to 100 characters
  @Output() cardClick = new EventEmitter<void>();

  onClick() {
    this.cardClick.emit();
  }
} 