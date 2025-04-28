import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { ActivatedRoute, Router } from '@angular/router';
import { TipoSolicitudService } from '../tipo-solicitud.service';
import { Observable, map, startWith } from 'rxjs';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-editar-tipo-solicitud',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatAutocompleteModule
  ],
  templateUrl: './editar-tipo-solicitud.component.html',
  styleUrls: ['./editar-tipo-solicitud.component.scss']
})
export class EditarTipoSolicitudComponent implements OnInit {
  tipoSolicitud: FormGroup;
  solicitud: any;
  clientes: any[] = [];
  filteredClientes: Observable<any[]>;
  selectedCliente: any;

  constructor(
    private fb: FormBuilder, 
    private tipoSolicitudService: TipoSolicitudService, 
    private router: Router, 
    private route: ActivatedRoute
  ) {
    this.tipoSolicitud = this.fb.group({
      nombre: ['', Validators.required],
      sla_dias: ['', [Validators.required, Validators.min(0)]],
      sla_hora: ['', Validators.required],
      id_cliente: ['', Validators.required]
    });
  }

  ngOnInit() {
    // Cargar datos del tipo de solicitud primero
    this.tipoSolicitudService.findById(this.route.snapshot.params['id']).subscribe((data) => {
      this.solicitud = data;
      
      // Luego cargar los clientes
      this.tipoSolicitudService.findAllClientes().subscribe((clientes) => {
        this.clientes = clientes;
        
        // Encontrar el cliente correspondiente
        const clienteSeleccionado = this.clientes.find(cliente => cliente.id === this.solicitud.id_cliente);
        
        if (clienteSeleccionado) {
          this.selectedCliente = clienteSeleccionado;
          this.tipoSolicitud.patchValue({
            nombre: this.solicitud.nombre,
            sla_dias: this.solicitud.sla_dias,
            sla_hora: this.solicitud.sla_hora,
            id_cliente: clienteSeleccionado
          });
        }
        
        this.setupAutocomplete();
      });
    });
  }

  private setupAutocomplete(): void {
    this.filteredClientes = this.tipoSolicitud.get('id_cliente')!.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value))
    );
  }

  private _filter(value: string): any[] {
    const filterValue = value?.toLowerCase() || '';
    return this.clientes.filter(cliente => 
      cliente.nombre.toLowerCase().includes(filterValue)
    );
  }

  displayFn(cliente: any): string {
    return cliente ? cliente.nombre : '';
  }

  updateTipoSolicitud(){
    Swal.fire({
      title: '¿Estás seguro?',
      text: "Los datos no se pueden modificar una vez guardados.",
      icon: 'warning',
      showCancelButton: true,
    }).then((result: any) => {
      if (result.isConfirmed) {
        if (this.tipoSolicitud.valid) {
          const formData = {
            ...this.tipoSolicitud.value,
            id_cliente: this.selectedCliente?.id
          };
          
          this.tipoSolicitudService.update(this.solicitud.id, formData).subscribe({
            next: () => {
              Swal.fire({
                title: '¡Éxito!',
                text: 'Tipo de solicitud actualizado correctamente',
                icon: 'success',
                confirmButtonText: 'Aceptar'
              }).then(() => {
                this.router.navigate(['/mantenedores/tipo-solicitud']);
              });
            },
            error: () => {
              Swal.fire({
                title: 'Error',
                text: 'No se pudo actualizar el tipo de solicitud',
                icon: 'error',
                confirmButtonText: 'Aceptar'
              });
            }
          });
        }
      }
    });
  }

  onCancel(){
    this.router.navigate(['/mantenedores/tipo-solicitud/']);
  }
} 