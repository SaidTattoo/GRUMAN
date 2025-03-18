import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/app/config';
import { ConfirmDialogComponent } from 'src/app/components/confirm-dialog/confirm-dialog.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule, MatLabel } from '@angular/material/form-field';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-causa-raiz',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule, 
    MatPaginatorModule, 
    MatSortModule, 
    MatIconModule, 
    MatButtonModule,
    MatCardModule,
    MatDialogModule, 
    MatSnackBarModule,
    MatFormFieldModule,   // En lugar de MatLabel
    MatInputModule,       // Necesario para matInput
    MatTooltipModule,     // Para matTooltip
    MatProgressSpinnerModule  // Si usas mat-spinner
  ],
  templateUrl: './causa-raiz.component.html',
  styleUrl: './causa-raiz.component.scss'
})
export class CausaRaizComponent implements OnInit {
  dataSource: MatTableDataSource<any>;
  displayedColumns: string[] = [ 'nombre', 'acciones'];
  loading = false;
  
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(
    private http: HttpClient,
    private router: Router,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
    this.dataSource = new MatTableDataSource<any>([]);
  }

  ngOnInit(): void {
    this.loadCausasRaiz();
  }

  ngAfterViewInit() {
    if (this.dataSource) {
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    }
  }

  loadCausasRaiz() {
    this.loading = true;
    this.http.get<any[]>(`${environment.apiUrl}causas-raiz`)
      .subscribe({
        next: (data) => {
          this.dataSource.data = data;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error al cargar causas raíz:', error);
          this.snackBar.open('Error al cargar causas raíz', 'Cerrar', { duration: 3000 });
          this.loading = false;
        }
      });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  crearCausaRaiz() {
    this.router.navigate(['/mantenedores/causa-raiz/crear']);
  }

  editarCausaRaiz(causaRaiz: any) {
    this.router.navigate([`/mantenedores/causa-raiz/editar/${causaRaiz.id}`]);
  }

  eliminarCausaRaiz(causaRaiz: any) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '350px',
      data: {
        title: 'Confirmar eliminación',
        message: `¿Está seguro que desea eliminar la causa raíz "${causaRaiz.nombre}"?`
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.http.delete(`${environment.apiUrl}causas-raiz/${causaRaiz.id}`)
          .subscribe({
            next: () => {
              this.snackBar.open('Causa raíz eliminada correctamente', 'Cerrar', { duration: 3000 });
              this.loadCausasRaiz();
            },
            error: (error) => {
              console.error('Error al eliminar causa raíz:', error);
              this.snackBar.open('Error al eliminar causa raíz', 'Cerrar', { duration: 3000 });
            }
          });
      }
    });
  }
}
