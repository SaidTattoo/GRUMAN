import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { UploadDataService } from 'src/app/services/upload-data.service';
import { VehiculosService } from 'src/app/services/vehiculos.service';
import Swal from 'sweetalert2';
import { firstValueFrom } from 'rxjs';

interface Documento {
  fecha?: string;
  nombre?: string;
}

interface DocumentacionVehiculo {
  revision_tecnica: Documento | null;
  permiso_circulacion: Documento | null;
  seguro_obligatorio: Documento | null;
  gases: Documento | null;
  otros: Documento[];
  [key: string]: Documento | null | Documento[] | undefined;
}

@Component({
  selector: 'app-documentacion',
  standalone: true,
  imports: [
    CommonModule,
    MatListModule,
    MatIconModule,
    MatDividerModule,
    MatButtonModule,
    MatTooltipModule
  ],
  templateUrl: './documentacion.component.html',
  styleUrls: ['./documentacion.component.scss']
})
export class DocumentacionComponent implements OnInit {
  vehiculoId: string = '';
  documentacion: DocumentacionVehiculo = {
    revision_tecnica: null,
    permiso_circulacion: null,
    seguro_obligatorio: null,
    gases: null,
    otros: []
  };

  constructor(
    private route: ActivatedRoute,
    private uploadService: UploadDataService,
    private vehiculosService: VehiculosService,
    private cdr: ChangeDetectorRef
  ) {
    this.vehiculoId = this.route.snapshot.params['id'];
  }

  ngOnInit() {

    this.vehiculosService.getDocumentacionVehiculo(this.vehiculoId).subscribe({
      next: (documentacion) => {
        this.documentacion = documentacion;
        console.log('Documentación cargada:', this.documentacion);
      },
      error: (error) => {
        console.error('Error al cargar la documentación:', error);
      }
    });

   /*  if (this.vehiculoId) {
      this.vehiculosService.getVehiculoById(this.vehiculoId).subscribe({
        next: (vehiculo) => {
          if (typeof vehiculo.documentacion === 'string') {
            this.documentacion = JSON.parse(vehiculo.documentacion);
          } else {
            this.documentacion = vehiculo.documentacion;
          }
          console.log('Documentación cargada:', this.documentacion);
        },
        error: (error) => {
          console.error('Error al cargar la documentación:', error);
          Swal.fire('Error', 'No se pudo cargar la documentación', 'error');
        }
      });
    } */
  }

  async subirDocumento(tipo: string) {
    if (tipo === 'otros') {
      const input = document.createElement('input');
      input.type = 'file';
      input.multiple = true;
      input.accept = '.pdf,.doc,.docx,.xls,.xlsx';

      input.onchange = async (e: any) => {
        const files = Array.from(e.target.files || []);
        
        for (const file of files as File[]) {
          const nombreArchivo = prompt('Ingrese un nombre para el documento:', file.name.split('.')[0]);
          if (!nombreArchivo) continue;

          const formData = new FormData();
          formData.append('file', file);

          const path = `vehiculos/${this.vehiculoId}/documentos/otros/${nombreArchivo}`;

          try {
            const response = await firstValueFrom(this.uploadService.uploadFile(formData, path));
            console.log('Respuesta del servidor:', response);
            await this.cargarDocumentacion();
            Swal.fire('Éxito', 'Documento subido correctamente', 'success');
          } catch (error) {
            console.error('Error al subir documento:', error);
            Swal.fire('Error', 'No se pudo subir el documento', 'error');
          }
        }
      };

      input.click();
    } else {
      // Código existente para documentos individuales
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.pdf';
      
      input.onchange = async (e: any) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        try {
          await firstValueFrom(this.uploadService.uploadFile(file, `vehiculos/${this.vehiculoId}/documentos/${tipo}`));
          await this.cargarDocumentacion();
          Swal.fire('Éxito', 'Documento subido correctamente', 'success');
        } catch (error) {
          console.error('Error al subir documento:', error);
          Swal.fire('Error', 'No se pudo subir el documento', 'error');
        }
      };

      input.click();
    }
  }

    descargarDocumento(tipo: string, nombre?: string) {
      Swal.fire({
        title: 'Descargando...',
        text: 'Por favor espere',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      const path = `vehiculos/${this.vehiculoId}/documentos/${tipo}`;
      this.uploadService.downloadFile(path).subscribe({
        next: (response: any) => {
          // Crear un blob y descargarlo
          const blob = new Blob([response], { type: response.type });
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `${tipo}.pdf`; // o el tipo de archivo correspondiente
          link.click();
          window.URL.revokeObjectURL(url);
          Swal.close();
        },
        error: (error) => {
          console.error('Error al descargar documento:', error);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudo descargar el documento'
          });
        }
      });
    }

    eliminarDocumento(tipo: string, nombre?: string) {
      Swal.fire({
        title: '¿Estás seguro?',
        text: "No podrás revertir esta acción",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
      }).then((result) => {
        if (result.isConfirmed) {
          const path = `vehiculos/${this.vehiculoId}/documentos/${tipo}`;
          this.uploadService.deleteFile(path).subscribe({
            next: () => {
              Swal.fire(
                'Eliminado',
                'El documento ha sido eliminado',
                'success'
              );
              // Actualizar la vista
              if (this.documentacion) {
                delete this.documentacion[tipo];
                this.cdr.detectChanges();
              }
            },
            error: (error) => {
              console.error('Error al eliminar documento:', error);
              Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudo eliminar el documento'
              });
            }
          });
        }
      });
    }

    actualizarDocumento(tipo: string) {
      // Implementar lógica de actualización
    }

    cargarDocumentacion() {
      this.vehiculosService.getDocumentacionVehiculo(this.vehiculoId).subscribe(data => {
        this.documentacion = data || {
          revision_tecnica: null,
          permiso_circulacion: null,
          seguro_obligatorio: null,
          gases: null,
          otros: []
        };
        this.cdr.detectChanges(); // Asegúrate de detectar cambios
      });
    }
  }