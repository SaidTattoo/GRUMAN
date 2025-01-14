import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Documentos } from './documentos.entity';
import { Repository } from 'typeorm';
import { join } from 'path';
import { promises as fs } from 'fs';
@Injectable()
export class DocumentosService {
    constructor(
        @InjectRepository(Documentos)
        private documentosRepository: Repository<Documentos>,
    ) {}

    async findAll(): Promise<Documentos[]> {
        return this.documentosRepository.find({ order: { id: 'DESC' }, relations: ['tipoDocumento'] });
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
          const basePath = join(process.cwd(), 'uploads', 'vehiculos', vehiculoId, 'documentos', tipoDocumento);
          await fs.mkdir(basePath, { recursive: true });
          
          const extension = file.originalname.split('.').pop();
          const fileName = `${tipoDocumento}.${extension}`;
          const filePath = join(basePath, fileName);
          
          await fs.writeFile(filePath, file.buffer);
          
          // Crear y guardar el documento con todos los campos necesarios
          const documento = this.documentosRepository.create({
            vehiculoId: parseInt(vehiculoId),
            tipo: tipoDocumento,
            nombre: tipoDocumento,
            fecha: new Date(),
            path: filePath
          });
          
          // Guardar y retornar el documento completo (incluyendo el ID)
          const documentoGuardado = await this.documentosRepository.save(documento);
          return documentoGuardado;
        } catch (error) {
          console.error('Error al guardar el documento:', error);
          throw new Error('Error al guardar el documento');
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
}
