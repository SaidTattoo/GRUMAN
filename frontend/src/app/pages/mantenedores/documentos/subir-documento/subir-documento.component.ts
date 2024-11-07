import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ActivatedRoute, Router } from '@angular/router';
import { DocumentosService } from 'src/app/services/documentos.service';
import { UploadDataService } from 'src/app/services/upload-data.service';

@Component({
  selector: 'app-subir-documento',
  standalone: true,
  imports: [CommonModule, MatCardModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatSelectModule],
  templateUrl: './subir-documento.component.html',
  styleUrl: './subir-documento.component.scss'
})
export class SubirDocumentoComponent implements OnInit {
  documentoForm: FormGroup;
  tiposDocumento: any[] = [];
  documentoPertenece: any[] = [
    { id: 1, nombre: 'Vehiculos' },
    { id: 2, nombre: 'Clientes' },
    { id: 3, nombre: 'Tecnicos' },
    { id: 4, nombre: 'Repuestos' },
  ];
  selectedFileName: string | null = null;
  tipo: number = 0;
  tecnicoId: any = null;
  clienteId: any = null;
  repuestoId: any = null;
  vehiculoId: any = null;
  constructor(private documentosService: DocumentosService,private uploadDataService: UploadDataService, private router: Router, private route: ActivatedRoute) {
    this.documentoForm = new FormGroup({
      nombre: new FormControl('', Validators.required),
      tipoDocumento: new FormControl('', Validators.required),
      documentoPertenece: new FormControl('', Validators.required),
      file: new FormControl(null, Validators.required),
      tecnicoId: new FormControl(null, Validators.required),
      clienteId: new FormControl(null, Validators.required),
      repuestoId: new FormControl(null, Validators.required),
      vehiculoId: new FormControl(null, Validators.required)
    });
    this.getTiposDocumento();
  }
  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.tipo = Number(params['tipo']);
      this.tecnicoId = Number(params['tecnico']);
      this.clienteId = Number(params['cliente']);
      this.repuestoId = Number(params['repuesto']);
      this.vehiculoId = Number(params['vehiculo']);
    });
    console.log(this.tipo, this.tecnicoId);
    if(this.tipo ){
      this.documentoForm.get('documentoPertenece')?.setValue(this.tipo);
      this.documentoForm.get('documentoPertenece')?.disable();
      this.documentoForm.get('documentoPertenece')?.setValue(this.tipo);
      
    }
   
    this.documentoForm.get('tecnicoId')?.setValue(this.tecnicoId);
    this.documentoForm.get('clienteId')?.setValue(this.clienteId);
    this.documentoForm.get('repuestoId')?.setValue(this.repuestoId);
    this.documentoForm.get('vehiculoId')?.setValue(this.vehiculoId);

  }
  getTiposDocumento() {
    this.documentosService.getTipoDocumentos().subscribe(data => {
      this.tiposDocumento = data;
    });
  }

  onSubmit() {  
    let pertenece: any = null;
    if(this.tipo){
      pertenece = this.documentoPertenece.find(pertenece => pertenece.id === this.tipo);
    }else{
      pertenece = this.documentoPertenece.find(pertenece => pertenece.id === this.documentoForm.value.documentoPertenece);
      
    }
  
    console.log(pertenece);
    if (!pertenece) {
      console.error("No se encontró el elemento en documentoPertenece");
      return;
    }
  
    const file = this.documentoForm.value.file;
    const formData = new FormData();
    formData.append('nombre', this.documentoForm.value.nombre);
    formData.append('tipoDocumento', this.documentoForm.value.tipoDocumento);
    formData.append('file', file);
  
    console.log( this.documentoForm.value);
  
    this.uploadDataService.uploadFile(formData, pertenece.nombre.toLowerCase()).subscribe(data => {
      console.log('subido', data);
  
      const urlDocumento = data.url;
      this.documentosService.createDocumento({
        nombre: this.documentoForm.value.nombre,
        tipoDocumento: this.documentoForm.value.tipoDocumento,
        path: urlDocumento,
        tecnicoId: this.documentoForm.value.tecnicoId,
        clienteId: this.documentoForm.value.clienteId,
        repuestoId: this.documentoForm.value.repuestoId,
        vehiculoId: this.documentoForm.value.vehiculoId,
        tipo: pertenece.nombre.toLowerCase()
      }).subscribe(data => {
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
