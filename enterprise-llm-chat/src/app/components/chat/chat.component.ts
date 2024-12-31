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

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class ChatComponent implements OnInit, AfterViewChecked {
  userInput: string = '';
  // DO NOT DELETE THIS COMMENTED OUT CODE
//   conversation: Conversation = { username: '', messages: [
//     {
//         "role": "user",
//         "content": "@jira:ALC-386 Help me flesh out this story",
//         "sequence": 1,
//         "contexts": [
//             {
//                 "type": "jira",
//                 "content": {
//                     "description": "What is coming that will impact us, can we plan ahead for it now?  \n\nExample - we should have been ahead of AI scribe…then we should have been ahead of voice to voice…what should we be planning for 2026?"
//                 }
//             }
//         ]
//     } as Message,
//     {
//         "role": "assistant",
//         "content": "To flesh out the story for ALC-386, we can start by expanding on the key elements that will help guide the planning process for future trends and technologies. Here are some suggestions to consider:\n\n1. **Research and Analysis**:\n   - Conduct a thorough market analysis to identify emerging technologies and trends that could impact our industry by 2026.\n   - Gather insights from industry experts, reports, and thought leaders to understand potential disruptions.\n\n2. **Trend Identification**:\n   - Identify specific technologies or innovations that are gaining traction, such as advancements in AI, machine learning, blockchain, or quantum computing.\n   - Consider societal and economic shifts that could influence technology adoption, like remote work trends or sustainability initiatives.\n\n3. **Impact Assessment**:\n   - Evaluate how these trends could affect our business operations, customer expectations, and competitive landscape.\n   - Assess potential risks and opportunities associated with these changes.\n\n4. **Strategic Planning**:\n   - Develop a strategic roadmap that outlines how we can leverage these trends to our advantage.\n   - Consider partnerships, investments, or internal projects that could position us ahead of the curve.\n\n5. **Resource Allocation**:\n   - Determine the resources needed to explore and implement these future technologies, including budget, talent, and infrastructure.\n\n6. **Continuous Monitoring**:\n   - Set up a system for ongoing monitoring of technological advancements and market changes to ensure we remain proactive.\n\n7. **Feedback and Iteration**:\n   - Establish a feedback loop to refine our strategies based on new information and changing circumstances.\n\nWould you like to focus on any specific area or need further details on any of these points?",
//         "sequence": 2,
//         "formattedContent": "<p>To flesh out the story for ALC-386, we can start by expanding on the key elements that will help guide the planning process for future trends and technologies. Here are some suggestions to consider:</p>\n<ol>\n<li><p><strong>Research and Analysis</strong>:</p>\n<ul>\n<li>Conduct a thorough market analysis to identify emerging technologies and trends that could impact our industry by 2026.</li>\n<li>Gather insights from industry experts, reports, and thought leaders to understand potential disruptions.</li>\n</ul>\n</li>\n<li><p><strong>Trend Identification</strong>:</p>\n<ul>\n<li>Identify specific technologies or innovations that are gaining traction, such as advancements in AI, machine learning, blockchain, or quantum computing.</li>\n<li>Consider societal and economic shifts that could influence technology adoption, like remote work trends or sustainability initiatives.</li>\n</ul>\n</li>\n<li><p><strong>Impact Assessment</strong>:</p>\n<ul>\n<li>Evaluate how these trends could affect our business operations, customer expectations, and competitive landscape.</li>\n<li>Assess potential risks and opportunities associated with these changes.</li>\n</ul>\n</li>\n<li><p><strong>Strategic Planning</strong>:</p>\n<ul>\n<li>Develop a strategic roadmap that outlines how we can leverage these trends to our advantage.</li>\n<li>Consider partnerships, investments, or internal projects that could position us ahead of the curve.</li>\n</ul>\n</li>\n<li><p><strong>Resource Allocation</strong>:</p>\n<ul>\n<li>Determine the resources needed to explore and implement these future technologies, including budget, talent, and infrastructure.</li>\n</ul>\n</li>\n<li><p><strong>Continuous Monitoring</strong>:</p>\n<ul>\n<li>Set up a system for ongoing monitoring of technological advancements and market changes to ensure we remain proactive.</li>\n</ul>\n</li>\n<li><p><strong>Feedback and Iteration</strong>:</p>\n<ul>\n<li>Establish a feedback loop to refine our strategies based on new information and changing circumstances.</li>\n</ul>\n</li>\n</ol>\n<p>Would you like to focus on any specific area or need further details on any of these points?</p>\n"
//     } as Message
// ] };
  conversation: Conversation = { username: '', messages: [] };
  currentStreamingMessage: string = '';
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;
  @ViewChild('messageInput') messageInput!: ElementRef<HTMLTextAreaElement>;

  selectedContext: ContextResult | null = null;
  scrollEnabled: boolean = true;
  showResendButton: boolean = false;
  isDragging = false;
  isSaving: boolean = false;
  isDashboardOpen: boolean = false;

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
    private messagesService: MessagesService
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
      const conversationId = params['id'];
      if (conversationId) {
        this.loadConversation(conversationId);
      } else {
        const projectId = this.chatService.getProjectId() || '';
        this.conversation.project_id = projectId;
        const initialMessage = this.chatService.getInitialMessage();
        if (initialMessage) {
          this.userInput = initialMessage.content || '';
          initialMessage.pending = true;
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
        = await this.llmService.getDescription(this.userInput || '',
           this.conversation.project_id);
      await this.saveConversation();
    } else {
      return Promise.resolve();
    }
  }
  

  async updateConversationMessages() {
    if (this.userInput.trim() && !this.isSaving) {
      this.isSaving = true;
      this.scrollEnabled = true;
      const message = this.userInput;
      this.userInput = '';
      try {
        await this.sendMessage(message);    
        this.messageInput.nativeElement.style.height = 'auto';
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
        this.userInput = lastMessage.content || '';
        this.conversation.messages.pop(); // Remove the last user message
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
            }
          });
        })
      )
    );
    console.log('Conversation saved successfully');
  }

  private scrollToBottom(): void {
    if (this.scrollEnabled) {
      try {
        this.messagesContainer.nativeElement.scrollTop = this.messagesContainer.nativeElement.scrollHeight;
      } catch (err) {}
    }
  }

  private async loadConversation(conversationId: string) {
    try {
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
    }
  }

  onInput(textarea: HTMLTextAreaElement): void {
    this.adjustTextareaHeight(textarea);
  }

  adjustTextareaHeight(textarea: HTMLTextAreaElement): void {
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
  }

  togglePopup(context: ContextResult, event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.scrollEnabled = false; // Disable scrolling
    this.selectedContext = context;
  }

  closePopup(): void {
    this.selectedContext = null;
    // Do not enable scrolling here
  }

  handleFileInput(event: Event): void {
    this.messagesService.handleFileInput(event).then(contexts => {
      if (contexts.length > 0) {
        this.addFileContextsToLastMessage(contexts);
      }
    }).catch(error => {
      console.error('Error handling file input:', error);
    });
  }

  private addFileContextsToLastMessage(contexts: ContextResult[]): void {
    if (this.conversation.messages.length > 0) {
      const lastMessage = this.conversation.messages[this.conversation.messages.length - 1];
      if (lastMessage.role === 'user') {
        lastMessage.contexts = lastMessage.contexts || [];
        lastMessage.contexts.push(...contexts);
        lastMessage.pending = true;
      } else {
        this.conversation.messages.push({
          role: 'user',
          content: this.userInput,
          sequence: this.conversation.messages.length + 1,
          contexts: contexts,
          pending: true
        });
      }
    } else {
      this.conversation.messages.push({
        role: 'user',
        content: this.userInput,
        sequence: 1,
        contexts: contexts,
        pending: true
      });
    }
  }

  @HostListener('dragenter', ['$event'])
  @HostListener('dragover', ['$event'])
  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }

  @HostListener('dragleave', ['$event'])
  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    const rect = this.messagesContainer.nativeElement.getBoundingClientRect();
    const x = event.clientX;
    const y = event.clientY;

    if (x <= rect.left || x >= rect.right || y <= rect.top || y >= rect.bottom) {
      this.isDragging = false;
    }
  }

  @HostListener('drop', ['$event'])
  async onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
    const contexts = await this.messagesService.handleFileInput(event);
    this.addFileContextsToLastMessage(contexts);
  }

  toggleDashboard(open: boolean) {
    this.isDashboardOpen = open;
  }
}