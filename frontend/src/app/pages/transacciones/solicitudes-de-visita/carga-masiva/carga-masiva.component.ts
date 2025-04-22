import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog } from '@angular/material/dialog';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';
import { MatStepperModule } from '@angular/material/stepper';
import { MatDividerModule } from '@angular/material/divider';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';
import * as XLSX from 'xlsx';
import { catchError, finalize } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { Router } from '@angular/router';

import { SolicitarVisitaService } from '../../../../services/solicitar-visita.service';
import { TipoServicioService } from '../../../../services/tipo-servicio.service';
import { LocalesService } from '../../../../services/locales.service';
import { SectoresService } from '../../../../services/sectores.service';
import { EspecialidadesService } from '../../../../services/especialidades.service';

import { StorageService } from '../../../../services/storage.service';
import { forkJoin } from 'rxjs';
import { ClientesService } from 'src/app/services/clientes.service';
import { TecnicosService } from 'src/app/services/tecnicos.service';
import { FacturacionService } from 'src/app/services/facturacion.service';

interface UploadedSolicitud {
  clienteId: number;
  localId: number;
  tipoServicioId: number;
  sectorTrabajoId: number;
  fechaVisita: Date;
  especialidad?: string;
  ticketGruman?: string;
  observaciones?: string;
  status: string;
  isValid: boolean;
  validationMessage?: string;
}

interface ExcelRow {
  [key: string]: any;
}

interface ColumnDefinition {
  key: string;
  label: string;
  required: boolean;
}

interface TablaVisitas {
  local: string;
  fechaVisita: string;
  tecnico1: string;
  tecnico2: string;
  mesFacturacion: string;
  localId: number;
  clientId: string;
  tecnico1Id?: number;
  tecnico2Id?: number;
  tipoServicioId: number;
  sectorTrabajoId: number;
  generada_por_id: number;
  aprobada_por_id: number;
  tipo_mantenimiento: string;
  status: string;
  facturacion_id: number;
}

@Component({
  selector: 'app-carga-masiva',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatIconModule,
    MatProgressBarModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatTabsModule,
    MatChipsModule,
    MatStepperModule,
    MatDividerModule,
    MatSnackBarModule
  ],
  templateUrl: './carga-masiva.component.html',
  styleUrls: ['./carga-masiva.component.scss']
})
export class CargaMasivaComponent implements OnInit {
  selectedFile: File | null = null;
  fileName: string = '';
  
  // Actualizar columnas para coincidir con el nuevo formato
  displayedColumns: string[] = [
    'local',
    'fechaVisita',
    'tecnico1',
    'tecnico2',
    'mesFacturacion',
    'localId',
    'clientId'
  ];
  dataSource: TablaVisitas[] = [];

  constructor(
    private localesService: LocalesService,
    private tecnicosService: TecnicosService,
    private clientesService: ClientesService,
    private solicitarVisitaService: SolicitarVisitaService,
    private facturacionService: FacturacionService,

    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
  }

  async onFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      this.fileName = this.selectedFile.name;

      const reader = new FileReader();
      reader.onload = async (e: any) => {
        const workbook = XLSX.read(e.target.result, { type: 'binary' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        
        const rawData = XLSX.utils.sheet_to_json(worksheet, { 
          header: 1,
          raw: false,
          defval: ''
        });

        // Procesar los datos y buscar los IDs
        const processedData = await Promise.all((rawData as any[]).slice(1).map(async (row: any[]) => {
          const nombreLocal = row[0]?.toString() || '';
          const nombreCliente = row[5]?.toString() || ''; // Asumiendo que 'cliente' está en la columna F
          let localId: number | undefined;
          let clientId: number | undefined;

          if (nombreLocal) {
            try {
              const localInfo = await this.localesService.getLocalByNombre(nombreLocal).toPromise();
              if (localInfo) {
                localId = localInfo.id;
              }
            } catch (error) {
              console.error(`Error al buscar local: ${nombreLocal}`, error);
            }
          }

          return {
            local: nombreLocal,
            fechaVisita: row[1]?.toString() || '',
            rutTecnico1: row[2]?.toString() || '',
            rutTecnico2: row[3]?.toString() || '',
            mesFacturacion: row[4]?.toString() || '',
            cliente: nombreCliente, // Agregamos el cliente al objeto
            localId,
          };
        }));

        console.log('Datos procesados del Excel:', processedData);
        this.dataSource = await this.mapToTablaVisitas(processedData.filter(row => row.local));
      };

      reader.readAsBinaryString(this.selectedFile);
    }
  }

  private async getTecnicoDetails(rut: string): Promise<any> {
    if (!rut) return null;
    try {
      const tecnicos = await this.tecnicosService.getTecnicosByRut(rut).toPromise();
      if (tecnicos && tecnicos.length > 0) {
        return {
          id: tecnicos[0].id,
          nombre: tecnicos[0].name,
          apellido: tecnicos[0].lastName
        };
      }
      return null;
    } catch (error) {
      console.error('Error fetching technician details:', error);
      return null;
    }
  }

  private async findIdClientByName(nombreCliente: string): Promise<number | null> {
    if (!nombreCliente) return null;
    
    // Normalizar el nombre del cliente
    const nombreNormalizado = nombreCliente.trim().toLowerCase();
    
    // Mapeo exacto según los nombres en la base de datos
    const nombresMapeados: { [key: string]: string } = {
      'cruz verde': 'Cruz Verde',
      'cruz verde clima': 'Cruz Verde Clima',
      'maicao': 'Maicao',
      'maicao clima': 'Maicao Clima',
      'san camilo': 'San Camilo',
      'rotter y krauss': 'Rotter y Krauss',
      'gruman': 'GRUMAN'
    };

    try {
      // Usar el nombre mapeado si existe, si no usar el original
      const nombreBusqueda = nombresMapeados[nombreNormalizado];
      
      if (!nombreBusqueda) {
        console.warn(`No se encontró mapeo para el cliente: ${nombreCliente}`);
        return null;
      }

      const cliente = await this.clientesService.getClienteByNombre(nombreBusqueda).toPromise();
      
      if (cliente) {
        console.log(`Cliente encontrado: ${nombreBusqueda}, ID: ${cliente.id}`);
        return cliente.id;
      }
      
      console.warn(`No se encontró cliente en BD con nombre: ${nombreBusqueda}`);
      return null;
    } catch (error) {
      console.error('Error buscando cliente:', error);
      return null;
    }
  }

  private async mapToTablaVisitas(data: any[]): Promise<TablaVisitas[]> {
    const mappedData: TablaVisitas[] = [];
    for (const item of data) {
      console.log('Procesando item:', item); // Para debug
      let tecnico1Details = null;
      let tecnico2Details = null;
      
      // Buscar ID del cliente y formatear la salida
      let clientIdDisplay = '0';
      if (item.cliente) {
        const clientId = await this.findIdClientByName(item.cliente);
        if (clientId) {
          clientIdDisplay = `${clientId} - ${item.cliente}`;
        }
      }

      if (item.rutTecnico1) {
        tecnico1Details = await this.getTecnicoDetails(item.rutTecnico1);
        if (!tecnico1Details) {
          tecnico1Details = {
            id: null,
            nombre: 'Técnico',
            apellido: 'Desconocido'
          };
        }
      }

      if (item.rutTecnico2) {
        tecnico2Details = await this.getTecnicoDetails(item.rutTecnico2);
        if (!tecnico2Details) {
          tecnico2Details = {
            id: null,
            nombre: 'Técnico',
            apellido: 'Desconocido'
          };
        }
      }

      // Extract numeric client ID from the display string
      const [numericClientId] = clientIdDisplay.split(' - ');
      
      // Get facturacion ID using the month and numeric client ID
      let facturacionId = 999; // Default value
      try {
        console.log('Buscando facturación para:', {
          mes: item.mesFacturacion, // Usar el mes completo
          clienteId: parseInt(numericClientId)
        });
        
        const facturacion = await this.facturacionService.buscarFacturacion(
          item.mesFacturacion, // Usar el mes completo (ej: "Mayo 2025")
          parseInt(numericClientId)
        ).toPromise();
        
        console.log('Respuesta facturación:', facturacion);
        
        if (facturacion && Array.isArray(facturacion) && facturacion.length > 0) {
          facturacionId = facturacion[0].id;
          console.log('ID de facturación encontrado:', facturacionId);
        } else {
          console.log('No se encontró facturación, usando valor por defecto:', facturacionId);
        }
      } catch (error) {
        console.error('Error getting facturacion:', error);
      }

      mappedData.push({
        local: item.local || '',
        fechaVisita: item.fechaVisita || '',
        tecnico1: `${tecnico1Details?.nombre || ''} ${tecnico1Details?.apellido || ''}`.trim() || '',
        tecnico2: `${tecnico2Details?.nombre || ''} ${tecnico2Details?.apellido || ''}`.trim() || '',
        mesFacturacion: item.mesFacturacion || '',
        localId: item.localId || 0,
        clientId: clientIdDisplay,
        tecnico1Id: tecnico1Details?.id || null,
        tecnico2Id: tecnico2Details?.id || null,
        tipoServicioId: 3,
        sectorTrabajoId: 1,
        generada_por_id: 9999,
        aprobada_por_id: 9999,
        tipo_mantenimiento: 'programado',
        status: 'aprobada',
        facturacion_id: facturacionId
      });
    }
    
    return mappedData;
  }

  // Función para preparar los datos para el envío al backend
  private prepararDatosParaEnvio(data: TablaVisitas[]): any[] {
    return data.map(item => {
      const [clientId] = item.clientId.split(' - '); // Extraer solo el ID numérico
      return {
        localId: item.localId,
        clienteId: parseInt(clientId),
        fechaVisita: item.fechaVisita,
        tecnico1Id: item.tecnico1Id,
        tecnico2Id: item.tecnico2Id,
        tipoServicioId: 3,
        sectorTrabajoId: 1,
        generada_por_id: 9999,
        aprobada_por_id: 9999,
        tipo_mantenimiento: 'programado',
        status: 'aprobada',
        facturacion_id: 999,
        mesFacturacion: item.mesFacturacion
      };
    });
  }

  // Método para enviar los datos al backend
  async enviarDatos() {
    try {
      const datosPreparados = this.prepararDatosParaEnvio(this.dataSource);
      console.log('Datos preparados:', datosPreparados);
      // Asumiendo que tienes un servicio para enviar las solicitudes
      const resultado = await this.solicitarVisitaService.subirCargaMasiva(datosPreparados).toPromise();
      console.log('Solicitudes creadas exitosamente:', resultado);
      // Mostrar mensaje de éxito
      this.snackBar.open('Carga masiva realizada con éxito', 'Cerrar', {
        duration: 3000
      });
    } catch (error) {
      console.error('Error al crear solicitudes:', error);
      // Mostrar mensaje de error
      this.snackBar.open('Error al realizar la carga masiva', 'Cerrar', {
        duration: 3000
      });
    }
  }
} 


