import { Component, Inject, ViewEncapsulation, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ContextResult } from '@models';

@Component({
  selector: 'app-context-viewer',
  templateUrl: './context-viewer.component.html',
  styleUrl: './context-viewer.component.css',
  encapsulation: ViewEncapsulation.None
})
export class ContextViewerComponent implements AfterViewInit {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: ContextResult,
    private dialogRef: MatDialogRef<ContextViewerComponent>,
    private cdr: ChangeDetectorRef
  ) {}

  ngAfterViewInit() {
    // Trigger change detection to ensure proper rendering
    this.cdr.detectChanges();
  }

  getImageSrc(): string {
    if (this.data.type === 'image') {
      return `data:image/jpeg;base64,${this.data.content}`;
    }
    return '';
  }

  isTextContext(): boolean {
    return this.data.type === 'text';
  }

  getTextContent(): string {
    return this.data.content;
  }

  close(): void {
    this.dialogRef.close();
  }
}
