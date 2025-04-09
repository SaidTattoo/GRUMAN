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
      precio_compra: ['', [Validators.required, Validators.min(0)]],
      precio_venta: ['', [Validators.required, Validators.min(0)]],
    });
  }

  onSubmit() {
    if (this.form.valid) {
      const formValues = this.form.value;
  
      // Convertir precios a números
      const repuesto = {
        ...formValues,
        precio_compra: parseFloat(formValues.precio_compra),
        precio_venta: parseFloat(formValues.precio_venta),
      };
  
      this.repuestosService.crearRepuesto(repuesto).subscribe(
        (response) => {
          Swal.fire({
            icon: 'success',
            title: 'Repuesto creado correctamente',
          });
          this.form.reset();
          this.router.navigate(['/mantenedores/repuestos']);
        },
        (error) => {
          Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: error.error.message || 'Algo salió mal al crear el repuesto.',
          });
          console.error('Error al crear el repuesto:', error);
        }
      );
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Por favor, completa todos los campos obligatorios.',
      });
      //console.log('Formulario inválido');
    }
  }
  cancelar() {
    this.router.navigate(['/mantenedores/repuestos']);
  }
}