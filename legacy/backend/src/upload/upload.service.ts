import { Injectable } from '@nestjs/common';
import { promises as fs } from 'fs';
import { join } from 'path';
import { existsSync, readdirSync, statSync, mkdirSync, writeFile, unlink } from 'fs';
import { extname } from 'path';
import * as path from 'path';

@Injectable()
export class UploadService {
  async getDocumentacionVehiculo(vehiculoId: string) {
    try {
      const basePath = join(process.cwd(), 'uploads', 'vehiculos', vehiculoId);
      const documentosPath = join(basePath, 'documentos');
      const otrosPath = join(documentosPath, 'otros');
      
      if (!existsSync(basePath)) {
        return {};
      }

      const documentacion: any = {};
      const tiposDocumentos = ['revision_tecnica', 'permiso_circulacion', 'seguro_obligatorio', 'gases'];

      // Procesar documentos principales
      for (const tipo of tiposDocumentos) {
        const files = readdirSync(documentosPath)
          .filter(file => file.toLowerCase().includes(tipo.toLowerCase()));
        
        if (files.length > 0) {
          const stats = statSync(join(documentosPath, files[0]));
          documentacion[tipo] = {
            fecha: stats.mtime,
            nombre: files[0]
          };
        }
      }

      // Procesar documentos en la carpeta "otros"
      if (existsSync(otrosPath)) {
        const otrosFiles = readdirSync(otrosPath);
        documentacion.otros = otrosFiles.map(file => {
          const stats = statSync(join(otrosPath, file));
          return {
            fecha: stats.mtime,
            nombre: file
          };
        });
      } else {
        documentacion.otros = [];
      }

      return documentacion;
    } catch (error) {
      console.error('Error al obtener documentación:', error);
      throw new Error('Error al obtener la documentación del vehículo');
    }
  }

  async saveFile(file: Express.Multer.File, vehiculoId: string, tipo: string) {
    try {
      const uploadPath = join(process.cwd(), 'uploads', 'vehiculos', vehiculoId, 'documentos', tipo);
      await fs.mkdir(uploadPath, { recursive: true });

      const filePath = join(uploadPath, file.originalname);
      if (!file.buffer) {
        throw new Error('El buffer del archivo es undefined');
      }
      await fs.writeFile(filePath, file.buffer);

      return { path: filePath };
    } catch (error) {
      console.error('Error al guardar archivo:', error);
      throw new Error('Error al guardar el archivo');
    }
  }

  async getFilePath(vehiculoId: string, tipo: string) {
    const basePath = join(process.cwd(), 'uploads', 'vehiculos', vehiculoId);
    const files = readdirSync(basePath)
      .filter(file => file.toLowerCase().includes(tipo.toLowerCase()));

    if (files.length === 0) {
      throw new Error('Archivo no encontrado');
    }

    return join(basePath, files[0]);
  }

  async deleteFile(vehiculoId: string, tipo: string, nombreArchivo: string) {
    try {
      const filePath = join(process.cwd(), 'uploads', 'vehiculos', vehiculoId, 'documentos', tipo, nombreArchivo);
      //console.log(`Intentando eliminar archivo en: ${filePath}`);

      if (!existsSync(filePath)) {
        console.error(`Archivo no encontrado: ${filePath}`);
        throw new Error('Archivo no encontrado');
      }

      await fs.unlink(filePath);
      //console.log(`Archivo eliminado: ${filePath}`);
    } catch (error) {
      console.error('Error al eliminar archivo:', error);
      throw new Error(`Error al eliminar el archivo ${nombreArchivo} del vehiculo ${vehiculoId}`);
    }
  }

  async uploadFile(file: Express.Multer.File) {
    try {
      const uploadPath = join(process.cwd(), 'uploads');
      if (!existsSync(uploadPath)) {
        mkdirSync(uploadPath, { recursive: true });
      }
      const filePath = join(uploadPath, file.originalname);
      
      await fs.writeFile(filePath, file.buffer);
      return {
        message: 'Archivo subido exitosamente'
      };
    } catch (error) {
      throw new Error('Error al subir el archivo');
    }
  }

  async downloadFile(vehiculoId: string, tipo: string) {
    // Implementa la lógica para obtener el archivo
    const filePath = await this.getFilePath(vehiculoId, tipo);
    const buffer = await fs.readFile(filePath);
    const filename = path.basename(filePath);
    
    return {
      buffer,
      filename
    };
  }
} 