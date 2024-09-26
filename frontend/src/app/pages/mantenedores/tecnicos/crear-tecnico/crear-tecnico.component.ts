import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { TecnicosService } from 'src/app/services/tecnicos.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-crear-tecnico',
  standalone: true,
  imports: [MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule, ReactiveFormsModule],
  templateUrl: './crear-tecnico.component.html',
  styleUrls: ['./crear-tecnico.component.scss']
})
export class CrearTecnicoComponent {
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<CrearTecnicoComponent>,
    private tecnicosService: TecnicosService
  ) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      lastname: ['', Validators.required],
      rut: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.form.valid) {
      Swal.fire({
        title: '¿Estás seguro?',
        text: "¿Estás seguro de que los datos ingresados son correctos?",
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, guardar',
        cancelButtonText: 'Cancelar'
      }).then((result) => {
        if (result.isConfirmed) {
          this.tecnicosService.createTecnico(this.form.value).subscribe(
            () => {
              Swal.fire('Éxito', 'Técnico creado exitosamente', 'success');
              this.dialogRef.close(true);
            },
            (error) => {
              Swal.fire('Error', 'Hubo un problema al crear el técnico', 'error');
            }
          );
        }
      });
    } else {
      Swal.fire('Error', 'Por favor, complete todos los campos correctamente', 'error');
    }
  }

  onCancel() {
    this.dialogRef.close(false);
  }
}
