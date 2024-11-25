import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { ServiciosRealizadosService } from 'src/app/services/servicios-realizados.service';

@Component({
  selector: 'app-lista-servicios-realizados',
  standalone: true,
  imports: [MatTableModule, MatCardModule, CommonModule],
  templateUrl: './lista-servicios-realizados.component.html',
  styleUrl: './lista-servicios-realizados.component.scss'
})
export class ListaServiciosRealizadosComponent implements OnInit {
  constructor(private serviciosRealizadosService: ServiciosRealizadosService) { }
  displayedColumns: string[] = ['id', 'tipoServicio', 'tipoSolicitud', 'diaSeleccionadoInicio', 'diaSeleccionadoTermino', 'mesFacturacion','tipoBusqueda'];
  dataSource: any[] = [];
  ngOnInit(): void {
    this.serviciosRealizadosService.getAll().subscribe((data: any) => {
      this.dataSource = data;
    });
  }
}
