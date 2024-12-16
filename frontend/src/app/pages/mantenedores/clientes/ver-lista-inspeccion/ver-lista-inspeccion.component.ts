// frontend/src/app/pages/mantenedores/clientes/ver-lista-inspeccion/ver-lista-inspeccion.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonModule } from '@angular/common';
import { ClientesService } from 'src/app/services/clientes.service';
import { InspectionService } from 'src/app/services/inspection.service';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-ver-lista-inspeccion',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './ver-lista-inspeccion.component.html',
  styleUrls: ['./ver-lista-inspeccion.component.scss']
})
export class VerListaInspeccionComponent implements OnInit {
  cliente: any;
  sections: any[] = [];
  isLoading = true;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private clientesService: ClientesService,
    private inspectionService: InspectionService
  ) {}

  ngOnInit() {
    const clienteId = this.route.snapshot.params['id'];
    
    this.clientesService.getCliente(clienteId).subscribe({
      next: (cliente) => {
        this.cliente = cliente;
        this.cargarListaInspeccion(clienteId);
      },
      error: (error) => {
        this.error = 'Error al cargar los datos del cliente';
        this.isLoading = false;
      }
    });
  }
  get tieneInspecciones(): boolean {
    return this.sections && this.sections.length > 0;
  }
  cargarListaInspeccion(clienteId: number) {
  
    this.clientesService.getCliente(clienteId).subscribe((cliente: any) => {
      this.cliente = cliente;
      if (cliente.listaInspeccion) {
        
        this.sections = cliente.listaInspeccion;
        this.isLoading = false;
      }
    });
  }
  
  volver() {
    this.router.navigate(['/mantenedores/clientes']);
  }
}