import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatSelectModule } from '@angular/material/select';
import { UploadDataService } from 'src/app/services/upload-data.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-subir-documento',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatListModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule
  ],
  templateUrl: './subir-documento.component.html',
  styleUrls: ['./subir-documento.component.scss']
})
export class SubirDocumentoComponent implements OnInit {
  documentoForm!: FormGroup;
  selectedFile: File | null = null;
  tiposDocumento = [
    { id: 'revision_tecnica', nombre: 'Revisión Técnica' },
    { id: 'permiso_circulacion', nombre: 'Permiso de Circulación' },
    { id: 'seguro_obligatorio', nombre: 'Seguro Obligatorio' },
    { id: 'gases', nombre: 'Certificado de Gases' }
  ];
  documentoPertenece = [
    { id: 'vehiculo1', nombre: 'Vehículo 1' },
    { id: 'vehiculo2', nombre: 'Vehículo 2' }
  ];

  constructor(private fb: FormBuilder, private uploadService: UploadDataService) {}

  ngOnInit(): void {
    this.documentoForm = this.fb.group({
      nombre: ['', Validators.required],
      tipoDocumento: ['', Validators.required],
      documentoPertenece: ['', Validators.required]
    });
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      console.log('Archivo seleccionado:', file.name, file.size, file.type);
      this.selectedFile = file;
    }
  }

  onSubmit(): void {
    if (this.documentoForm.valid && this.selectedFile) {
      const formData = new FormData();
      formData.append('file', this.selectedFile);
      formData.append('nombre', this.documentoForm.get('nombre')?.value);
      formData.append('tipoDocumento', this.documentoForm.get('tipoDocumento')?.value);

      const vehiculoId = this.documentoForm.get('documentoPertenece')?.value;
      const path = `vehiculos/${vehiculoId}/documentos/${this.documentoForm.get('tipoDocumento')?.value}`;

      console.log('Subiendo documento con datos:', {
        nombre: this.documentoForm.get('nombre')?.value,
        tipoDocumento: this.documentoForm.get('tipoDocumento')?.value,
        path
      });

      this.uploadService.uploadFile(formData, path).subscribe({
        next: (response) => {
          console.log('Respuesta del servidor:', response);
          Swal.fire('Éxito', 'Documento subido correctamente', 'success');
        },
        error: (error) => {
          console.error('Error al subir documento:', error);
          Swal.fire('Error', 'No se pudo subir el documento', 'error');
        }
      });
    } else {
      Swal.fire('Error', 'Debe completar todos los campos y seleccionar un archivo', 'error');
    }
  }
}
