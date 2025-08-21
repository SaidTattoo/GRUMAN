import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Documentos } from './documentos.entity';
import { Repository } from 'typeorm';
import { FirebaseService } from '../firebase/firebase.service';
import { Vehiculo } from '../vehiculos/vehiculos.entity';
@Injectable()
export class DocumentosService {
    constructor(
        @InjectRepository(Documentos)
        private documentosRepository: Repository<Documentos>,
        @InjectRepository(Vehiculo)
        private vehiculosRepository: Repository<Vehiculo>,
        private firebaseService: FirebaseService,
    ) {}

    async findAll(): Promise<Documentos[]> {
        return this.documentosRepository.find({ 
            where: { activo: true, deleted: false },
            order: { id: 'DESC' }, 
            relations: ['tipoDocumento'] 
        });
    }
    async create(documento: Documentos): Promise<Documentos> {
        //console.log(documento);
        return this.documentosRepository.save(documento);
    }
    /**
   * Guarda el documento en el sistema de archivos en la ruta especificada.
   * @param vehiculoId - ID del vehículo al que pertenece el documento.
   * @param tipoDocumento - Tipo de documento (revisión técnica, gases, etc.).
   * @param file - Archivo recibido del cliente.
   * @returns Ruta completa donde se guardó el archivo.
   */
    async guardarDocumento(vehiculoId: string, tipoDocumento: string, file: Express.Multer.File): Promise<Documentos> {
        try {
          // Obtener la patente del vehículo
          const vehiculo = await this.vehiculosRepository.findOne({ 
            where: { id: parseInt(vehiculoId) } 
          });
          
          if (!vehiculo) {
            throw new Error(`Vehículo con ID ${vehiculoId} no encontrado`);
          }
          
          // Crear la ruta de Firebase: documents-cars/<patente>/
          const firebasePath = `documents-cars/${vehiculo.patente}`;
          
          // Subir el archivo a Firebase Storage
          const fileUrl = await this.firebaseService.uploadImage(file, firebasePath);
          
          // Crear y guardar el documento con todos los campos necesarios
          const documento = this.documentosRepository.create({
            vehiculoId: parseInt(vehiculoId),
            tipo: tipoDocumento,
            nombre: tipoDocumento,
            fecha: new Date(),
            path: fileUrl
          });
          
          // Guardar el documento en la tabla documentos
          const documentoGuardado = await this.documentosRepository.save(documento);
          
          // Actualizar el campo documentacion JSON en la tabla vehiculos
          await this.actualizarDocumentacionVehiculo(vehiculo, tipoDocumento, fileUrl);
          
          return documentoGuardado;
        } catch (error) {
          console.error('Error al guardar el documento:', error);
          throw new Error('Error al guardar el documento');
        }
    }

    private async actualizarDocumentacionVehiculo(vehiculo: Vehiculo, tipoDocumento: string, fileUrl: string): Promise<void> {
        try {
          // Deserializar la documentación actual
          let documentacion = {
            revision_tecnica: null,
            gases: null,
            permiso_circulacion: null,
            seguro_obligatorio: null
          };

          // Si ya existe documentación, parsearla
          if (vehiculo.documentacion) {
            try {
              if (typeof vehiculo.documentacion === 'string') {
                documentacion = JSON.parse(vehiculo.documentacion);
              } else {
                documentacion = vehiculo.documentacion as any;
              }
            } catch (parseError) {
              console.error('Error al parsear documentación existente:', parseError);
              // Mantener la estructura por defecto si hay error de parsing
            }
          }

          // Actualizar el tipo de documento específico
          if (documentacion.hasOwnProperty(tipoDocumento)) {
            documentacion[tipoDocumento] = fileUrl;
          }

          // Actualizar el vehículo con la nueva documentación
          await this.vehiculosRepository.update(parseInt(vehiculo.id.toString()), {
            documentacion: JSON.stringify(documentacion)
          });

          console.log(`Documentación actualizada para vehículo ${vehiculo.id}: ${tipoDocumento} = ${fileUrl}`);
        } catch (error) {
          console.error('Error al actualizar documentación del vehículo:', error);
          // No lanzamos error aquí para que no falle todo el proceso de subida
        }
    }

    async actualizarFechaVencimiento(id: number, fechaVencimiento: Date): Promise<Documentos> {
        console.log(fechaVencimiento);
        const documento = await this.documentosRepository.findOne({ where: { id } });
        console.log(documento);
        if (!documento) {
            throw new NotFoundException(`Documento con ID ${id} no encontrado`);
        }

        documento.fechaVencimiento = fechaVencimiento;
        return this.documentosRepository.save(documento);
    }

    // Agregar método para obtener documento por tipo y vehículo
    async obtenerDocumentoPorTipo(vehiculoId: number, tipo: string): Promise<Documentos | null> {
        return this.documentosRepository.findOne({
            where: {
                vehiculoId,
                tipo,
                activo: true
            }
        });
    }

    async eliminarDocumento(vehiculoId: string, tipo: string): Promise<void> {
        try {
            // Buscar el documento en la base de datos
            const documento = await this.documentosRepository.findOne({
                where: {
                    vehiculoId: parseInt(vehiculoId),
                    tipo: tipo,
                    activo: true
                }
            });

            if (!documento) {
                throw new Error(`Documento de tipo ${tipo} no encontrado para el vehículo ${vehiculoId}`);
            }

            // Obtener el vehículo para actualizar la documentación
            const vehiculo = await this.vehiculosRepository.findOne({ 
                where: { id: parseInt(vehiculoId) } 
            });

            if (!vehiculo) {
                throw new Error(`Vehículo con ID ${vehiculoId} no encontrado`);
            }

            // Marcar como eliminado en lugar de eliminar físicamente
            documento.activo = false;
            documento.deleted = true;
            await this.documentosRepository.save(documento);

            // Actualizar el campo documentacion JSON para limpiar el tipo eliminado
            await this.limpiarDocumentacionVehiculo(vehiculo, tipo);

            console.log(`Documento ${tipo} del vehículo ${vehiculoId} marcado como eliminado`);
        } catch (error) {
            console.error('Error al eliminar documento:', error);
            throw new Error('Error al eliminar el documento');
        }
    }

    private async limpiarDocumentacionVehiculo(vehiculo: Vehiculo, tipoDocumento: string): Promise<void> {
        try {
          // Deserializar la documentación actual
          let documentacion = {
            revision_tecnica: null,
            gases: null,
            permiso_circulacion: null,
            seguro_obligatorio: null
          };

          // Si ya existe documentación, parsearla
          if (vehiculo.documentacion) {
            try {
              if (typeof vehiculo.documentacion === 'string') {
                documentacion = JSON.parse(vehiculo.documentacion);
              } else {
                documentacion = vehiculo.documentacion as any;
              }
            } catch (parseError) {
              console.error('Error al parsear documentación existente:', parseError);
              // Mantener la estructura por defecto si hay error de parsing
            }
          }

          // Limpiar el tipo de documento específico
          if (documentacion.hasOwnProperty(tipoDocumento)) {
            documentacion[tipoDocumento] = null;
          }

          // Actualizar el vehículo con la documentación limpia
          await this.vehiculosRepository.update(parseInt(vehiculo.id.toString()), {
            documentacion: JSON.stringify(documentacion)
          });

          console.log(`Documentación limpiada para vehículo ${vehiculo.id}: ${tipoDocumento} = null`);
        } catch (error) {
          console.error('Error al limpiar documentación del vehículo:', error);
          // No lanzamos error aquí para que no falle todo el proceso de eliminación
        }
    }
}
