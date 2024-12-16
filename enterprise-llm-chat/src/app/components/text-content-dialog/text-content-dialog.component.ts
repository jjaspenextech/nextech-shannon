import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-text-content-dialog',
  templateUrl: './text-content-dialog.component.html',
  styleUrls: ['./text-content-dialog.component.css']
})
export class TextContentDialogComponent {
  title: string = '';
  content: string = '';

  constructor(public dialogRef: MatDialogRef<TextContentDialogComponent>) {}

  onCancel(): void {
    this.dialogRef.close();
  }

  onAdd(): void {
    if (this.title.trim() && this.content.trim()) {
      this.dialogRef.close({ title: this.title, content: this.content });
    }
  }
} 