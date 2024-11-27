import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatCard, MatCardContent, MatCardHeader } from '@angular/material/card';
import { MatFormField, MatFormFieldModule, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { Router } from '@angular/router';
import { ClientesService } from 'src/app/services/clientes.service';
import { UploadDataService } from 'src/app/services/upload-data.service';

@Component({
  selector: 'app-crear-cliente',
  standalone: true,
  imports: [MatCard,MatFormFieldModule,ReactiveFormsModule ,MatCardContent, MatFormField, MatInput, MatButton, MatCardHeader,MatLabel  ],
  templateUrl: './crear-cliente.component.html',
  styleUrl: './crear-cliente.component.scss'
})
export class CrearClienteComponent {
  imagePreview: string | ArrayBuffer | null = null;
  fileName: string = '';
  imageBase64: string | null = null;
  clienteForm: FormGroup;
  urlImage: string | null = null;
    constructor(private clienteService: ClientesService, private router: Router, private fb: FormBuilder, private uploadDataService: UploadDataService) {}

  ngOnInit(): void {
    this.clienteForm = this.fb.group({
      nombre: ['', Validators.required],
      logo: [''],
      rut: ['', Validators.required],
      razonSocial: ['', Validators.required],
      sobrePrecio: ['', Validators.required],
      valorPorLocal: ['', Validators.required],
    });
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const formData = new FormData();
      formData.append('file', input.files[0]);

      this.uploadDataService.uploadFile(formData, 'clientes').subscribe((data: any) => {
        console.log(data);
        this.urlImage = data.url;
      });

      const file = input.files[0];
      this.fileName = file.name;
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result;
        this.imageBase64 = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  submit() {
    console.log(this.clienteForm.value);
      this.clienteForm.value.logo = this.urlImage;
      console.log('Formulario:', this.clienteForm.value);
      this.clienteService.createCliente(this.clienteForm.value).subscribe((data: any) => {
        console.log(data);
        this.router.navigate(['/mantenedores/clientes']);
      });
  }
  onDragOver(event: DragEvent) {
    event.preventDefault();
  }
  
  onDrop(event: DragEvent) {
    event.preventDefault();
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.onFileSelected({ target: { files: files } } as unknown as Event);
    }
  }
  volver(){
    this.router.navigate(['/mantenedores/clientes']);
  }
}
