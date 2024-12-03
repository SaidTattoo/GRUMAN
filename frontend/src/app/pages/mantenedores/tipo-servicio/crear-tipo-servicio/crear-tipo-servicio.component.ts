import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { TipoServicioService } from 'src/app/services/tipo-servicio.service';

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

  constructor(private fb: FormBuilder, private tipoServicioService: TipoServicioService) {}

  ngOnInit() {
    this.tipoServicio = this.fb.group({
      nombre: ['', Validators.required]
    });
  }

  createTipoServicio() {
    if (this.tipoServicio.valid) {
      this.tipoServicioService.createTipoServicio(this.tipoServicio.value).subscribe(response => {
        //console.log(response);
      });
      // Lógica para crear el tipo de servicio
    }
  }
}
