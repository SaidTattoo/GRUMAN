import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Router } from '@angular/router';
import { OrdenServicioService } from 'src/app/services/orden-servicio.service';
import { LocalesService } from 'src/app/services/locales.service';
import { ServiciosService } from 'src/app/services/servicios.service';
import { UploadDataService } from 'src/app/services/upload-data.service';
import { UsersService } from 'src/app/services/users.service';
import Swal from 'sweetalert2';
import { ListadoSolicitudAprobacionCorrectivaService } from 'src/app/services/listado-solicitud-aprobacion-correctiva.service';

@Component({
  selector: 'app-solicitud-aprobacion-correctiva',
  standalone: true,
  imports: [CommonModule, MatInputModule, FormsModule, ReactiveFormsModule, MatCardModule, MatFormFieldModule, MatSelectModule, MatButtonModule, MatIconModule, MatDatepickerModule, MatNativeDateModule],
  templateUrl: './solicitud-aprobacion-correctiva.component.html',
  styleUrl: './solicitud-aprobacion-correctiva.component.scss'
})
export class SolicitudAprobacionCorrectivaComponent {
  constructor(
    private fb: FormBuilder,
    private serviciosService: ServiciosService,
    private localesService: LocalesService,
    private usersService: UsersService,
    private uploadDataService: UploadDataService,
    private ordenServicioService: OrdenServicioService,
    private router: Router,
    private listadoSolicitudAprobacionCorrectivaService: ListadoSolicitudAprobacionCorrectivaService
  ) {
    this.tiempos = Array.from({ length: 720 }, (_, i) => i + 1);
  }

  inspectores: any[] = [];
  locales: any[] = [];
  especialidades: any[] = [];
  criticidades: any[] = [
    { 'id': 1, 'nombre': 'Alta' },
    { 'id': 2, 'nombre': 'Media' },
    { 'id': 3, 'nombre': 'Baja' }
  ];
  afectas: any[] = [
    { 'id': 1, 'nombre': 'Seguridad' },
    { 'id': 2, 'nombre': 'Servicio' },
    { 'id': 3, 'nombre': 'Calidad' }
  ];
  tiempos: any[] = [];
  programacionForm: FormGroup;
  loading: boolean = false;

  ngOnInit(): void {
    //pasar el tipo de orden correctiva 
    this.programacionForm = this.fb.group({
      inspectorId: [null, Validators.required],
      numeroLocal: [null, Validators.required],
    
      especialidad: [null, Validators.required],
      criticidad: [null, Validators.required],
      costoEstimado: [null, [Validators.required, Validators.pattern(/^\$?[0-9]+(\.[0-9]{3})*$/)]],
      observaciones: [null, Validators.required],
      afecta: [null, Validators.required],
      tiempoEstimado: [null, Validators.required],
      file: [null, Validators.required],
    });
    this.servicios();
    this.getLocales();
    this.getUsers();
  }

  getUsers() {
    this.usersService.getUsers().subscribe((data) => {
      this.inspectores = data;
    });
  }

  getLocales() {
    this.localesService.getLocales().subscribe((data) => {
      this.locales = data;
    });
  }

  servicios() {
    this.serviciosService.getAllServicios().subscribe((data) => {
      this.especialidades = data;
    });
  }

  formatCurrency() {
    const control = this.programacionForm.get('costoEstimado');
    if (control) {
      const value = parseInt(control.value.replace(/[^0-9]+/g, ''), 10);
      if (!isNaN(value)) {
        control.setValue(`$${value.toLocaleString('de-DE')}`);
      } else {
        control.setValue('');
      }
    }
  }

  onSubmit() {
    if (this.programacionForm.invalid) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Por favor, complete todos los campos requeridos'
      });
      return;
    }

    this.loading = true;
    const file = this.programacionForm.value.file;
    const formData = new FormData();
    formData.append('file', file);

    this.uploadDataService.uploadFile(formData, 'solicitud-aprobacion-correctiva').subscribe({
      next: (data) => {
        const urlDocumento = data.url;
        const formValue = { ...this.programacionForm.value };

        if (formValue.costoEstimado) {
          formValue.costoEstimado = parseInt(formValue.costoEstimado.replace(/[^0-9]+/g, ''), 10);
        }

        formValue.file = urlDocumento;
        this.listadoSolicitudAprobacionCorrectivaService.createSolicitudAprobacionCorrectiva(formValue).subscribe(data => {
          console.log('solicitud creada', data);
        });
        this.ordenServicioService.createSolicitudCorrectiva(formValue).subscribe({
          next: (response) => {
            Swal.fire({
              icon: 'success',
              title: 'Éxito',
              text: 'Solicitud creada correctamente'
            }).then(() => {
              this.router.navigate(['/transacciones/listado-solicitud-aprobacion-correctiva']);
            });
          },
          error: (error) => {
            console.error('Error al crear la solicitud:', error);
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'Ocurrió un error al crear la solicitud'
            });
            this.loading = false;
          }
        });
      },
      error: (error) => {
        console.error('Error al subir el archivo:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Ocurrió un error al subir el archivo'
        });
        this.loading = false;
      }
    });
  }
  /* onSubmit() {
   
    const file = this.programacionForm.value.file;
    const formData = new FormData();
    formData.append('nombre', this.programacionForm.value.nombre);
    formData.append('tipoDocumento', this.programacionForm.value.tipoDocumento);
    formData.append('file', file);
    //console.log( this.programacionForm.value);
    this.uploadDataService.uploadFile(formData, 'solicitud-aprobacion-correctiva').subscribe(data => {
      //console.log('subido', data);
      const urlDocumento = data.url;
      const formValue = { ...this.programacionForm.value };

      if (formValue.costoEstimado) {
        formValue.costoEstimado = parseInt(formValue.costoEstimado.replace(/[^0-9]+/g, ''), 10);
      }

      formValue.file = urlDocumento;

      this.listadoSolicitudAprobacionCorrectivaService.createSolicitudAprobacionCorrectiva(formValue).subscribe(data => {
        //console.log('solicitud creada', data);
        this.router.navigate(['/transacciones/listado-solicitud-aprobacion-correctiva']);
      });
    }); */
  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.programacionForm.patchValue({ file: file });
      this.programacionForm.get('file')?.updateValueAndValidity();
    }
  }
}
