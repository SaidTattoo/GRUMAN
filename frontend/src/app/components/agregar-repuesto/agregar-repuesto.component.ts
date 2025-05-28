import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { RepuestosService } from 'src/app/services/repuestos.service';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-agregar-repuesto',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
  ],
  template: `
    <h2 mat-dialog-title>
      {{ data.modoEdicion ? 'Editar' : 'Agregar' }} Repuesto
    </h2>
    <form [formGroup]="repuestoForm" (ngSubmit)="onSubmit()" class="form-container">
    <div class="p-5"> 
      <mat-form-field class="full-width">
        <mat-label>Repuesto</mat-label>
        <mat-select formControlName="articulo">
          @for (repuesto of repuestosList; track repuesto.id) {
            <mat-option [value]="repuesto">
              {{ repuesto.articulo }} - {{ repuesto.marca }} - {{ repuesto.precio_venta | number:'1.0-0' }}
            </mat-option>
          }
        </mat-select>
      </mat-form-field>

      <mat-form-field class="full-width">
        <mat-label>Cantidad</mat-label>
        <input matInput type="number" formControlName="cantidad" min="1">
      </mat-form-field>

      <div mat-dialog-actions align="end">
        <button mat-button type="button" (click)="dialogRef.close()">Cancelar</button>
        <button mat-raised-button color="primary" type="submit">
          {{ data.modoEdicion ? 'Guardar' : 'Agregar' }}
        </button>
      </div>
      </div>
    </form>
  `,
  styles: [
    `
      .form-container {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        padding: 1rem 0;
      }
      .full-width {
        width: 100%;
      }
    `,
  ],
})
export class AgregarRepuestoComponent implements OnInit {
  repuestoForm: FormGroup;
  repuestosList: any[] = [];

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<AgregarRepuestoComponent>,
    private repuestosService: RepuestosService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.repuestoForm = this.fb.group({
      articulo: ['', Validators.required],
      cantidad: [1, [Validators.required, Validators.min(1)]],
    });
  }

  ngOnInit() {
    this.repuestosService.getRepuestos().subscribe((res: any) => {
      this.repuestosList = res;
      
      if (this.data.modoEdicion && this.data.repuesto) {
        const repuestoSeleccionado = this.repuestosList.find(
          r => r.articulo === this.data.repuesto.repuesto.articulo && 
               r.marca === this.data.repuesto.repuesto.marca
        );

        this.repuestoForm.patchValue({
          articulo: repuestoSeleccionado,
          cantidad: this.data.repuesto.cantidad,
        });
      }
    });
  }

  onSubmit() {
    if (this.repuestoForm.valid) {
      const formValue = this.repuestoForm.value;
      const repuesto = {
        cantidad: formValue.cantidad,
        id: formValue.articulo.id,
        repuesto: {
          id: formValue.articulo.id,
          familia: formValue.articulo.familia,
          articulo: formValue.articulo.articulo,
          marca: formValue.articulo.marca,
          codigoBarra: formValue.articulo.codigoBarra || '',
          precio_compra: formValue.articulo.precio_compra || '0.00',
          precio_venta: formValue.articulo.precio_venta || '0.00',
          valor_uf: formValue.articulo.valor_uf || false,
          clima: formValue.articulo.clima || false
        }
      };
      this.dialogRef.close(repuesto);
    }
  }

  onCancel() {
    this.dialogRef.close();
  }
} 