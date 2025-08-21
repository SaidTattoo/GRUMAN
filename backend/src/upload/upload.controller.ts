import { Controller, Post, UseInterceptors, UploadedFile, Param, Get, Res, Delete, HttpException, HttpStatus, NotFoundException, UploadedFiles, Query } from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { join } from 'path';
import { UploadService } from './upload.service';
import { existsSync, readdirSync } from 'fs';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { FirebaseService } from '../firebase/firebase.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vehiculo } from '../vehiculos/vehiculos.entity';

@Controller('upload')
export class UploadController {
  constructor(
    private readonly uploadService: UploadService,
    private readonly firebaseService: FirebaseService,
    @InjectRepository(Vehiculo)
    private vehiculosRepository: Repository<Vehiculo>,
  ) {}

  @Get('vehiculos/:vehiculoId/documentos/:tipoDocumento')
  async descargarDocumento(
    @Param('vehiculoId') vehiculoId: string,
    @Param('tipoDocumento') tipoDocumento: string,
    @Res() res: Response,
  ) {
    try {
      // Ruta base de la carpeta del documento
      const basePath = join(process.cwd(), 'uploads', 'vehiculos', vehiculoId, 'documentos', tipoDocumento);

      console.log(`Buscando documentos en: ${basePath}`);

      // Verifica si la carpeta existe
      if (!existsSync(basePath)) {
        console.error('La carpeta del documento no existe:', basePath);
        throw new HttpException('Carpeta no encontrada', HttpStatus.NOT_FOUND);
      }

      // Busca archivos en la carpeta
      const files = readdirSync(basePath);
      if (files.length === 0) {
        console.error('No se encontraron archivos en la carpeta:', basePath);
        throw new HttpException('Archivo no encontrado', HttpStatus.NOT_FOUND);
      }

      // Selecciona el primer archivo encontrado (o ajusta la lógica para manejar múltiples archivos)
      const fileName = files[0];
      const filePath = join(basePath, fileName);

      console.log(`Archivo encontrado: ${filePath}`);

      // Envía el archivo como respuesta
      return res.sendFile(filePath);
    } catch (error) {
      console.error('Error al descargar el documento:', error);
      throw new HttpException('Error al descargar el documento', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  // DEPRECATED: Esta funcionalidad ahora está manejada por DocumentosController
  // Mantenido solo para compatibilidad temporal

  /**
   * Descarga un archivo específico de un vehículo basado en su tipo.
   * @param vehiculoId - ID del vehículo asociado.
   * @param tipo - Tipo de documento a descargar.
   * @param res - Respuesta HTTP para enviar el archivo.
   */
  @Get('vehiculos/:vehiculoId/documentos/:tipo')
  async downloadFile(
    @Param('vehiculoId') vehiculoId: string,
    @Param('tipo') tipo: string,
    @Res() res: Response
  ) {
    try {
      const file = await this.uploadService.downloadFile(vehiculoId, tipo);
      res.set({
        'Content-Type': 'application/octet-stream', // Configura el tipo de contenido
        'Content-Disposition': `attachment; filename="${file.filename}"`, // Define el encabezado para descarga
      });
      res.send(file.buffer); // Envía el archivo como buffer
    } catch (error) {
      // Lanza una excepción 404 si no se encuentra el archivo
      throw new NotFoundException('Archivo no encontrado');
    }
  }

  /**
   * Obtiene todos los documentos relacionados con un vehículo específico.
   * @param vehiculoId - ID del vehículo para identificar su carpeta de almacenamiento.
   * @returns Un objeto con los documentos principales y adicionales.
   */
  @Get('vehiculos/:vehiculoId/documentos')
  async getDocumentacionVehiculo(
    @Param('vehiculoId') vehiculoId: string,
  ) {
    return this.uploadService.getDocumentacionVehiculo(vehiculoId);
  }

  /**
   * Elimina un archivo específico relacionado con un vehículo.
   * @param vehiculoId - ID del vehículo asociado.
   * @param tipo - Tipo de documento (ej. revisión técnica).
   * @param nombreArchivo - Nombre del archivo a eliminar.
   * @returns Un mensaje de éxito si el archivo es eliminado.
   */
  @Delete('vehiculos/:vehiculoId/documentos/:tipo/:nombreArchivo')
  async deleteFile(
    @Param('vehiculoId') vehiculoId: string,
    @Param('tipo') tipo: string,
    @Param('nombreArchivo') nombreArchivo: string,
  ) {
    await this.uploadService.deleteFile(vehiculoId, tipo, nombreArchivo);
    return {
      message: 'Archivo eliminado correctamente'
    };
  }

  /**
   * Sube un documento adicional relacionado con un vehículo, específicamente en la carpeta "otros".
   * Utiliza un interceptor para manejar el archivo recibido.
   * @param file - Archivo subido.
   * @param id - ID del vehículo.
   * @param nombre - Nombre del archivo.
   * @returns Un mensaje de éxito y la ruta del archivo guardado.
   */
  @Post('vehiculos/:id/documentos/otros/:nombre')
  @UseInterceptors(FileInterceptor('file'))
  async uploadOtroDocumento(
    @UploadedFile() file: Express.Multer.File,
    @Param('id') id: string,
    @Param('nombre') nombre: string,
  ) {
    try {
      const result = await this.uploadService.saveFile(file, id, 'otros'); 
      return {
        message: 'Archivo subido correctamente',
        path: result.path
      };
    } catch (error) {
      // Manejo de errores y retorno de una excepción HTTP 500
      throw new HttpException(
        'Error al subir el archivo',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post('solicitudes/:solicitudId/:itemId')
  @UseInterceptors(FileInterceptor('file'))
  async uploadSolicitudFile(
    @UploadedFile() file: Express.Multer.File,
    @Param('solicitudId') solicitudId: string,
    @Param('itemId') itemId: string
  ) {
    const folder = `solicitudes/${solicitudId}/${itemId}`;
    return await this.uploadService.uploadFile(file, folder);
  }

  @Post('clientes')
  @UseInterceptors(FileInterceptor('file'))
  async uploadClienteLogo(@UploadedFile() file: Express.Multer.File) {
    const folder = 'clientes';
    return await this.uploadService.uploadFile(file, folder);
  }
}
