import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-historial-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatTableModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title>Historial de Cambios de Precio</h2>
    <mat-dialog-content>
      <table mat-table [dataSource]="data.historial" class="w-100">
        <ng-container matColumnDef="fecha">
          <th mat-header-cell *matHeaderCellDef>Fecha</th>
          <td mat-cell *matCellDef="let item">{{item.fecha_cambio | date:'dd/MM/yyyy HH:mm'}}</td>
        </ng-container>

        <ng-container matColumnDef="precio_venta_anterior">
          <th mat-header-cell *matHeaderCellDef>Precio Venta Anterior</th>
          <td mat-cell *matCellDef="let item">{{item.precio_venta_anterior | currency:'CLP':'symbol':'1.0-0':'es-CL'}}</td>
        </ng-container>

        <ng-container matColumnDef="precio_venta_nuevo">
          <th mat-header-cell *matHeaderCellDef>Precio Venta Nuevo</th>
          <td mat-cell *matCellDef="let item">{{item.precio_venta_nuevo | currency:'CLP':'symbol':'1.0-0':'es-CL'}}</td>
        </ng-container>

        <ng-container matColumnDef="precio_compra_anterior">
          <th mat-header-cell *matHeaderCellDef>Precio Compra Anterior</th>
          <td mat-cell *matCellDef="let item">{{item.precio_compra_anterior | currency:'CLP':'symbol':'1.0-0':'es-CL'}}</td>
        </ng-container>

        <ng-container matColumnDef="precio_compra_nuevo">
          <th mat-header-cell *matHeaderCellDef>Precio Compra Nuevo</th>
          <td mat-cell *matCellDef="let item">{{item.precio_compra_nuevo | currency:'CLP':'symbol':'1.0-0':'es-CL'}}</td>
        </ng-container>

        <ng-container matColumnDef="usuario">
          <th mat-header-cell *matHeaderCellDef>Usuario</th>
          <td mat-cell *matCellDef="let item">{{item.usuario_modificacion}}</td>
        </ng-container>

        <ng-container matColumnDef="motivo">
          <th mat-header-cell *matHeaderCellDef>Motivo</th>
          <td mat-cell *matCellDef="let item">{{item.motivo_cambio}}</td>
        </ng-container>

        <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
        <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
      </table>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="cerrar()">Cerrar</button>
    </mat-dialog-actions>
  `,
  styles: [`
    table {
      width: 100%;
    }
    .mat-column-fecha {
      min-width: 140px;
    }
    .mat-column-usuario {
      min-width: 120px;
    }
    .mat-column-motivo {
      min-width: 200px;
    }
  `]
})
export class HistorialDialogComponent {
  displayedColumns = ['fecha', 'precio_venta_anterior', 'precio_venta_nuevo', 
                     'precio_compra_anterior', 'precio_compra_nuevo', 'usuario', 'motivo'];

  constructor(
    public dialogRef: MatDialogRef<HistorialDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {historial: any[]}
  ) {}

  cerrar(): void {
    this.dialogRef.close();
  }
} 