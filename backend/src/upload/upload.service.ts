import { Injectable } from '@nestjs/common';
import { promises as fs } from 'fs';
import { join } from 'path';
import { existsSync, readdirSync, statSync, mkdirSync, writeFile, unlink } from 'fs';
import { extname } from 'path';
import * as path from 'path';

@Injectable()
export class UploadService {
  /**
   * Obtiene la documentación de un vehículo especificado por su ID.
   * Revisa los documentos principales (revisión técnica, permiso de circulación, seguro obligatorio, gases)
   * y cualquier otro documento almacenado en una subcarpeta "otros".
   * @param vehiculoId - ID del vehículo para identificar su carpeta de almacenamiento.
   * @returns Un objeto con la documentación encontrada y sus metadatos.
   */
  async getDocumentacionVehiculo(vehiculoId: string) {
    try {
      // Define las rutas base y de documentos del vehículo
      const basePath = join(process.cwd(), 'uploads', 'vehiculos', vehiculoId);
      const documentosPath = join(basePath, 'documentos');
      const otrosPath = join(documentosPath, 'otros');
      
      // Si no existe la carpeta base, retorna un objeto vacío
      if (!existsSync(basePath)) {
        return {};
      }

      const documentacion: any = {};
      // Tipos de documentos principales que se deben buscar
      const tiposDocumentos = ['revision_tecnica', 'permiso_circulacion', 'seguro_obligatorio', 'gases'];

      // Procesa los documentos principales
      for (const tipo of tiposDocumentos) {
        const files = readdirSync(documentosPath)
          .filter(file => file.toLowerCase().includes(tipo.toLowerCase())); // Busca archivos por tipo
        
        if (files.length > 0) {
          const stats = statSync(join(documentosPath, files[0])); // Obtiene metadatos del archivo
          documentacion[tipo] = {
            fecha: stats.mtime, // Fecha de última modificación
            nombre: files[0]   // Nombre del archivo
          };
        }
      }

      // Procesa los documentos en la subcarpeta "otros"
      if (existsSync(otrosPath)) {
        const otrosFiles = readdirSync(otrosPath);
        documentacion.otros = otrosFiles.map(file => {
          const stats = statSync(join(otrosPath, file));
          return {
            fecha: stats.mtime, // Fecha de última modificación
            nombre: file        // Nombre del archivo
          };
        });
      } else {
        documentacion.otros = []; // Si no existe la carpeta, inicializa como vacío
      }

      return documentacion;
    } catch (error) {
      console.error('Error al obtener documentación:', error);
      throw new Error('Error al obtener la documentación del vehículo');
    }
  }

  /**
   * Guarda un archivo en la carpeta correspondiente a un vehículo y tipo de documento.
   * @param file - Archivo recibido del cliente.
   * @param vehiculoId - ID del vehículo para identificar su carpeta de almacenamiento.
   * @param tipo - Tipo de documento (por ejemplo, revisión técnica).
   * @returns Ruta del archivo guardado.
   */
  async saveFile(file: Express.Multer.File, vehiculoId: string, tipo: string) {
    try {
      // Define la ruta donde se almacenará el archivo
      const uploadPath = join(process.cwd(), 'uploads', 'vehiculos', vehiculoId, 'documentos', tipo);
      await fs.mkdir(uploadPath, { recursive: true }); // Crea la carpeta si no existe

      const filePath = join(uploadPath, file.originalname); // Ruta completa del archivo
      if (!file.buffer) {
        throw new Error('El buffer del archivo es undefined'); // Validación
      }
      await fs.writeFile(filePath, file.buffer); // Guarda el archivo en la ruta especificada

      return { path: filePath };
    } catch (error) {
      console.error('Error al guardar archivo:', error);
      throw new Error('Error al guardar el archivo');
    }
  }

  /**
   * Obtiene la ruta de un archivo específico en la carpeta del vehículo.
   * @param vehiculoId - ID del vehículo.
   * @param tipo - Tipo de documento a buscar.
   * @returns Ruta completa del archivo encontrado.
   */
  async getFilePath(vehiculoId: string, tipo: string) {
    const basePath = join(process.cwd(), 'uploads', 'vehiculos', vehiculoId);
    const files = readdirSync(basePath)
      .filter(file => file.toLowerCase().includes(tipo.toLowerCase())); // Filtra archivos por tipo

    if (files.length === 0) {
      throw new Error('Archivo no encontrado');
    }

    return join(basePath, files[0]); // Retorna la ruta completa del archivo encontrado
  }

  /**
   * Elimina un archivo específico en la carpeta del vehículo.
   * @param vehiculoId - ID del vehículo.
   * @param tipo - Tipo de documento.
   * @param nombreArchivo - Nombre del archivo a eliminar.
   */
  async deleteFile(vehiculoId: string, tipo: string, nombreArchivo: string) {
    try {
      // Define la ruta del archivo a eliminar
      const filePath = join(process.cwd(), 'uploads', 'vehiculos', vehiculoId, 'documentos', tipo, nombreArchivo);
      //console.log(`Intentando eliminar archivo en: ${filePath}`);

      if (!existsSync(filePath)) {
        console.error(`Archivo no encontrado: ${filePath}`);
        throw new Error('Archivo no encontrado');
      }

      await fs.unlink(filePath); // Elimina el archivo
      //console.log(`Archivo eliminado: ${filePath}`);
    } catch (error) {
      console.error('Error al eliminar archivo:', error);
      throw new Error(`Error al eliminar el archivo ${nombreArchivo} del vehiculo ${vehiculoId}`);
    }
  }

  /**
   * Guarda un archivo en la carpeta principal de subidas.
   * @param file - Archivo recibido del cliente.
   * @returns Mensaje de éxito.
   */
  async uploadFile(file: Express.Multer.File) {
    console.log('Subiendo archivo:', file.originalname);
    try {
      const uploadPath = join(process.cwd(), 'uploads'); // Ruta base de subidas
      if (!existsSync(uploadPath)) {
        mkdirSync(uploadPath, { recursive: true }); // Crea la carpeta si no existe
      }
      const filePath = join(uploadPath, file.originalname); // Ruta completa del archivo
      
      await fs.writeFile(filePath, file.buffer); // Guarda el archivo
      return {
        message: 'Archivo subido exitosamente'
      };
    } catch (error) {
      throw new Error('Error al subir el archivo');
    }
  }

  /**
   * Descarga un archivo del servidor, retornando su contenido como buffer y el nombre del archivo.
   * @param vehiculoId - ID del vehículo.
   * @param tipo - Tipo de documento.
   * @returns Buffer y nombre del archivo.
   */
  async downloadFile(vehiculoId: string, tipo: string) {
    const filePath = await this.getFilePath(vehiculoId, tipo); // Obtiene la ruta del archivo
    const buffer = await fs.readFile(filePath); // Lee el contenido del archivo como buffer
    const filename = path.basename(filePath); // Extrae el nombre del archivo
    
    return {
      buffer,   // Contenido del archivo
      filename  // Nombre del archivo
    };
  }
}
