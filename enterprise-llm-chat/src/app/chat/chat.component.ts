import { Component, ViewChild, ElementRef, AfterViewChecked, ChangeDetectorRef, ViewEncapsulation } from '@angular/core';
import { marked } from 'marked';
import * as Prism from 'prismjs';
import 'prismjs/components/prism-python';
import { ChatService, ChatMessage } from '../services/chat.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
  encapsulation: ViewEncapsulation.None  // Add this line
})
export class ChatComponent implements AfterViewChecked {
  userInput: string = '';
  messages: ChatMessage[] = [];
  currentStreamingMessage: string = '';
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;

  constructor(
    private chatService: ChatService,
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
      console.log('Rendering code block:', { text: this.messages[index].content, lang: 'plaintext' });
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
      const userMessage = this.userInput;
      this.messages.push({ type: 'user', content: userMessage });
      this.currentStreamingMessage = '';
      const botMessageIndex = this.messages.length;
      this.messages.push({ type: 'bot', content: this.currentStreamingMessage });
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
          }
        );
      } catch (error) {
        console.error('Error:', error);
        this.messages.push({
          type: 'bot',
          content: 'Sorry, there was an error processing your request.'
        });
        this.updateMessageContent(this.messages.length - 1);
      }
    }
  }

  private scrollToBottom(): void {
    try {
      this.messagesContainer.nativeElement.scrollTop = this.messagesContainer.nativeElement.scrollHeight;
    } catch(err) {}
  }
}