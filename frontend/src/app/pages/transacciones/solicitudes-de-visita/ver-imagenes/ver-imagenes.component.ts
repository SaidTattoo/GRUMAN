import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
@Component({
  selector: 'app-ver-imagenes',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  templateUrl: './ver-imagenes.component.html',
  styleUrl: './ver-imagenes.component.scss'
})
export class VerImagenesComponent {
  constructor(
    public dialogRef: MatDialogRef<VerImagenesComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { imageUrl: string }
  ) {}

  close(): void {
    this.dialogRef.close();
  }
}
