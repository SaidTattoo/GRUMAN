import { JsonPipe } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatCard, MatCardContent, MatCardHeader } from '@angular/material/card';
import { MatError, MatFormField, MatFormFieldModule, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { ActivatedRoute, Router } from '@angular/router';
import { ClientesService } from 'src/app/services/clientes.service';
import { UploadDataService } from 'src/app/services/upload-data.service';

@Component({
  selector: 'app-editar-clientes',
  standalone: true,
  imports: [MatCard,MatFormFieldModule,ReactiveFormsModule ,MatCardContent, MatFormField, MatInput, MatButton, MatCardHeader,MatLabel , JsonPipe ,MatError],
  templateUrl: './editar-clientes.component.html',
  styleUrl: './editar-clientes.component.scss'
})
export class EditarClientesComponent {
  imagePreview: string | ArrayBuffer | null = null;
  fileName: string = '';
  imageBase64: string | null = null;
  clienteForm: FormGroup;
  cliente: any;
  urlImage: string | null = null;
  isLoading: boolean = false; // Variable para controlar el estado de carga

  constructor(private clienteService: ClientesService, private router: Router, private fb: FormBuilder,private route: ActivatedRoute,private uploadDataService: UploadDataService) {}

  ngOnInit() {
    this.clienteService.getCliente(this.route.snapshot.params['id']).subscribe((data: any) => {
      //console.log(data);
      this.cliente = data;
      this.clienteForm.patchValue(data);
      this.urlImage = data.logo; // Inicializa con el logo actual
    });

    this.clienteForm = this.fb.group({
      nombre: ['', Validators.required],
      rut: ['', Validators.required],
      razonSocial: ['', Validators.required],
      logo: [''],
      sobreprecio: ['', Validators.required],
      valorPorLocal: ['', Validators.required]
    });
  }

  onSubmit() {
    //console.log('Formulario:', this.clienteForm.value);

      this.clienteForm.value.logo = this.urlImage;
      //console.log('Formulario:', this.clienteForm.value);
      this.clienteService.updateCliente(this.route.snapshot.params['id'], this.clienteForm.value).subscribe((data: any) => {
        //console.log(data);
        this.router.navigate(['/mantenedores/clientes']);
      });

  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const formData = new FormData();
      formData.append('file', input.files[0]);

      this.uploadDataService.uploadFile(formData, 'clientes').subscribe((data: any) => {
        //console.log(data);
        this.urlImage = data.url;
      });

      const file = input.files[0];
      this.fileName = file.name;
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result;
        this.imageBase64 = reader.result as string;
        this.isLoading = false; // Finaliza el estado de carga
      };
      reader.readAsDataURL(file);
    }
  }

  volver(){
    this.router.navigate(['/mantenedores/clientes']);
  }
}
