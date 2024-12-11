import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { TipoServicioService } from 'src/app/services/tipo-servicio.service';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';

@Component({
  selector: 'app-crear-tipo-servicio',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  templateUrl: './crear-tipo-servicio.component.html'
})
export class CrearTipoServicioComponent implements OnInit {
  tipoServicio: FormGroup;

  constructor(private fb: FormBuilder, private tipoServicioService: TipoServicioService, private router: Router) {}

  ngOnInit() {
    this.tipoServicio = this.fb.group({
      nombre: ['', Validators.required]
    });
  }

  createTipoServicio() {
    Swal.fire({
      title: '¿Estás seguro?',
      text: "Los datos no se pueden modificar una vez guardados.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, guardar!'
    }).then((result) => {
      if (result.isConfirmed) {
        if (this.tipoServicio.valid) {
              this.tipoServicioService.createTipoServicio(this.tipoServicio.value).subscribe(response => {
                //console.log(response);
                this.router.navigate(['/mantenedores/tipo-servicio']);
              });
            }
          }
        });
  }

  onCancel(){
    this.router.navigate(['/mantenedores/tipo-servicio'], { skipLocationChange: true });
  }
}
