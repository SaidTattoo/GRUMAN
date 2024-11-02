import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { VehiculosService } from 'src/app/services/vehiculos.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-crear-vehiculo',
  standalone: true,
  imports: [MatFormFieldModule, MatInputModule,ReactiveFormsModule,MatDialogModule,MatButtonModule,MatCardModule],
  templateUrl: './crear-vehiculo.component.html',
  styleUrl: './crear-vehiculo.component.scss'
})
export class CrearVehiculoComponent {
  form: FormGroup;


  constructor(private fb: FormBuilder, private dialogRef: MatDialogRef<CrearVehiculoComponent>, private vehiculosService: VehiculosService) {
    this.form = this.fb.group({
      movil: ['', Validators.required],
      patente:['',Validators.required],
      marca:['',Validators.required],
      modelo:['',Validators.required],
      anio:['',Validators.required],
      activo:[true],
      documentacion: null
    });
  }

  onSubmit(){
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
        if(this.form.valid){
          this.vehiculosService.crearVehiculo(this.form.value).subscribe((res) => {
            this.dialogRef.close(res);
            this.form.reset();
          });
        }else {
          Swal.fire('Error', 'Por favor, complete todos los campos requeridos.', 'error');
        }
      }
    });
  }
}
