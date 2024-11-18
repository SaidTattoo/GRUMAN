import { Component, inject, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { Router } from '@angular/router';
import { ListadoSolicitudAprobacionCorrectivaService } from 'src/app/services/listado-solicitud-aprobacion-correctiva.service';

@Component({
  selector: 'app-listado-solicitud-aprobacion-correctiva',
  standalone: true,
  imports: [ MatTableModule, 
    MatFormFieldModule, 
    MatInputModule, 
    MatCardModule, 
    MatIconModule, 
    MatButtonModule ],
  templateUrl: './listado-solicitud-aprobacion-correctiva.component.html',
  styleUrl: './listado-solicitud-aprobacion-correctiva.component.scss'
})
export class ListadoSolicitudAprobacionCorrectivaComponent implements OnInit {
  private router = inject(Router);
  constructor(private listadoSolicitudAprobacionCorrectivaService: ListadoSolicitudAprobacionCorrectivaService) {
   
  }

  displayedColumns: string[] = ['id', 'inspectorId','numeroLocal','acciones'];
  dataSource: MatTableDataSource<any> = new MatTableDataSource<any>();

  ngOnInit(): void {
    this.listarSolicitudes();
    }
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }
  editar(element: any) {
    this.router.navigate(['/transacciones/listado-solicitud-aprobacion-correctiva/editar-solicitud-aprobacion-correctiva', element.id]);
  }
  eliminar(element: any) {
    this.listadoSolicitudAprobacionCorrectivaService.removeSolicitudAprobacionCorrectiva(element.id).subscribe(data => {
      console.log(data);
      this.listarSolicitudes();
    });
  }

  listarSolicitudes() {
    this.listadoSolicitudAprobacionCorrectivaService.findAllSolicitudesAprobacionCorrectiva().subscribe(data => {
      this.dataSource = new MatTableDataSource(data);
      console.log(this.dataSource);
    });
  }
  crearSolicitud() {
    this.router.navigate(['/transacciones/solicitud-aprobacion-correctiva']);
  }
}
