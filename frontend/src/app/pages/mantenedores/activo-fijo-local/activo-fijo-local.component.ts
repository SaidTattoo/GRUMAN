import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { ActivoFijoLocalService } from 'src/app/services/activo-fijo-local.service';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-activo-fijo-local',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatTableModule, MatButtonModule, MatIconModule],
  templateUrl: './activo-fijo-local.component.html',
  styleUrl: './activo-fijo-local.component.scss'
})
export class ActivoFijoLocalComponent implements OnInit {
  displayedColumns: string[] = ['cliente', 'local', 'tipoActivo','tipoEquipo','marca','PotenciaEquipo','refrigerante','on-off-inverter','suministra','codigo', 'acciones'];
  dataSource: MatTableDataSource<any> = new MatTableDataSource<any>();

  constructor(private activoFijoLocalService: ActivoFijoLocalService, private router: Router) {}

  ngOnInit(): void { 
    this.activoFijoLocalService.listar().subscribe(data => {
      this.dataSource.data = data;
    });
   }



  editar(activoFijoLocal: any) {
    this.router.navigate(['/mantenedores/activo-fijo-local/editar', activoFijoLocal.id]);
  }


  eliminar(activoFijoLocal: any) {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'No podrás revertir esto!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si, eliminar!'
    }).then((result) => {
      if (result.isConfirmed) {
        this.activoFijoLocalService.eliminar(activoFijoLocal.id).subscribe(data => {
          this.dataSource.data = this.dataSource.data.filter(item => item.id !== activoFijoLocal.id);
        });
      }
    });
  }
  crear() {
    this.router.navigate(['/mantenedores/activo-fijo-local/crear']);
  }

}
