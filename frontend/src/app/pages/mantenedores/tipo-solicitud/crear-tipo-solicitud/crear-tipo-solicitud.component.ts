import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TipoSolicitudService } from '../tipo-solicitud.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { Observable, map, startWith } from 'rxjs';

@Component({
  selector: 'app-crear-tipo-solicitud',
  templateUrl: './crear-tipo-solicitud.component.html',
  styleUrls: ['./crear-tipo-solicitud.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatInputModule,
    MatButtonModule,
    MatSnackBarModule,
    MatFormFieldModule,
    MatCardModule,
    MatAutocompleteModule
  ],
  providers: [TipoSolicitudService]
})
export class CrearTipoSolicitudComponent implements OnInit {
  form: FormGroup;
  clientes: any[] = [];
  filteredClientes: Observable<any[]>;
  selectedCliente: any;

  constructor(
    private fb: FormBuilder,
    private tipoSolicitudService: TipoSolicitudService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.form = this.fb.group({
      nombre: ['', Validators.required],
      sla_dias: ['', [Validators.required, Validators.min(0)]],
      sla_hora: ['', Validators.required],
      id_cliente: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.tipoSolicitudService.findAllClientes().subscribe((data) => {
      this.clientes = data;
      this.setupAutocomplete();
    });
  }

  private setupAutocomplete(): void {
    this.filteredClientes = this.form.get('id_cliente')!.valueChanges.pipe(
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

  onSubmit(): void {
    if (this.form.valid) {
      const formData = {
        ...this.form.value,
        id_cliente: this.selectedCliente?.id
      };
      
      this.tipoSolicitudService.create(formData).subscribe({
        next: () => {
          this.snackBar.open('Tipo de solicitud creado exitosamente', 'Cerrar', {
            duration: 3000
          });
          this.router.navigate(['/mantenedores/tipo-solicitud']);
        },
        error: (error) => {
          this.snackBar.open('Error al crear el tipo de solicitud', 'Cerrar', {
            duration: 3000
          });
        }
      });
    }
  }

  cancelar(): void {
    this.router.navigate(['/mantenedores/tipo-solicitud']);
  }
} 