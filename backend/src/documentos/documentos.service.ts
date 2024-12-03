import { Injectable } from '@nestjs/common';
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
    async guardarDocumento(vehiculoId: string, tipoDocumento: string, file: Express.Multer.File): Promise<{ path: string }> {
        try {
          // Ruta base para almacenar documentos
          const basePath = join(process.cwd(), 'uploads', 'vehiculos', vehiculoId, 'documentos', tipoDocumento);
    
          // Crea la carpeta si no existe
          await fs.mkdir(basePath, { recursive: true });
    
          // Renombra el archivo basado en el tipo de documento
          const extension = file.originalname.split('.').pop(); // Obtiene la extensión del archivo
          const fileName = `${tipoDocumento}.${extension}`; // Ejemplo: gases.pdf
          const filePath = join(basePath, fileName);
    
          // Guarda el archivo con el nuevo nombre
          await fs.writeFile(filePath, file.buffer);
    
          console.log(`Archivo guardado en: ${filePath}`);
          return { path: filePath };
        } catch (error) {
          console.error('Error al guardar el documento:', error);
          throw new Error('Error al guardar el documento');
        }
      }
}
