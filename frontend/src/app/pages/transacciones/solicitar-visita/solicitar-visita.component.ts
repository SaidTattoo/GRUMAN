import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { provideNativeDateAdapter } from '@angular/material/core';
import { UserService } from 'src/app/core/services/user.service';
import { LocalesService } from 'src/app/services/locales.service';
import { TipoServicioService } from 'src/app/services/tipo-servicio.service';
import { SectoresService } from 'src/app/services/sectores.service';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { SolicitarVisitaService } from 'src/app/services/solicitar-visita.service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { UploadDataService } from 'src/app/services/upload-data.service';
import Swal from 'sweetalert2';
import { ClientesService } from 'src/app/services/clientes.service';
import { StorageService } from 'src/app/services/storage.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-solicitar-visita',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatFormFieldModule,
    MatButtonModule,
    MatSelectModule,
    ReactiveFormsModule,
    MatDatepickerModule,
    MatInputModule,
    MatIconModule,
  ],
  templateUrl: './solicitar-visita.component.html',
  styleUrls: ['./solicitar-visita.component.scss'],
  providers: [provideNativeDateAdapter()],
})
export class SolicitarVisitaComponent implements OnInit, OnDestroy{
  selectedFiles: File[] = [];
  previewUrls: { [key: number]: SafeUrl } = {};
  locales: any[] = [];
  sectores: any[] = [];
  tipoServicio: any[] = [];
  user: any;
  visitaForm: FormGroup;
  urlImage: string[] = []; // Cambiado a arreglo para almacenar las URLs
  clientId: number;
  private storageSubscription: Subscription;

  constructor(
   private userService: UserService,
    private localesService: LocalesService,
    private tipoServicioService: TipoServicioService,
    private sectoresService: SectoresService,
    private solicitarVisitaService: SolicitarVisitaService,
    private sanitizer: DomSanitizer,
    private fb: FormBuilder,
    private uploadDataService: UploadDataService,
    private clientesService: ClientesService,
    private storage: StorageService
  ) {
    this.visitaForm = this.fb.group({
      tipoServicioId: [null, Validators.required],
      localId: [null, Validators.required],
      clientId: [null],
      sectorTrabajoId: [null, Validators.required],
      especialidad: [null, [Validators.required, Validators.maxLength(50)]],
      ticketGruman: [''],
      observaciones: [''],
      fechaIngreso: [null],
    });
  }

  ngOnInit(): void {
    this.storageSubscription = this.storage.user$.subscribe(user => {
      if (user && user.selectedCompany) {
        this.clientId = user.selectedCompany.id;
        this.getLocales();
        this.getTipoServicio();
        this.getSectoresTrabajo();
      }
    });
  }

  ngOnDestroy(): void {
    if (this.storageSubscription) {
      this.storageSubscription.unsubscribe();
    }
  }

  async subirImagenes(visitaId: number): Promise<string[]> {
    try {
      const path = `solicitar_visita/${visitaId}/imagenes`;

      const uploadPromises = this.selectedFiles.map((file) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('originalname', file.name);

        return this.uploadDataService.uploadFile(formData, path).toPromise();
      });

      const responses = await Promise.all(uploadPromises);
      this.urlImage = responses.map((res: any) => res.url); // Guardar las URLs en el array
      console.log('Imágenes subidas:', this.urlImage);

      return this.urlImage;
    } catch (error) {
      console.error('Error al subir imágenes:', error);
      throw error;
    }
  }

  onSubmit() {
    if (this.visitaForm.valid) {
      const values = this.visitaForm.getRawValue();

      const solicitud = {
        tipoServicioId: Number(values.tipoServicioId),
        localId: Number(values.localId),
        sectorTrabajoId: Number(values.sectorTrabajoId),
        clientId: this.clientId,
        especialidad: values.especialidad,
        ticketGruman: values.ticketGruman,
        observaciones: values.observaciones,
        fechaIngreso: values.fechaIngreso,
        imagenes: this.urlImage, // Agregar URLs al objeto de solicitud
      };

      this.solicitarVisitaService.crearSolicitudVisita(solicitud).subscribe({
        next: async (response) => {
          console.log('Visita creada:', response);

          try {
            await this.subirImagenes(response.data.id);
            Swal.fire(
              'Éxito',
              'Visita e imágenes guardadas correctamente',
              'success'
            );
          } catch (error) {
            console.error('Error al subir imágenes:', error);
            Swal.fire(
              'Error',
              'La visita se creó pero hubo un error al subir las imágenes',
              'error'
            );
          }
        },
        error: (error) => {
          console.error('Error al crear visita:', error);
          Swal.fire('Error', 'No se pudo crear la visita', 'error');
        },
      });
    } else {
      Swal.fire('Error', 'Debe completar todos los campos requeridos', 'error');
    }
  }

  getLocales() {
  
    this.localesService.getLocalesByCliente(this.clientId).subscribe((response) => {
      this.locales = response;
    });
  }

  getSectoresTrabajo() {
    this.sectoresService.getSectores().subscribe((response) => {
      this.sectores = response;
    });
  }

  getTipoServicio() {
    this.clientesService.getCliente(this.clientId)
    .subscribe((response) => {
      this.tipoServicio = response.tipoServicio;
    });
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      Array.from(input.files).forEach((file, index) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('originalname', file.name);

        this.uploadDataService.uploadFile(formData, 'solicitar_visita/').subscribe({
          next: (response: any) => {
            if (response && response.url) {
              this.urlImage.push(response.url);
              console.log(`Imagen subida exitosamente: ${response.url}`);
            }
          },
          error: (error) => {
            console.error('Error al subir la imagen:', error);
            Swal.fire('Error', 'Hubo un problema al subir la imagen', 'error');
          },
        });

        this.createImagePreview(file, index);
      });
    }
    console.log(this.urlImage);
  }

  createImagePreview(file: File, index: number) {
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.previewUrls[index] = this.sanitizer.bypassSecurityTrustUrl(
        e.target.result
      );
    };
    reader.readAsDataURL(file);
  }

  removeImage(index: number) {
    this.selectedFiles.splice(index, 1);
    delete this.previewUrls[index];
  }
}
