import { CommonModule, JsonPipe } from '@angular/common';
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router } from '@angular/router';
import { ClientesService } from 'src/app/services/clientes.service';
import { FacturacionService } from 'src/app/services/facturacion.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-mes-de-facturacion',
  standalone: true,
  imports: [ CommonModule, MatCardModule , JsonPipe, MatTableModule, MatIconModule, MatButtonModule, MatTooltipModule ],
  templateUrl: './mes-de-facturacion.component.html',
  styleUrl: './mes-de-facturacion.component.scss'
})
export class MesDeFacturacionComponent {
    constructor(private clientService: ClientesService, private router: Router, private facturacionService: FacturacionService) {}
    clientes: any[] = [];
    displayedColumns: string[] = ['cliente', 'fechaMesFacturacion',  'acciones'];
    dataSource: any[] = [];
    ngOnInit() {
        this.getClientes();
        
    }


    getClientes() {
        this.clientService.getClientes().subscribe((clientes) => {
            this.clientes = clientes;
            this.dataSource = clientes;
        });
    }

    editarMesDeFacturacion(id: number) {
        this.router.navigate(['/mantenedores/mes-de-facturacion/update', id]);
    }
    generarMesFacturacion(element: any) {
        Swal.fire({
            title: '¿Estás seguro?',
            text: '¿Deseas generar la facturación mensual para este cliente?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Generar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                this.facturacionService.generarFacturacionMensualAutomatica(element.id, 2024, 1).subscribe((res) => {
                    this.getClientes();
                });
            }
        });
    }

    generarFacturacionManual() {
        Swal.fire({
            title: '¿Estás seguro?',
            text: '¿Deseas generar la facturación mensual para todos los clientes?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Generar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                this.facturacionService.generarFacturacionMensualManual().subscribe({
                    next: () => {
                        Swal.fire(
                            '¡Éxito!',
                            'La facturación mensual se ha generado correctamente',
                            'success'
                        );
                        this.getClientes(); // Actualizar la lista
                    },
                    error: (error) => {
                        Swal.fire(
                            'Error',
                            'Hubo un error al generar la facturación mensual',
                            'error'
                        );
                        console.error('Error:', error);
                    }
                });
            }
        });
    }
}
