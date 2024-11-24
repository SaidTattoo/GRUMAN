import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Router } from '@angular/router';
import { RepuestosService } from 'src/app/services/repuestos.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-crear-repuestos',
  standalone: true,
  imports: [ReactiveFormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  templateUrl: './crear-repuestos.component.html',
  styleUrls: ['./crear-repuestos.component.scss']
})
export class CrearRepuestosComponent {
  form: FormGroup;

  constructor(private fb: FormBuilder, private repuestosService: RepuestosService, private router: Router) {
    this.form = this.fb.group({
      familia: [null, Validators.required],
      articulo: ['', Validators.required],
      marca: ['', Validators.required],
      codigoBarra: ['', Validators.required],
      precioNetoCompra: ['', [Validators.required, Validators.min(0)]],
      sobreprecio: ['', [Validators.required, Validators.min(0)]],
    });
  }

  onSubmit() {
    if (this.form.valid) {
      console.log('Formulario válido:', this.form.value);
      // Aquí puedes agregar la lógica para enviar el formulario
      this.repuestosService.crearRepuesto(this.form.value).subscribe(() => {
        Swal.fire({
          icon: 'success',
          title: 'Repuesto creado correctamente',
        });
        this.form.reset();
        this.router.navigate(['/mantenedores/repuestos']);
      });
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Algo salió mal!',
      });
      console.log('Formulario inválido');

    }
  }
}