import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { Router } from '@angular/router';
import { TipoServicioService } from 'src/app/services/tipo-servicio.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-tipo-servicio',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatTableModule, MatButtonModule, MatIconModule, ],

  templateUrl: './tipo-servicio.component.html',
  styleUrl: './tipo-servicio.component.scss'
})
export class TipoServicioComponent {
  constructor(private tipoServicioService: TipoServicioService, private router: Router) {}
  displayedColumns: string[] = [ 'nombre', 'acciones'];
  dataSource: any[] = [];
  ngOnInit(): void {
    this.getAllTipoServicio();
   
  }

  getAllTipoServicio() {
    this.tipoServicioService.findAll().subscribe((data) => {
      this.dataSource = data;
    });
  }

  crear() {
    this.router.navigate(['/mantenedores/tipo-servicio/crear']);
  }
  editar(element: any) {
    this.router.navigate(['/mantenedores/tipo-servicio/editar', element.id]);
  }
  eliminar(element: any) {
    Swal.fire({
      title: '¿Estás seguro?',
      text: "Los datos no se pueden modificar una vez guardados.",
      icon: 'warning',
      showCancelButton: true,
    }).then((result) => {
      if (result.isConfirmed) {
        this.tipoServicioService.deleteTipoServicio(element.id).subscribe((data) => {
          this.getAllTipoServicio();
          
        });
      }
    });
  }
}
