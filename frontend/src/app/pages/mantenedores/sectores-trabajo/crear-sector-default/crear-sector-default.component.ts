import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { Router } from '@angular/router';
import { SectoresService } from 'src/app/services/sectores.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-crear-sector-default',
  standalone: true,
  imports: [
    MatCardModule,
    ReactiveFormsModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './crear-sector-default.component.html',
  styleUrl: './crear-sector-default.component.scss'
})
export class CrearSectorDefaultComponent {
  sectorForm: FormGroup;

  constructor(private fb: FormBuilder, private sectoresService: SectoresService, private router: Router){
    this.sectorForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(1)]]
    });
  }

  onSubmit(){
    if (this.sectorForm.invalid) {
      Swal.fire({
        title: 'Error',
        text: 'Por favor, complete el nombre del sector',
        icon: 'error'
      });
      return;
    }

    Swal.fire({
      title: '¿Estás seguro?',
      text: "¿Deseas crear este sector?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, crear',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.sectoresService.createSectorDefault(this.sectorForm.value).subscribe({
          next: () => {
            Swal.fire({
              title: 'Éxito',
              text: 'Sector creado correctamente',
              icon: 'success'
            });
            this.router.navigate(['/mantenedores/sectores-trabajo']);
          },
          error: (error) => {
            console.error('Error al crear sector:', error);
            Swal.fire({
              title: 'Error',
              text: 'No se pudo crear el sector',
              icon: 'error'
            });
          }
        });
      }
    });
  }

  volver(){
    this.router.navigate(['/mantenedores/sectores-trabajo']);
  }
}
