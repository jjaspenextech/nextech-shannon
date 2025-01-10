import { Component, EventEmitter, Input, Output, ViewChild, ElementRef } from '@angular/core';
import { Message } from '../../models/message.model';
import { ContextResult } from '../../models/context.model';
import { ChatService } from '../../services/chat.service';
import { MatDialog } from '@angular/material/dialog';
import { ContextViewerComponent } from '../context-viewer/context-viewer.component';
import { MessagesService } from 'app/services/messages.service';

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

  constructor(
    private dialog: MatDialog,
    private messagesService: MessagesService
  ) {}

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

  onFileSelected(event: Event) {
    this.messagesService.handleFileInput(event).then(contexts => {
      if (contexts.length > 0) {
        this.contexts = this.contexts.concat(contexts);
      }
    }).catch(error => {
      console.error('Error handling file input:', error);
    });
  }

  sendMessage() {
    if (!this.messageContent.trim()) return;

    const message: Message = {
      content: this.messageContent,
      contexts: this.contexts
    };

    this.messageSent.emit(message);
    this.resetInput();
  }

  removeContext(index: number) {
    this.contexts.splice(index, 1);
  }

  openContext(context: ContextResult, event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.dialog.open(ContextViewerComponent, {
      data: { context },
      width: '600px'
    });
  }

  private resetInput() {
    this.messageContent = '';
    this.contexts = [];
  }
}
