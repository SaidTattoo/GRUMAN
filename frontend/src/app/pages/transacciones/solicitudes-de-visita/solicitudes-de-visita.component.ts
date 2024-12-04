import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCard, MatCardContent } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { SolicitarVisitaService } from 'src/app/services/solicitar-visita.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-solicitudes-de-visita',
  standalone: true,
  imports: [CommonModule, MatCard, MatTableModule, MatIconModule, MatButtonModule, MatCardContent],
  templateUrl: './solicitudes-de-visita.component.html',
  styleUrl: './solicitudes-de-visita.component.scss'
})
export class SolicitudesDeVisitaComponent implements OnInit {
  dataSource: any[] = [];
  displayedColumns: string[] = ['local','observaciones', 'imagenes', 'estado', 'acciones'];
  solicitudesVisita: any[] = [];
  constructor(private solicitarVisitaService: SolicitarVisitaService, private router: Router) {}


  ngOnInit(): void {
    this.solicitarVisitaService.getSolicitudesVisita().subscribe((data: any) => {
          this.dataSource = data;
    });
  }

  verSolicitud(solicitud: any) {
    console.log(solicitud);
    this.router.navigate(['/transacciones/solicitudes-de-visita', solicitud.id]);
  }
}

