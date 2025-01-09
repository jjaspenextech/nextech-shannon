import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Message } from '../../models/message.model';
import { ContextResult } from '../../models/context.model';
import { ChatService } from '../../services/chat.service';

@Component({
  selector: 'app-chat-input',
  templateUrl: './chat-input.component.html',
  styleUrls: ['./chat-input.component.css']
})
export class ChatInputComponent {
  @Input() mode: 'chat' | 'landing' | 'project' = 'chat';
  @Input() sequence: number = 0;
  @Output() messageSent = new EventEmitter<Message>();

  messageContent: string = '';
  contexts: ContextResult[] = [];

  constructor(private chatService: ChatService) {}

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.chatService.processFileContext(file).subscribe((context: ContextResult) => {
        this.contexts.push(context);
      });
    }
  }

  sendMessage() {
    if (!this.messageContent.trim()) return;

    const message: Message = {
      content: this.messageContent,
      contexts: this.contexts,
      timestamp: new Date(),
      role: 'user',
      sequence: this.sequence
    };

    this.messageSent.emit(message);
    this.resetInput();
  }

  removeContext(index: number) {
    this.contexts.splice(index, 1);
  }

  private resetInput() {
    this.messageContent = '';
    this.contexts = [];
  }
}
