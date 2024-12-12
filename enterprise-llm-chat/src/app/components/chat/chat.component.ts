import { Component, ViewChild, ElementRef, AfterViewChecked, ChangeDetectorRef, ViewEncapsulation, OnInit } from '@angular/core';
import { marked } from 'marked';
import * as Prism from 'prismjs';
import 'prismjs/components/prism-python';
import { ChatService } from '../../services/chat.service';
import { StreamingService } from '../../services/streaming.service';
import { UserApiService } from '../../services/user-api.service';
import { CommandResult, Conversation, Message } from '@models';
import { CookieService } from 'ngx-cookie-service';
import { ActivatedRoute } from '@angular/router';
import { CommandRegistryService } from '../../services/command-registry.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ChatComponent implements OnInit, AfterViewChecked {
  userInput: string = '';
  conversation: Conversation = { username: '', messages: [] };
  currentStreamingMessage: string = '';
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;

  constructor(
    private chatService: ChatService,
    private streamingService: StreamingService,
    private userApiService: UserApiService,
    private cookieService: CookieService,
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute,
    private commandRegistry: CommandRegistryService
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
    this.route.queryParams.subscribe(params => {
      const conversationId = params['id'];
      if (conversationId) {
        this.loadConversation(conversationId);
      } else {
        const initialMessage = this.chatService.getInitialMessage();
        if (initialMessage) {
          this.userInput = initialMessage;
          this.sendMessage();
        }
      }
    });
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  formatMessage(content: string): string {
    const formatted = marked.parse(content, { async: false }) as string;
    return formatted;
  }

  updateMessageContent(index: number) {
    if (this.conversation.messages[index] && this.conversation.messages[index].content) {
      this.conversation.messages[index].formattedContent = this.formatMessage(this.conversation.messages[index].content);      
      this.updateFormattedContent();
    }
  }

  updateFormattedContent() {
    setTimeout(() => {
      Prism.highlightAll();
      this.cdr.detectChanges();
    }, 0);
  }

  async getContextsFromHandlers(text: string): Promise<CommandResult[]> {
    // Process @ commands
    const handlers = this.commandRegistry.getHandlers();
    let contexts: CommandResult[] = [];
    for (const [type, handler] of handlers) {
      const match = this.userInput.match(handler.pattern);
      if (match) {
        try {
          const result = await handler.execute(match);
          contexts.push(result);

        } catch (error) {
          console.error('Error processing command:', error);
        }
      }
    }
    return contexts;
  }

  async sendMessage() {
    if (this.userInput.trim()) {
      const contexts = await this.getContextsFromHandlers(this.userInput);
      const userMessage: Message = { 
        role: 'user', 
        content: this.userInput, 
        sequence: this.conversation.messages.length + 1,
        contexts: contexts && contexts.length > 0 ? contexts : undefined
      };
      this.conversation.messages.push(userMessage);
      // Save conversation after user message
      this.saveConversation();
      const botMessageIndex = this.conversation.messages.length;
      this.conversation.messages.push({ role: 'assistant', content:'', sequence: botMessageIndex + 1 });
      this.userInput = '';

      this.streamNewMessage(botMessageIndex);
    }
  }

  async streamNewMessage(botMessageIndex: number) {
    try {
      this.currentStreamingMessage = '';
      const reader = await this.streamingService.streamChatResponse(this.conversation.messages.slice(0, -1));
      
      await this.streamingService.processStreamResponse(
        reader,
        (chunk: string) => {
          this.currentStreamingMessage += chunk;
          this.conversation.messages[botMessageIndex].content = this.currentStreamingMessage;
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
      this.conversation.messages.push({
        role: 'assistant',
        content: 'Sorry, there was an error processing your request.',
        sequence: this.conversation.messages.length + 1
      });
      this.updateMessageContent(this.conversation.messages.length - 1);
    }
  }

  private saveConversation() {
    const username = this.cookieService.get('username'); // Assuming username is stored in cookies
    this.conversation.username = username;

    this.userApiService.saveConversation(this.conversation).subscribe(
      response => {
        if (!this.conversation.conversation_id) {
          this.conversation.conversation_id = response.conversation_id; // Capture the generated conversation ID
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

  private async loadConversation(conversationId: string) {
    try {
      this.conversation.conversation_id = conversationId;
      const conversation = await firstValueFrom(this.userApiService.getConversation(conversationId));
      if (conversation) {
        this.conversation = conversation;
        // Format all messages
        this.conversation.messages.forEach((_, index) => {
          this.updateMessageContent(index);
        });
      }
    } catch (error) {
      console.error('Error loading conversation:', error);
    }
  }
}