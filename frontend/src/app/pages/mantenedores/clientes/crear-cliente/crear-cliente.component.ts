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
    const input = event.target as HTMLInputElement; // Asegúrate de que event.target es un HTMLInputElement
    if (input.files && input.files[0]) {
      this.uploadDataService.uploadFile(input.files[0], 'clientes').subscribe((data: any) => {
        console.log(data);
        this.urlImage = data.url;
      });

    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.fileName = file.name;
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result;
        this.imageBase64 = reader.result as string; // Guarda la imagen en base64
      };
      reader.readAsDataURL(file);
    }
  }}


  submit() {
    console.log(this.clienteForm.value);
      this.clienteForm.value.logo = this.urlImage;
      console.log('Formulario:', this.clienteForm.value);
      this.clienteService.createCliente(this.clienteForm.value).subscribe((data: any) => {
        console.log(data);
        this.router.navigate(['/mantenedores/clientes']);
      });
  }
  volver(){
    this.router.navigate(['/mantenedores/clientes']);
  }
}
