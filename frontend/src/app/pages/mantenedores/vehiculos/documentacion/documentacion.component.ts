import { Component, OnInit, ChangeDetectorRef, Input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
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
import { MatDialog } from '@angular/material/dialog';
import { DocumentosService } from 'src/app/services/documentos.service';
  
interface Documento {
  fecha?: string;
  nombre?: string;
  id?: number;
  fechaVencimiento?: Date;
}

interface DocumentacionVehiculo {
  revision_tecnica: Documento | null;
  permiso_circulacion: Documento | null;
  seguro_obligatorio: Documento | null;
  gases: Documento | null;
  otros: Documento[];
  [key: string]: Documento | null | Documento[];
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
  providers: [DocumentosService],
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
    private cdr: ChangeDetectorRef,
    private router: Router,
    private dialog: MatDialog,
    private documentosService: DocumentosService
  ) {
    this.vehiculoId = this.route.snapshot.params['id'];
  }

  ngOnInit() {
    this.cargarDocumentacion();
  }

  
  async subirDocumento(tipo: string) {
    console.log('Subiendo documento:', tipo);
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = tipo === 'otros' ? '.pdf,.doc,.docx,.xls,.xlsx' : '.pdf';
    input.multiple = tipo === 'otros';

    input.onchange = async (e: any) => {
      const files = Array.from(e.target.files || []);
      console.log(`Archivos seleccionados para ${tipo}:`, files);

      for (const file of files as File[]) {
        let nombreArchivo = file.name.split('.')[0];

        if (tipo === 'otros') {
          nombreArchivo = prompt('Ingrese un nombre para el documento:', nombreArchivo) || nombreArchivo;
        }

        const formData = new FormData();
        formData.append('file', file);

        const path = tipo === 'otros'
          ? `vehiculos/${this.vehiculoId}/documentos/otros/${encodeURIComponent(nombreArchivo)}`
          : `vehiculos/${this.vehiculoId}/documentos/${tipo}`;

        try {
          console.log(`Intentando subir archivo a ${path}`);
          const documento = await firstValueFrom(this.uploadService.uploadFile(formData, path));
          console.log('Respuesta del servidor:', documento);

          // Actualizar el documento en la estructura local
          if (tipo === 'otros') {
            this.documentacion.otros.push(documento);
          } else {
            this.documentacion[tipo] = documento;
          }
          
          this.cdr.detectChanges();
          Swal.fire('Éxito', 'Documento subido correctamente', 'success');
        } catch (error) {
          console.error('Error al subir documento:', error);
          Swal.fire('Error', 'No se pudo subir el documento', 'error');
        }
      }
    };

    input.click();
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
    console.log(`Intentando descargar documento desde ${path}`);

    this.uploadService.downloadFile(path).subscribe({
      next: (response: any) => {
        const blob = new Blob([response], { type: response.type });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${tipo}.pdf`; // Ajustar según el tipo real del archivo
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
      text: 'No podrás revertir esta acción',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        const path = `vehiculos/${this.vehiculoId}/documentos/${tipo}`;
        console.log(`Intentando eliminar documento en ${path}`);

        this.uploadService.deleteFile(path).subscribe({
          next: () => {
            Swal.fire('Eliminado', 'El documento ha sido eliminado', 'success');
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
    // Implementar lógica de actualización en el futuro
  }

  cargarDocumentacion() {
    console.log('Cargando documentación para el vehículo:', this.vehiculoId);

    this.vehiculosService.getDocumentacionVehiculo(this.vehiculoId).subscribe({
      next: (data) => {
        console.log('Documentación cargada:', data);
        this.documentacion = data || {
          revision_tecnica: null,
          permiso_circulacion: null,
          seguro_obligatorio: null,
          gases: null,
          otros: []
        };
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error al cargar la documentación:', error);
        Swal.fire('Error', 'No se pudo cargar la documentación', 'error');
      }
    });
  }

  async actualizarFechaVencimiento(tipo: string, nombre?: string) {
    console.log('Actualizando fecha de vencimiento para:', tipo, nombre);
    
    // Obtener el documento actual
    let doc: any = null;
    if (tipo === 'otros' && nombre) {
      doc = this.documentacion.otros.find(d => d.nombre === nombre) || null;
    } else {
      doc = this.documentacion[tipo];
    }

    if (!doc || !doc.id) {
      console.error('No se encontró el ID del documento');
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se encontró el documento'
      });
      return;
    }

    const { value: fechaVencimiento } = await Swal.fire({
      title: 'Seleccionar fecha de vencimiento',
      html: '<input type="date" id="fecha-vencimiento" class="swal2-input">',
      didOpen: () => {
        const input = document.getElementById('fecha-vencimiento') as HTMLInputElement;
        if (doc.fechaVencimiento) {
          input.value = new Date(doc.fechaVencimiento).toISOString().split('T')[0];
        } else {
          input.value = new Date().toISOString().split('T')[0];
        }
      },
      showCancelButton: true,
      confirmButtonText: 'Guardar',
      cancelButtonText: 'Cancelar',
      preConfirm: () => {
        const input = document.getElementById('fecha-vencimiento') as HTMLInputElement;
        return input.value ? new Date(input.value) : null;
      }
    });

    if (fechaVencimiento) {
      this.documentosService.actualizarFechaVencimiento(doc.id, fechaVencimiento).subscribe({
        next: (response) => {
          if (tipo === 'otros') {
            const index = this.documentacion.otros.findIndex(d => d.nombre === nombre);
            if (index !== -1) {
              this.documentacion.otros[index] = response;
            }
          } else {
            this.documentacion[tipo] = response;
          }
          this.cdr.detectChanges();
          Swal.fire({
            icon: 'success',
            title: 'Fecha de vencimiento actualizada',
            showConfirmButton: false,
            timer: 1500
          });
        },
        error: (error) => {
          console.error('Error al actualizar fecha de vencimiento:', error);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudo actualizar la fecha de vencimiento'
          });
        }
      });
    }
  }
}
