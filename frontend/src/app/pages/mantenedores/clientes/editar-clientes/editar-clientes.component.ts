import { JsonPipe } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatCard, MatCardContent, MatCardHeader } from '@angular/material/card';
import { MatOptionModule } from '@angular/material/core';
import { MatError, MatFormField, MatFormFieldModule, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatSelectChange, MatSelectModule } from '@angular/material/select';
import { ActivatedRoute, Router } from '@angular/router';
import { ClientesService } from 'src/app/services/clientes.service';
import { TipoServicioService } from 'src/app/services/tipo-servicio.service';
import { UploadDataService } from 'src/app/services/upload-data.service';

@Component({
  selector: 'app-editar-clientes',
  standalone: true,
  imports: [MatCard,MatFormFieldModule,ReactiveFormsModule ,MatCardContent, MatFormField, MatInput, MatButton, MatCardHeader,MatLabel, MatSelectModule, MatOptionModule, MatError],
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
  isLoading: boolean = false;
  tipoServicioForm = new FormControl('');
  tipoServicioList: any[] = [];

  constructor(
    private clienteService: ClientesService, 
    private router: Router, 
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private uploadDataService: UploadDataService,
    private tipoServicioService: TipoServicioService
  ) {}

  ngOnInit() {
    this.getTipoServicio();
    
    this.clienteForm = this.fb.group({
      nombre: ['', Validators.required],
      rut: ['', Validators.required],
      razonSocial: ['', Validators.required],
      logo: [''],
      sobreprecio: ['', Validators.required],
      valorPorLocal: ['', Validators.required]
    });

    // Cargar datos del cliente
    this.clienteService.getCliente(this.route.snapshot.params['id']).subscribe((data: any) => {
      this.cliente = data;
      this.clienteForm.patchValue(data);
      this.urlImage = data.logo;
      
      // Preseleccionar los tipos de servicio
      if (data.tipoServicio && data.tipoServicio.length > 0) {
        this.tipoServicioForm.setValue(data.tipoServicio.map((ts: any) => ts.id));
      }
    });
  }

  getTipoServicio(){
    this.tipoServicioService.findAll().subscribe((data: any) => {
      this.tipoServicioList = data;
    });
  }

  onTipoServicioChange(event: MatSelectChange): void {
    console.log('Tipos de servicio seleccionados:', event.value);
  }

  onSubmit() {
    if (this.clienteForm.valid) {
        const clienteData = {
            ...this.clienteForm.value,
            logo: this.urlImage || this.cliente.logo,
            tipoServicio: this.tipoServicioForm.value // Esto ya debe ser un array de IDs
        };

        this.clienteService.updateCliente(this.route.snapshot.params['id'], clienteData)
            .subscribe({
                next: () => {
                    this.router.navigate(['/mantenedores/clientes']);
                },
                error: (error) => {
                    console.error('Error al actualizar el cliente:', error);
                }
            });
    }
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
