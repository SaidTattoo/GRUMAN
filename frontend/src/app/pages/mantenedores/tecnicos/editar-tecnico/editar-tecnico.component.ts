import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardContent, MatCardHeader, MatCardModule } from '@angular/material/card';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { TecnicosService } from 'src/app/services/tecnicos.service';
import { CrearTecnicoComponent } from '../crear-tecnico/crear-tecnico.component';

@Component({
  selector: 'app-editar-tecnico',
  standalone: true,
  imports: [ CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatCardModule, MatCardHeader, MatCardContent ],
  templateUrl: './editar-tecnico.component.html',
  styleUrl: './editar-tecnico.component.scss'
})
export class EditarTecnicoComponent {
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<CrearTecnicoComponent>,
    private tecnicosService: TecnicosService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    console.log(data);
    this.form = this.fb.group({
      name: [data.tecnico.name, Validators.required],
      lastname: [data.tecnico.lastname, Validators.required],
      rut: [data.tecnico.rut, Validators.required],
      email: [data.tecnico.email, [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.form.valid) {
      this.tecnicosService.updateTecnico(this.data.tecnico.id, this.form.value).subscribe(() => {
        this.dialogRef.close();
      });
    }
  }

  onCancel() {
    this.dialogRef.close();
  }
}
