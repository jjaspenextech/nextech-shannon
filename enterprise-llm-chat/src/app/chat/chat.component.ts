import { Component, ViewChild, ElementRef, AfterViewChecked, ChangeDetectorRef, ViewEncapsulation, OnInit } from '@angular/core';
import { marked } from 'marked';
import * as Prism from 'prismjs';
import 'prismjs/components/prism-python';
import { ChatService, ChatMessage } from '../services/chat.service';
import { UserApiService } from '../services/user-api.service';
import { Conversation } from '../models/conversation.model';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ChatComponent implements OnInit, AfterViewChecked {
  userInput: string = '';
  messages: ChatMessage[] = [];
  currentStreamingMessage: string = '';
  conversationId: string = '';
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;

  constructor(
    private chatService: ChatService,
    private userApiService: UserApiService,
    private cookieService: CookieService,
    private cdr: ChangeDetectorRef
  ) {
    const renderer = new marked.Renderer();
    
    renderer.code = ({ text, lang }: { text: string; lang?: string; escaped?: boolean }) => {
      text = text.trim();
      return `
        <pre>
          <code class="language-${lang || 'plaintext'}">${text}</code>
        </pre>`;
    };

    marked.setOptions({
      renderer,
      gfm: true,
      breaks: true,
      pedantic: false,
      // @ts-ignore - ignoring type check for sanitize option
      sanitize: false,
      smartypants: false,
      xhtml: false
    });
  }

  ngOnInit() {
    const initialMessage = this.chatService.getInitialMessage();
    if (initialMessage) {
      this.userInput = initialMessage;
      this.sendMessage();
    }
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  formatMessage(content: string): string {
    const formatted = marked.parse(content, { async: false }) as string;
    return formatted;
  }

  updateMessageContent(index: number) {
    if (this.messages[index] && this.messages[index].content) {
      this.messages[index].formattedContent = this.formatMessage(this.messages[index].content);      
      this.updateFormattedContent();
    }
  }

  updateFormattedContent() {
    setTimeout(() => {
      Prism.highlightAll();
      this.cdr.detectChanges();
    }, 0);
  }

  async sendMessage() {
    if (this.userInput.trim()) {
      const userMessage: ChatMessage = { role: 'user', content: this.userInput };
      this.messages.push(userMessage);
      // Save conversation after user message
      this.saveConversation();
      this.currentStreamingMessage = '';
      const botMessageIndex = this.messages.length;
      this.messages.push({ role: 'assistant', content: this.currentStreamingMessage });
      this.userInput = '';


      try {
        const reader = await this.chatService.streamChatResponse(this.messages.slice(0, -1));
        
        await this.chatService.processStreamResponse(
          reader,
          (chunk: string) => {
            this.currentStreamingMessage += chunk;
            this.messages[botMessageIndex].content = this.currentStreamingMessage;
            this.scrollToBottom();
            this.cdr.detectChanges();
          },
          () => {
            this.updateMessageContent(botMessageIndex);
            // Save conversation after bot response
            this.saveConversation();
          }
        );
      } catch (error) {
        console.error('Error:', error);
        this.messages.push({
          role: 'assistant',
          content: 'Sorry, there was an error processing your request.'
        });
        this.updateMessageContent(this.messages.length - 1);
      }
    }
  }

  private saveConversation() {
    const username = this.cookieService.get('username'); // Assuming username is stored in cookies
    const conversation: Conversation = {
      conversation_id: this.conversationId || undefined, // Use existing ID or let backend generate a new one
      username,
      messages: this.messages
    };

    this.userApiService.saveConversation(conversation).subscribe(
      response => {
        if (!this.conversationId) {
          this.conversationId = response.conversation_id; // Capture the generated conversation ID
        }
        console.log('Conversation saved successfully');
      },
      error => {
        console.error('Error saving conversation:', error);
      }
    );
  }

  private scrollToBottom(): void {
    try {
      this.messagesContainer.nativeElement.scrollTop = this.messagesContainer.nativeElement.scrollHeight;
    } catch(err) {}
  }
}