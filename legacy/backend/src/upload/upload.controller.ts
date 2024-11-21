import { Controller, Post, UseInterceptors, UploadedFile, Param, Get, Res, Delete, HttpException, HttpStatus, NotFoundException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { join } from 'path';
import { UploadService } from './upload.service';

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('vehiculos/:vehiculoId/documentos/:tipo')
   @UseInterceptors(FileInterceptor('file'))
   async uploadFile(
     @UploadedFile() file: Express.Multer.File,
     @Param('vehiculoId') vehiculoId: string,
     @Param('tipo') tipo: string,
   ) {
     try {
       const result = await this.uploadService.saveFile(file, vehiculoId, tipo);
       return {
         message: 'Archivo subido correctamente',
         path: result.path
       };
     } catch (error) {
       throw new HttpException(
         'Error al subir el archivo',
         HttpStatus.INTERNAL_SERVER_ERROR
       );
     }
   }

  @Get('vehiculos/:vehiculoId/documentos/:tipo')
  async downloadFile(
    @Param('vehiculoId') vehiculoId: string,
    @Param('tipo') tipo: string,
    @Res() res: Response
  ) {
    try {
      const file = await this.uploadService.downloadFile(vehiculoId, tipo);
      res.set({
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${file.filename}"`,
      });
      res.send(file.buffer);
    } catch (error) {
      throw new NotFoundException('Archivo no encontrado');
    }
  }

  @Get('vehiculos/:vehiculoId/documentos')
  async getDocumentacionVehiculo(
    @Param('vehiculoId') vehiculoId: string,
  ) {
    return this.uploadService.getDocumentacionVehiculo(vehiculoId);
  }

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
       throw new HttpException(
         'Error al subir el archivo',
         HttpStatus.INTERNAL_SERVER_ERROR
       );
     }
   }
} 