import { Component, ViewChild, ElementRef, AfterViewChecked, ChangeDetectorRef, ViewEncapsulation, OnInit, HostListener } from '@angular/core';
import { marked } from 'marked';
import * as Prism from 'prismjs';
import 'prismjs/components/prism-python';
import { ChatService } from '../../services/chat.service';
import { StreamingService } from '../../services/streaming.service';
import { ConversationApiService } from '../../services/conversation-api.service';
import { ContextResult, Conversation, Message } from '@models';
import { CookieService } from 'ngx-cookie-service';
import { ActivatedRoute, Router } from '@angular/router';
import { CommandRegistryService } from '../../services/command-registry.service';
import { firstValueFrom, tap } from 'rxjs';
import { LLMService } from 'app/services/llm.service';
import { MessagesService } from '../../services/messages.service';
import { MatDialog } from '@angular/material/dialog';
import { ContextViewerComponent } from '../context-viewer/context-viewer.component';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class ChatComponent implements OnInit, AfterViewChecked {
  conversation: Conversation = { username: '', messages: [] };
  currentStreamingMessage: string = '';
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;
  
  selectedContext: ContextResult | null = null;
  scrollEnabled: boolean = true;
  showResendButton: boolean = false;
  isDragging = false;
  isSaving: boolean = false;
  isDashboardOpen: boolean = false;
  isLoadingConversation: boolean = false;


  constructor(
    private chatService: ChatService,
    private streamingService: StreamingService,
    private conversationApiService: ConversationApiService,
    private cookieService: CookieService,
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute,
    private commandRegistry: CommandRegistryService,
    private router: Router,
    private llmService: LLMService,
    private messagesService: MessagesService,
    private dialog: MatDialog
  ) {
    const renderer = new marked.Renderer();
    
    renderer.code = ({ text, lang }: { text: string; lang?: string; escaped?: boolean }) => {
      const validLanguage = Prism.languages[lang || 'plaintext'] ? (lang || 'plaintext') : 'plaintext';
      const highlightedCode = Prism.highlight(
        text,
        Prism.languages[validLanguage],
        validLanguage
      );
      return `<pre><code class="language-${validLanguage}">${highlightedCode}</code></pre>`;
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
      this.isDashboardOpen = false;
      this.toggleDashboard(false);
      this.conversation = { username: '', messages: [] };
      const conversationId = params['id'];
      if (conversationId) {
        this.loadConversation(conversationId);
      } else {
        const projectId = this.chatService.getProjectId() || '';
        this.conversation.project_id = projectId;
        const initialMessage = this.chatService.getInitialMessage();
        if (initialMessage) {
          this.conversation.messages.push(initialMessage);
          this.updateConversation();
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

  async updateConversation(){
    // if conversation doesn't have a description, then get the description and the bot response in parallel
    // and update the conversation with the description and the bot response.
    const promises : Promise<any>[] = [
      this.updateConversationDescription(),
      this.updateConversationMessages()
    ]
    await Promise.all(promises);
    this.saveConversation();
  }

  async updateConversationDescription() {
    if (!this.conversation.description) {
      this.conversation.description 
        = await this.llmService.getDescription(this.conversation.messages[this.conversation.messages.length - 1].content || '',
           this.conversation.project_id);
      await this.saveConversation();
    } else {
      return Promise.resolve();
    }
  }  

  async updateConversationMessages() {
    const lastMessage = this.conversation.messages[this.conversation.messages.length - 1];
    if (lastMessage?.content?.trim() && !this.isSaving) {
      this.isSaving = true;
      this.scrollEnabled = true;
      const message = lastMessage.content;
      lastMessage.content = '';
      try {
        await this.sendMessage(message);
        this.messagesContainer.nativeElement.style.height = 'auto';
      } catch (error) {
        console.error('Error in updateConversationMessages:', error);
        this.isSaving = false;
      }
    } else {
      return Promise.resolve();
    }
  }

  async sendMessage(message: string) {
    const contexts = await this.getContextsFromHandlers(message);
    this.addOrUpdateLastUserMessage(message, contexts);
    
    // Add pending assistant message with loading animation
    const botMessageIndex = this.conversation.messages.length;
    this.conversation.messages.push({ 
      role: 'assistant', 
      content: '',
      sequence: botMessageIndex + 1,
      pending: true
    });
    
    this.isSaving = false; // Remove loading state before starting to stream
    await this.streamNewMessage(botMessageIndex);
  }

  async streamNewMessage(botMessageIndex: number) {
    try {
      this.currentStreamingMessage = '';
      const reader = await this.streamingService.streamChatResponse(
        this.conversation.messages.slice(0, -1),
        this.conversation.project_id
      );
      
      // Remove pending state when we start getting the response
      this.conversation.messages[botMessageIndex].pending = false;
      
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
        }
      );
    } catch (error) {
      console.error('Error:', error);
      // Update the pending message to show error
      this.conversation.messages[botMessageIndex].content += '\n\nSorry, there was an error processing your request.';
      this.conversation.messages[botMessageIndex].pending = false;
      this.updateMessageContent(botMessageIndex);
    }
  }

  async resendLastMessage(): Promise<void> {
    if (this.conversation.messages.length > 0) {
      const lastMessage = this.conversation.messages[this.conversation.messages.length - 1];
      if (lastMessage.role === 'user') {
        this.conversation.messages[this.conversation.messages.length - 1].content = '';
        await this.updateConversation();
      }
    }
  }

  updateMessageContent(index: number) {
    if (this.conversation.messages[index] && this.conversation.messages[index].content) {
      // if the message ends with [DONE] then we need to remove it. This is a hack to get rid of the [DONE] 
      // that the streaming service adds to the end of the message when the backend is very slow.
      if (this.conversation.messages[index].content.endsWith('[DONE]')) {
        this.conversation.messages[index].content = this.conversation.messages[index].content.slice(0, -6);
      }
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

  async getContextsFromHandlers(text: string): Promise<ContextResult[]> {
    const currentMessage = this.conversation.messages[this.conversation.messages.length - 1];
    let existingContexts: ContextResult[] = [];
    if (currentMessage && currentMessage.contexts) {
      existingContexts = currentMessage.contexts;
    }
    const handlers = this.commandRegistry.getHandlers();
    let contexts: ContextResult[] = existingContexts;
    for (const [type, handler] of handlers) {
      try {
        const new_matches = handler.getMatches(text)
          .filter(match => !contexts.some(context => context.match === match));
        for (const match of new_matches) {
          const results = await handler.execute(match);
          results.match = match;
          contexts = contexts.concat(results);
        }
      } catch (error) {
        console.error('Error processing command:', error);
      }
    }
    return contexts;
  }

  addOrUpdateLastUserMessage(message: string, contexts: ContextResult[]) {
    // Check if we need to add new message to conversation or update the last user message
    // to not be pending.
    const lastMessage = this.conversation.messages[this.conversation.messages.length - 1];
    if (lastMessage && lastMessage.role === 'user' && lastMessage.pending) {
      lastMessage.pending = false;
      lastMessage.content = message;
    } else {
      const userMessage: Message = { 
        role: 'user', 
        content: message, 
        sequence: this.conversation.messages.length + 1,
        contexts: contexts && contexts.length > 0 ? contexts : undefined
      };
      this.conversation.messages.push(userMessage);
    }        
  }

  private async saveConversation() {
    const username = this.cookieService.get('username');
    this.conversation.username = username;

    await firstValueFrom(
      this.conversationApiService.saveConversation(this.conversation)
      .pipe(
        tap(response => {
          this.conversation.conversation_id = response.conversation.conversation_id;
          this.conversation.description = response.conversation.description;
          // update the id of all messages without an id, based on the sequence number
          this.conversation.messages.forEach((message, index) => {
            if (!message.message_id) {
              message.message_id = response.conversation.messages[index].message_id;
              message.contexts = response.conversation.messages[index].contexts;
            }
          });
        })
      )
    );
    console.log('Conversation saved successfully');
  }

  private scrollToBottom(): void {
    if (this.scrollEnabled && this.messagesContainer) {
      this.messagesContainer.nativeElement.scrollTop = this.messagesContainer.nativeElement.scrollHeight;
    }
  }

  private async loadConversation(conversationId: string) {
    try {      
      this.isLoadingConversation = true;  // Set loading state
      this.conversation.conversation_id = conversationId;
      const conversation = await firstValueFrom(this.conversationApiService.getConversation(conversationId));
      if (conversation) {
        this.conversation = conversation;
        this.showResendButton = this.conversation.messages.length > 0 &&
                                this.conversation.messages[this.conversation.messages.length - 1].role === 'user';
        this.conversation.messages.forEach((_, index) => {
          this.updateMessageContent(index);
        });
      }
    } catch (error) {
      console.error('Error loading conversation:', error);
    } finally {
      this.isLoadingConversation = false;  // Clear loading state
    }
  }

  toggleDashboard(open: boolean) {
    this.isDashboardOpen = open;
  }

  togglePopup(context: ContextResult, event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.scrollEnabled = false; // Disable scrolling
    this.selectedContext = context;
    this.openContextViewer(context);
  }

  openContextViewer(context: ContextResult): void {
    this.dialog.open(ContextViewerComponent, {
      data: context,
      width: '600px'
    });
  }

  async onMessageSent(message: Message) {
    if (this.isSaving) return;
    this.isSaving = true;
    this.scrollEnabled = true;
    
    try {
      // Add the user message to conversation
      this.conversation.messages.push(message);
      
      // Add pending assistant message with loading animation
      const botMessageIndex = this.conversation.messages.length;
      this.conversation.messages.push({ 
        role: 'assistant', 
        content: '',
        sequence: botMessageIndex + 1,
        pending: true
      } as Message);
      
      // Update conversation description if needed
      if (!this.conversation.description) {
        this.conversation.description = await this.llmService.getDescription(
          message.content || '',
          this.conversation.project_id
        );
        await this.saveConversation();
      }
      
      this.isSaving = false; // Remove loading state before starting to stream
      await this.streamNewMessage(botMessageIndex);
    } catch (error) {
      console.error('Error in onMessageSent:', error);
      this.isSaving = false;
    }
  }

  copyToClipboard(content: string | undefined) {
    if (content) {
      navigator.clipboard.writeText(content).then(() => {
        console.log('Content copied to clipboard');
      }).catch(err => {
        console.error('Could not copy text: ', err);
      });
    } else {
      console.warn('No content to copy');
    }
  }

  saveToFile(content: string | undefined) {
    if (content) {
      const blob = new Blob([content], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'message.txt';
      a.click();
      window.URL.revokeObjectURL(url);
    } else {
      console.warn('No content to save');
    }
  }
}