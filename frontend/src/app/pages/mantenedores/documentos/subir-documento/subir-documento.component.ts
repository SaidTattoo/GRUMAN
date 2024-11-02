import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Router } from '@angular/router';
import { DocumentosService } from 'src/app/services/documentos.service';
import { UploadDataService } from 'src/app/services/upload-data.service';

@Component({
  selector: 'app-subir-documento',
  standalone: true,
  imports: [CommonModule, MatCardModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatSelectModule],
  templateUrl: './subir-documento.component.html',
  styleUrl: './subir-documento.component.scss'
})
export class SubirDocumentoComponent {
  documentoForm: FormGroup;
  tiposDocumento: any[] = [];
  documentoPertenece: any[] = [
    { id: 1, nombre: 'Vehiculos' },
    { id: 2, nombre: 'Clientes' },
    { id: 3, nombre: 'Tecnicos' },
    { id: 4, nombre: 'Repuestos' },
  ];
  selectedFileName: string | null = null;

  constructor(private documentosService: DocumentosService,private uploadDataService: UploadDataService, private router: Router) {
    this.documentoForm = new FormGroup({
      nombre: new FormControl('', Validators.required),
      tipoDocumento: new FormControl('', Validators.required),
      documentoPertenece: new FormControl('', Validators.required),
      file: new FormControl(null, Validators.required)
    });
    this.getTiposDocumento();
  }
  getTiposDocumento() {
    this.documentosService.getTipoDocumentos().subscribe(data => {
      this.tiposDocumento = data;
    });
  }

  onSubmit() {
    const pertenece = this.documentoPertenece.find(pertenece => pertenece.id === this.documentoForm.value.documentoPertenece);
    const file = this.documentoForm.value.file;
    const formData = new FormData();
    formData.append('nombre', this.documentoForm.value.nombre);
    formData.append('tipoDocumento', this.documentoForm.value.tipoDocumento);
    formData.append('file', file);

    console.log(file);
/*     this.documentosService.createDocumento(formData, pertenece.nombre.toLowerCase()).subscribe(data => {
      console.log(data);
    }); */
/* @Entity('documentos')
export class Documentos {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  fecha: Date;

  @Column()
  path: string;

  @ManyToOne(() => TipoDocumento, tipoDocumento => tipoDocumento.documentos)
  @JoinColumn({ name: 'tipo_documento_id' })
  tipoDocumento: TipoDocumento;

  //puede que los documentos sean de vehiculos, usuarios, locales o empresas
  @Column()
  tipo: string;

  @Column({ default: true })
  activo: boolean;
}
 */
    this.uploadDataService.uploadFile(formData, pertenece.nombre.toLowerCase()).subscribe(data => {
      console.log('subido', data);

      const urlDocumento = data.url;
      this.documentosService.createDocumento({ nombre: this.documentoForm.value.nombre, tipoDocumento: this.documentoForm.value.tipoDocumento, path: urlDocumento, tipo: pertenece.nombre.toLowerCase() }).subscribe(data => {
        console.log('documento creado', data);
        this.router.navigate(['/mantenedores/documentos']);
      });
    });
  }
  onFileSelected(event: any) {
    const file = event.target.files[0];
    console.log(file);
    if (file) {
      this.documentoForm.patchValue({ file: file });
      this.documentoForm.get('file')?.updateValueAndValidity();
      console.log('Archivo seleccionado:', file);
    }
  }
}
