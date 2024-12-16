import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

interface DialogData {
  title?: string;
  content?: string;
  readOnly?: boolean;
}

@Component({
  selector: 'app-text-content-dialog',
  templateUrl: './text-content-dialog.component.html',
  styleUrls: ['./text-content-dialog.component.css']
})
export class TextContentDialogComponent {
  title: string = '';
  content: string = '';
  readOnly: boolean = false;

  constructor(
    public dialogRef: MatDialogRef<TextContentDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {
    this.title = data?.title || '';
    this.content = data?.content || '';
    this.readOnly = data?.readOnly || false;
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onAdd(): void {
    if (this.title.trim() && this.content.trim()) {
      this.dialogRef.close({ title: this.title, content: this.content });
    }
  }
} 