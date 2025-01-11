import { Injectable } from '@angular/core';
import { ContextResult } from '@models';

@Injectable({
  providedIn: 'root'
})
export class MessagesService {

  async handleFileInput(event: Event | DragEvent): Promise<ContextResult[]> {
    const files = this.extractFiles(event);
    return this.processFilesToContexts(files);
  }

  async processFilesToContexts(files: FileList | null): Promise<ContextResult[]> {
    const contexts: ContextResult[] = [];
    if (files && files.length > 0) {
      const filesArray = Array.from(files);
      for (const file of filesArray) {
        try {
          if (file.type.startsWith('image/')) {
            const base64Content = await this.readFileAsBase64(file);
            contexts.push(this.createFileContext(base64Content, 'image'));
          } else if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
            const content = await this.readFileContent(file);
            contexts.push(this.createFileContext(content, 'text'));
          }
        } catch (error) {
          console.error('Error reading file:', error);
        }
      }
    }
    return contexts;
  }

  private extractFiles(event: Event | DragEvent): FileList | null {
    if (event instanceof DragEvent && event.dataTransfer) {
      return event.dataTransfer.files;
    } else if (event.target instanceof HTMLInputElement) {
      return event.target.files;
    }
    return null;
  }

  private readFileContent(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        resolve(content);
      };
      reader.onerror = (e) => reject(e);
      reader.readAsText(file);
    });
  }

  private readFileAsBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        resolve(content.split(',')[1]); // Remove the data:image/jpeg;base64, part
      };
      reader.onerror = (e) => reject(e);
      reader.readAsDataURL(file);
    });
  }

  private createFileContext(content: string, type: string): ContextResult {
    return {
      type: type,
      content: content
    };
  }
}
