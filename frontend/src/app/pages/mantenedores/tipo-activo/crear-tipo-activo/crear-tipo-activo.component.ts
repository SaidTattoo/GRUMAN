import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { TipoActivoService } from 'src/app/services/tipo-activo.service';

@Component({
  selector: 'app-crear-tipo-activo',
  standalone: true,
  imports: [MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule, ReactiveFormsModule],
  templateUrl: './crear-tipo-activo.component.html',
  styleUrls: ['./crear-tipo-activo.component.scss']
})
export class CrearTipoActivoComponent {
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<CrearTipoActivoComponent>,
    private tiposActivoService: TipoActivoService
  ) {
    this.form = this.fb.group({
      name: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.form.valid) {
      this.tiposActivoService.crearTipoActivo(this.form.value).subscribe(() => {
        this.dialogRef.close(true);
      });
    }
  }

  onCancel() {
    this.dialogRef.close(false);
  }
}
