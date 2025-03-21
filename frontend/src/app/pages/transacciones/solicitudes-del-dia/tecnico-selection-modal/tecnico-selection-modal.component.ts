import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { SolicitarVisitaService } from 'src/app/services/solicitar-visita.service';
import { MatIconModule } from '@angular/material/icon';

interface DialogData {
  solicitudId: number;
  currentTecnicoId?: number;
  tipo: 'tecnico' | 'tecnico_2';
}

@Component({
  selector: 'app-tecnico-selection-modal',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatListModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatIconModule
  ],
  template: `
    <h2 mat-dialog-title>Seleccionar Técnico</h2>
    <mat-dialog-content>
      <mat-form-field appearance="outline" class="w-100 mb-3">
        <mat-label>Buscar técnico</mat-label>
        <input matInput [(ngModel)]="searchText" (keyup)="filterTecnicos()" placeholder="Nombre del técnico">
        <mat-icon matSuffix>search</mat-icon>
      </mat-form-field>

      <div *ngIf="isLoading" class="text-center p-3">
        <mat-spinner diameter="40"></mat-spinner>
      </div>

      <div *ngIf="!isLoading && filteredTecnicos.length === 0" class="text-center p-3">
        No se encontraron técnicos
      </div>

      <mat-selection-list #tecnicoList [multiple]="false">
        <mat-list-option *ngFor="let tecnico of filteredTecnicos" 
                        [value]="tecnico.id"
                        [selected]="tecnico.id === data.currentTecnicoId">
          <div class="d-flex align-items-center">
            <span>{{tecnico.name}} {{tecnico.lastName}}</span>
          </div>
        </mat-list-option>
      </mat-selection-list>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onNoClick()">Cancelar</button>
      <button mat-raised-button 
              color="primary" 
              [disabled]="!tecnicoList.selectedOptions.selected[0]?.value"
              (click)="onConfirm(tecnicoList.selectedOptions.selected[0]?.value)">
        Confirmar
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    mat-dialog-content {
      min-height: 200px;
      max-height: 400px;
    }
    .w-100 {
      width: 100%;
    }
    .mb-3 {
      margin-bottom: 1rem;
    }
  `]
})
export class TecnicoSelectionModalComponent implements OnInit {
  tecnicos: any[] = [];
  filteredTecnicos: any[] = [];
  isLoading = false;
  searchText = '';

  constructor(
    public dialogRef: MatDialogRef<TecnicoSelectionModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private solicitarVisitaService: SolicitarVisitaService
  ) {}

  ngOnInit() {
    this.loadTecnicos();
  }

  loadTecnicos() {
    this.isLoading = true;
    this.solicitarVisitaService.getTecnicos().subscribe({
      next: (response: any) => {
        this.tecnicos = response.data || response;
        this.filteredTecnicos = [...this.tecnicos];
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading tecnicos:', error);
        this.isLoading = false;
      }
    });
  }

  filterTecnicos() {
    if (!this.searchText) {
      this.filteredTecnicos = [...this.tecnicos];
      return;
    }

    const searchStr = this.searchText.toLowerCase();
    this.filteredTecnicos = this.tecnicos.filter(tecnico => 
      tecnico.name.toLowerCase().includes(searchStr) ||
      tecnico.lastName.toLowerCase().includes(searchStr)
    );
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  onConfirm(tecnicoId: number): void {
    this.dialogRef.close({
      tecnicoId: tecnicoId,
      tipo: this.data.tipo
    });
  }
} 