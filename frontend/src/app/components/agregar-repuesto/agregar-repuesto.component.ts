import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-agregar-repuesto',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  template: `
    <h2 mat-dialog-title>{{ data.modoEdicion ? 'Editar' : 'Agregar' }} Repuesto</h2>
    <form [formGroup]="repuestoForm" (ngSubmit)="onSubmit()">
      <mat-dialog-content>
        <div class="form-container">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Artículo</mat-label>
            <input matInput formControlName="articulo" required>
            <mat-error *ngIf="repuestoForm.get('articulo')?.hasError('required')">
              El artículo es requerido
            </mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Marca</mat-label>
            <input matInput formControlName="marca" required>
            <mat-error *ngIf="repuestoForm.get('marca')?.hasError('required')">
              La marca es requerida
            </mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Cantidad</mat-label>
            <input matInput type="number" formControlName="cantidad" required min="1">
            <mat-error *ngIf="repuestoForm.get('cantidad')?.hasError('required')">
              La cantidad es requerida
            </mat-error>
            <mat-error *ngIf="repuestoForm.get('cantidad')?.hasError('min')">
              La cantidad debe ser mayor a 0
            </mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Precio</mat-label>
            <input matInput type="number" formControlName="precio_venta" required min="0">
            <span matPrefix>$&nbsp;</span>
            <mat-error *ngIf="repuestoForm.get('precio_venta')?.hasError('required')">
              El precio es requerido
            </mat-error>
            <mat-error *ngIf="repuestoForm.get('precio_venta')?.hasError('min')">
              El precio debe ser mayor o igual a 0
            </mat-error>
          </mat-form-field>
        </div>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button type="button" (click)="onCancel()">Cancelar</button>
        <button mat-raised-button color="primary" type="submit" [disabled]="!repuestoForm.valid">
          {{ data.modoEdicion ? 'Guardar' : 'Agregar' }}
        </button>
      </mat-dialog-actions>
    </form>
  `,
  styles: [`
    .form-container {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      padding: 1rem 0;
    }
    .full-width {
      width: 100%;
    }
  `]
})
export class AgregarRepuestoComponent implements OnInit {
  repuestoForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<AgregarRepuestoComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.repuestoForm = this.fb.group({
      articulo: ['', Validators.required],
      marca: ['', Validators.required],
      cantidad: [1, [Validators.required, Validators.min(1)]],
      precio_venta: [0, [Validators.required, Validators.min(0)]]
    });
  }

  ngOnInit() {
    if (this.data.modoEdicion && this.data.repuesto) {
      this.repuestoForm.patchValue({
        articulo: this.data.repuesto.repuesto.articulo,
        marca: this.data.repuesto.repuesto.marca,
        cantidad: this.data.repuesto.cantidad,
        precio_venta: this.data.repuesto.repuesto.precio_venta
      });
    }
  }

  onSubmit() {
    if (this.repuestoForm.valid) {
      const formValue = this.repuestoForm.value;
      const repuesto = {
        id: this.data.modoEdicion ? this.data.repuesto.id : Date.now(),
        repuesto: {
          articulo: formValue.articulo,
          marca: formValue.marca,
          precio_venta: formValue.precio_venta
        },
        cantidad: formValue.cantidad
      };
      this.dialogRef.close(repuesto);
    }
  }

  onCancel() {
    this.dialogRef.close();
  }
} 