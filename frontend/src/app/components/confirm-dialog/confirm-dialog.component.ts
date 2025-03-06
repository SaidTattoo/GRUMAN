import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';

export interface ConfirmDialogData {
  title: string;
  message: string;
  inputLabel?: string;
  inputPlaceholder?: string;
  inputValue?: string;
  requireInput?: boolean;
  confirmText?: string;
  cancelText?: string;
  confirmColor?: string;
}

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [
    CommonModule, 
    MatDialogModule, 
    MatButtonModule, 
    MatInputModule, 
    MatFormFieldModule, 
    FormsModule
  ],
  template: `
    <h2 mat-dialog-title>{{ data.title }}</h2>
    <mat-dialog-content>
      <p>{{ data.message }}</p>
      
      <mat-form-field *ngIf="data.inputLabel" class="full-width">
        <mat-label>{{ data.inputLabel }}</mat-label>
        <textarea 
          matInput 
          [(ngModel)]="inputValue" 
          [placeholder]="data.inputPlaceholder || ''"
          rows="3"></textarea>
        <mat-error *ngIf="data.requireInput && !inputValue">Este campo es obligatorio</mat-error>
      </mat-form-field>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onNoClick()">{{ data.cancelText || 'Cancelar' }}</button>
      <button 
        mat-button 
        [color]="data.confirmColor || 'primary'" 
        [disabled]="data.requireInput && !inputValue"
        (click)="onConfirm()">
        {{ data.confirmText || 'Confirmar' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .full-width {
      width: 100%;
    }
  `]
})
export class ConfirmDialogComponent {
  inputValue: string = '';

  constructor(
    public dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmDialogData
  ) {
    this.inputValue = data.inputValue || '';
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  onConfirm(): void {
    if (this.data.requireInput && !this.inputValue) {
      return;
    }
    this.dialogRef.close(this.data.inputLabel ? this.inputValue : true);
  }
} 