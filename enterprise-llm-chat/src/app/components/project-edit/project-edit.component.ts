import { Component, OnInit, ViewChild, ElementRef, HostListener } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ProjectService } from '../../services/project.service';
import { ContextResult, Project } from '@models';
import { MatDialog } from '@angular/material/dialog';
import { TextContentDialogComponent } from '../text-content-dialog/text-content-dialog.component';
import { MatMenuTrigger } from '@angular/material/menu';
import { ConversationService } from '../../services/conversation.service';
import { Conversation, Message } from '@models';
import { ChatService } from '../../services/chat.service';

interface KnowledgeItem {
  icon: string;
  title: string;
  content: string;
  type: string;
}

@Component({
  selector: 'app-project-edit',
  templateUrl: './project-edit.component.html',
  styleUrls: ['./project-edit.component.css']
})
export class ProjectEditComponent implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  @ViewChild(MatMenuTrigger) menuTrigger!: MatMenuTrigger;
  @ViewChild('chatInput') chatInput!: ElementRef<HTMLTextAreaElement>;
  
  project: Project = {
    name: '',
    description: '',
    contexts: [],
    conversations: [],
    is_public: false,
    updated_at: new Date().toISOString()
  };

  isDragging = false;
  knowledgeItems: KnowledgeItem[] = [];
  conversations: Conversation[] = [];
  newMessage: string = '';
  isLoadingConversations: boolean = false;
  isLoadingProject: boolean = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private projectService: ProjectService,
    private conversationService: ConversationService,
    private dialog: MatDialog,
    private chatService: ChatService
  ) {}

  ngOnInit() {
    const projectId = this.route.snapshot.paramMap.get('id');
    if (projectId) {
      this.loadProject(projectId);
      this.loadProjectConversations(projectId);
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
    this.isDragging = false;
  }

  @HostListener('drop', ['$event'])
  async onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      const filesArray = Array.from(files);
      for (const file of filesArray) {
        if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
          try {
            const content = await this.readFileContent(file);
            this.addContext({
              type: 'text',
              content: content,
              title: file.name
            });
          } catch (error) {
            console.error('Error reading file:', error);
          }
        }
      }
    }
  }

  handleFileInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      Array.from(input.files).forEach(async file => {
        if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
          try {
            const content = await this.readFileContent(file);
            this.addContext({
              type: 'text',
              content: content,
              title: file.name
            });
          } catch (error) {
            console.error('Error reading file:', error);
          }
        }
      });
      input.value = '';
    }
  }

  private readFileContent(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = (e) => reject(e);
      reader.readAsText(file);
    });
  }

  private getFileType(file: File): string {
    if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
      return 'text';
    }
    if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
      return 'pdf';
    }
    if (file.type === 'application/msword' || file.name.endsWith('.doc') || file.name.endsWith('.docx')) {
      return 'doc';
    }
    return 'text';
  }

  addContext(context: { type: string; content: string; title: string }) {
    if (!this.project.project_id) {
      console.error('No project ID available');
      return;
    }

    const newContext: ContextResult = {
      type: context.type,
      content: context.content,
      project_id: this.project.project_id,
      name: context.title
    };

    this.project.contexts = [...(this.project.contexts || []), newContext];
    this.knowledgeItems = [...this.knowledgeItems, {
      icon: this.getIconForType(context.type),
      title: context.title,
      content: context.content,
      type: context.type
    }];

    this.saveProject();
  }

  private getIconForType(type: string): string {
    switch (type) {
      case 'pdf':
        return 'picture_as_pdf';
      case 'doc':
        return 'article';
      default:
        return 'description';
    }
  }

  removeContext(index: number) {
    this.project.contexts = this.project.contexts.filter((_, i) => i !== index);
    this.knowledgeItems = this.knowledgeItems.filter((_, i) => i !== index);
    this.saveProject();
  }

  loadProject(projectId: string) {
    this.isLoadingProject = true;
    this.projectService.getProject(projectId).subscribe({
      next: (project) => {
        this.project = project;
        this.knowledgeItems = project.contexts.map((context: ContextResult) => ({
          icon: context.type,
          title: context.name || context.content.slice(0, 100),
          content: context.content,
          type: context.type
        }));
        this.isLoadingProject = false;
      },
      error: (error) => {
        console.error('Error loading project:', error);
        this.isLoadingProject = false;
      }
    });
  }

  saveProject() {
    this.projectService.updateProject(this.project).subscribe({
      next: () => {
        // Show success message or redirect
      },
      error: (error) => {
        console.error('Error saving project:', error);
        // Handle error (show message)
      }
    });
  }

  navigateBack() {
    this.router.navigate(['/projects']);
  }

  openTextContentDialog(): void {
    const dialogRef = this.dialog.open(TextContentDialogComponent, {
      width: '600px',
      position: { top: '100px' },
      panelClass: ['dark-theme-dialog', 'center-dialog']
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.addContext({
          type: 'text',
          content: result.content,
          title: result.title
        });
      }
    });
  }

  private loadProjectConversations(projectId: string) {
    this.isLoadingConversations = true;
    this.conversationService.getProjectConversations(projectId).subscribe({
      next: (conversations: Conversation[]) => {
        this.conversations = conversations;
        this.isLoadingConversations = false;
      },
      error: (error: any) => {
        console.error('Error loading conversations:', error);
        this.isLoadingConversations = false;
      }
    });
  }

  getConversationPreview(conversation: Conversation): string {
    const lastMessage = conversation.messages
      .filter(m => m.content)
      .sort((a, b) => b.sequence - a.sequence)[0];
    return lastMessage?.content?.slice(0, 100) + '...' || 'No messages';
  }

  onEnter(event: any): void {
    if (event.shiftKey) return;
    event.preventDefault();
    this.startNewConversation();
  }

  startNewConversation() {
    if (!this.newMessage.trim() || !this.project.project_id) return;
    
    this.chatService.setInitialMessage(this.newMessage);
    this.chatService.setProjectId(this.project.project_id);
    this.router.navigate(['/chat']);
  }

  openConversation(conversation: Conversation): void {
    if (conversation.conversation_id) {
      this.router.navigate(['/chat'], { queryParams: { id: conversation.conversation_id } });
    }
  }

  viewContext(item: KnowledgeItem): void {
    this.dialog.open(TextContentDialogComponent, {
      width: '600px',
      position: { top: '100px' },
      panelClass: ['dark-theme-dialog', 'center-dialog'],
      data: {
        title: item.title,
        content: item.content,
        readOnly: true
      }
    });
  }
}
