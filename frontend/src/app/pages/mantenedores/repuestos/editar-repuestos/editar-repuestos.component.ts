import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ActivatedRoute, Router } from '@angular/router';
import { RepuestosService } from 'src/app/services/repuestos.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-editar-repuestos',
  standalone: true,
  imports: [ReactiveFormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  templateUrl: './editar-repuestos.component.html',
  styleUrls: ['./editar-repuestos.component.scss']
})
export class EditarRepuestosComponent implements OnInit {
  form: FormGroup;
  repuestoId: number;

  constructor(
    private fb: FormBuilder,
    private repuestosService: RepuestosService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.form = this.fb.group({
      familia: [null, Validators.required],
      articulo: ['', Validators.required],
      marca: ['', Validators.required],
      codigoBarra: ['', Validators.required],
      precioNetoCompra: ['', [Validators.required, Validators.min(0)]],
      sobreprecio: ['', [Validators.required, Validators.min(0)]],
    });
  }

  ngOnInit() {
    this.repuestoId = this.route.snapshot.params['id'];
    this.repuestosService.getRepuesto(this.repuestoId).subscribe((repuesto) => {
      this.form.patchValue(repuesto);
    });
  }

  onSubmit() {
    if (this.form.valid) {
      const formValues = this.form.value;
  
      // Convertir precios a números (asegurando que sean tipo número)
      const repuesto = {
        ...formValues,
        precioNetoCompra: parseFloat(formValues.precioNetoCompra),
        sobreprecio: parseFloat(formValues.sobreprecio),
      };
  
      //console.log('Datos procesados para enviar:', repuesto);
  
      // Enviar datos al servicio
      this.repuestosService.updateRepuesto(this.repuestoId, repuesto).subscribe(
        (response) => {
          Swal.fire({
            icon: 'success',
            title: 'Repuesto actualizado correctamente',
          });
          this.router.navigate(['/mantenedores/repuestos']);
        },
        (error) => {
          Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Algo salió mal al actualizar el repuesto.',
          });
          console.error('Error al actualizar el repuesto:', error);
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
}