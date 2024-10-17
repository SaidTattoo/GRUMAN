import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { LocalesService } from 'src/app/services/locales.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-crear-local',
  templateUrl: './crear-local.component.html',
  standalone: true,
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatCardModule, MatIconModule],
  styleUrls: ['./crear-local.component.scss']
})
export class CrearLocalComponent implements OnInit {
  localForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private localesService: LocalesService,
    private dialogRef: MatDialogRef<CrearLocalComponent>
  ) { }

  ngOnInit(): void {
    this.localForm = this.fb.group({
      direccion: ['', Validators.required],
      comuna: ['', Validators.required],
      region: ['', Validators.required],
      zona: ['', Validators.required],
      grupo: ['', Validators.required],
      referencia: ['', Validators.required],
      telefono: ['', Validators.required],
      email_local: ['', [Validators.required, Validators.email]],
      email_encargado: ['', [Validators.required, Validators.email]],
      nombre_encargado: ['', Validators.required],
      latitud: ['', Validators.required],
      longitud: ['', Validators.required]
    });
  }

  onSubmit() {
    console.log('****', this.localForm.value);
    if (this.localForm.valid) {
      Swal.fire({
        title: '¿Estás seguro que deseas crear este local?',
        text: 'Por favor, espere...',
        allowOutsideClick: false,
        showCancelButton: true,
        confirmButtonText: 'Sí, crear',
        cancelButtonText: 'Cancelar',
        reverseButtons: true
      }).then((result) => {
        if (result.isConfirmed) {
          console.log(this.localForm.value);
          this.localesService.crearLocal(this.localForm.value).subscribe((data) => {
            console.log('****', data);
            //cerrar modal
            this.dialogRef.close();
          });
        }
      });
    }

  }
}
