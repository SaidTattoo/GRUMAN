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
      precio_compra: ['', [Validators.required, Validators.min(0)]],
      precio_venta: ['', [Validators.required, Validators.min(0)]],
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
  
      // Convertir precios a números
      const repuesto = {
        ...formValues,
        precio_compra: parseFloat(formValues.precio_compra),
        precio_venta: parseFloat(formValues.precio_venta),
      };
  
      this.repuestosService.actualizarRepuesto(this.repuestoId, repuesto).subscribe(
        (response: any) => {
          Swal.fire({
            title: 'Éxito',
            text: 'Repuesto actualizado correctamente',
            icon: 'success'
          });
          this.router.navigate(['/mantenedores/repuestos']);
        },
        (error: any) => {
          Swal.fire({
            title: 'Error',
            text: error.error.message || 'No se pudo actualizar el repuesto',
            icon: 'error'
          });
        }
      );
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Por favor, completa todos los campos obligatorios.',
      });
    }
  }
  cancelar() {
    this.router.navigate(['/mantenedores/repuestos']);
  }
}