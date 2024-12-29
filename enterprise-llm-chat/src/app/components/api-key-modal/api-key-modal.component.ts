import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { UserApiService } from '../../services/user-api.service';

@Component({
  selector: 'app-api-key-modal',
  templateUrl: './api-key-modal.component.html',
  styleUrls: ['./api-key-modal.component.css']
})
export class ApiKeyModalComponent {
    apiKey: string = '';
    isLoading: boolean = false;
    error: string = '';
    hide: boolean = true;
  
    constructor(
      private userApiService: UserApiService,
      public dialogRef: MatDialogRef<ApiKeyModalComponent>,
      @Inject(MAT_DIALOG_DATA) public data: { currentKey?: string }
    ) {
      this.apiKey = data.currentKey || '';
    }
  
    toggleVisibility() {
      this.hide = !this.hide;
    }
  
    onSubmit() {
      this.isLoading = true;
      this.error = '';
  
      this.userApiService.updateApiKey('jira', this.apiKey).subscribe(
        () => {
          this.dialogRef.close(true);
        },
        error => {
          this.error = 'Failed to update API key';
          this.isLoading = false;
        }
      );
    }
  
    onCancel() {
      this.dialogRef.close();
    }
  }