import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MaterialModule } from 'src/app/material.module';
import { TecnicosService } from 'src/app/services/tecnicos.service';
import Swal from 'sweetalert2';
import { CrearTecnicoComponent } from './crear-tecnico/crear-tecnico.component';
import { EditarTecnicoComponent } from './editar-tecnico/editar-tecnico.component';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-tecnicos',
  standalone: true,
  imports: [ CommonModule, MaterialModule, ReactiveFormsModule, MatIconModule ],
  templateUrl: './tecnicos.component.html',
  styleUrl: './tecnicos.component.scss'
})
export class TecnicosComponent implements OnInit {

  displayedColumns: string[] = ['nombre', 'acciones'];
  dataSource = new MatTableDataSource<any>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private tecnicosService: TecnicosService, private authService: AuthService, public dialog: MatDialog, private router: Router) {}

  ngOnInit(): void {
    this.loadTecnicos();
  }

  loadTecnicos() {
    this.tecnicosService.getTecnicos().subscribe((tecnicos: any) => {
      this.dataSource.data = tecnicos;
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  editar(tecnico: any) {
    this.router.navigate(['/mantenedores/cliente-usuarios/editar', tecnico.id]);
  }

  eliminar(tecnico: any) {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
    }).then((result: any) => {
      if (result.isConfirmed) {
        this.tecnicosService.deleteTecnico(tecnico.id).subscribe(() => {
          this.dataSource.data = this.dataSource.data.filter((t) => t.id !== tecnico.id);
          Swal.fire('Eliminado', 'El técnico ha sido eliminado', 'success');
        });
      }
    });
  }

  openCrearTecnicoModal() {
    this.router.navigate(['/mantenedores/cliente-usuarios']);
   /*  const dialogRef = this.dialog.open(CrearTecnicoComponent);

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadTecnicos();
      }
    }); */
  }

  agregarDocumento(tecnico: any) {
    //console.log(tecnico);
    this.router.navigate(['/mantenedores/documentos/subir-documento', {
      tipo: 3,//tecnico 
      tecnico: tecnico.id,
      cliente: null,
      repuesto: null,
      vehiculo: null
    }]);
  }
  cambiarPassword(tecnico: any) {
    //console.log(tecnico);
    this.router.navigate(['/mantenedores/tecnicos/cambiar-password', { tecnico: tecnico.id }]);
  }
}
