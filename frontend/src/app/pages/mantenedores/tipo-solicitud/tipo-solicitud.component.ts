import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { Router } from '@angular/router';
import { TipoSolicitudService } from './tipo-solicitud.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-tipo-solicitud',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatTableModule, MatButtonModule, MatIconModule, MatCardModule],
  templateUrl: './tipo-solicitud.component.html',
  styleUrl: './tipo-solicitud.component.scss'
})
export class TipoSolicitudComponent {
  constructor(private tipoSolicitudService: TipoSolicitudService, private router: Router) {}
  
  displayedColumns: string[] = ['nombre', 'sla_dias', 'sla_hora', 'cliente','acciones'];
  dataSource: any[] = [];
  clientes: any[] = [];
  ngOnInit(): void {
    this.getAllTipoSolicitud();
    this.getAllClientes();
  }

  getAllTipoSolicitud() {
    this.tipoSolicitudService.findAll().subscribe((data) => {
      this.dataSource = data;
    });
  }

  getAllClientes() {
      this.tipoSolicitudService.findAllClientes().subscribe((data) => {
        this.clientes = data;
      });
  }

  crear() {
    this.router.navigate(['/mantenedores/tipo-solicitud/crear']);
  }

  editar(element: any) {
    this.router.navigate(['/mantenedores/tipo-solicitud/editar', element.id]);
  }

  eliminar(element: any) {
    Swal.fire({
      title: '¿Estás seguro?',
      text: "Los datos no se pueden modificar una vez guardados.",
      icon: 'warning',
      showCancelButton: true,
    }).then((result) => {
      if (result.isConfirmed) {
        this.tipoSolicitudService.delete(element.id).subscribe((data) => {
          this.getAllTipoSolicitud();
        });
      }
    });
  }
}
