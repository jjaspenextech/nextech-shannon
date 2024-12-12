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
    console.log(this.conversation.messages);
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
    const handlers = this.commandRegistry.getHandlers();
    let contexts: CommandResult[] = [];
    for (const [type, handler] of handlers) {
      try {
        const results = await handler.execute(text);
        contexts = contexts.concat(results);
      } catch (error) {
        console.error('Error processing command:', error);
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

  adjustTextareaHeight(textarea: HTMLTextAreaElement): void {
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
  }
}