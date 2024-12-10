import { Component, ViewChild, ElementRef, AfterViewChecked, ChangeDetectorRef } from '@angular/core';
import { marked } from 'marked';
import * as Prism from 'prismjs';
import { ChatService, ChatMessage } from '../services/chat.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
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
    // console.log('formatMessage called with:', content);
    const formatted = marked.parse(content, { async: false }) as string;
    // console.log('formatMessage result:', formatted);
    return formatted;
  }

  updateFormattedContent(index: number) {
    if (this.messages[index]) {
      this.messages[index].formattedContent = this.formatMessage(this.messages[index].content);
      // Trigger Prism to highlight any new code blocks
      setTimeout(() => {
        Prism.highlightAll();
        this.cdr.detectChanges();
      }, 0);
    }
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
        const reader = await this.chatService.streamChatResponse(this.messages.slice(0, -1));  // Send all messages except the empty bot message
        
        await this.chatService.processStreamResponse(
          reader,
          (chunk: string) => {
            this.currentStreamingMessage += chunk;
            this.messages[botMessageIndex].content = this.currentStreamingMessage;
            this.scrollToBottom();
            this.cdr.detectChanges();
          },
          () => {
            this.updateFormattedContent(botMessageIndex);
          }
        );
      } catch (error) {
        console.error('Error:', error);
        this.messages.push({
          type: 'bot',
          content: 'Sorry, there was an error processing your request.'
        });
        this.updateFormattedContent(this.messages.length - 1);
      }
    }
  }

  private scrollToBottom(): void {
    try {
      this.messagesContainer.nativeElement.scrollTop = this.messagesContainer.nativeElement.scrollHeight;
    } catch(err) {}
  }
}