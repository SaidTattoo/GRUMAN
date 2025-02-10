import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-dialog-photo-viewer',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule],
  template: `
    <div class="photo-viewer">
      <div class="navigation-buttons" *ngIf="imageUrls.length > 1">
        <button mat-icon-button (click)="previousImage()" [disabled]="currentIndex === 0">
          <mat-icon>chevron_left</mat-icon>
        </button>
        <span class="image-counter">{{currentIndex + 1}} / {{imageUrls.length}}</span>
        <button mat-icon-button (click)="nextImage()" [disabled]="currentIndex === imageUrls.length - 1">
          <mat-icon>chevron_right</mat-icon>
        </button>
      </div>
      <img [src]="currentImage" alt="Imagen de inspección">
    </div>
  `,
  styles: [`
    .photo-viewer {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 20px;
    }
    
    .navigation-buttons {
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 10px;
    }
    
    .image-counter {
      margin: 0 15px;
    }
    
    img {
      max-width: 100%;
      max-height: 70vh;
      object-fit: contain;
    }
  `]
})
export class DialogPhotoViewerComponent {
  imageUrls: string[] = [];
  currentIndex = 0;
  
  constructor(
    public dialogRef: MatDialogRef<DialogPhotoViewerComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { imageUrls: string[] }
  ) {
    this.imageUrls = data.imageUrls;
  }
  
  get currentImage(): string {
    return this.imageUrls[this.currentIndex];
  }
  
  previousImage(): void {
    if (this.currentIndex > 0) {
      this.currentIndex--;
    }
  }
  
  nextImage(): void {
    if (this.currentIndex < this.imageUrls.length - 1) {
      this.currentIndex++;
    }
  }
} 