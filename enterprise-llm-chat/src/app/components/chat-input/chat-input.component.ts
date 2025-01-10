import { Component, EventEmitter, Input, Output, ViewChild, ElementRef } from '@angular/core';
import { Message } from '../../models/message.model';
import { ContextResult } from '../../models/context.model';
import { ChatService } from '../../services/chat.service';

@Component({
  selector: 'app-chat-input',
  templateUrl: './chat-input.component.html',
  styleUrls: ['./chat-input.component.css']
})
export class ChatInputComponent {
  @Input() mode: 'chat' | 'project' | 'landing' = 'chat';
  @Input() sequence: number = 1;
  @Input() disabled: boolean = false;
  @Output() messageSent = new EventEmitter<Message>();
  @ViewChild('messageInput') messageInput!: ElementRef<HTMLTextAreaElement>;

  messageContent: string = '';
  contexts: ContextResult[] = [];

  constructor(private chatService: ChatService) {}

  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      if (event.shiftKey) {
        // Let the default behavior happen (new line)
        return;
      } else {
        // Prevent the default enter behavior and send message
        event.preventDefault();
        this.sendMessage();
      }
    }
  }

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
