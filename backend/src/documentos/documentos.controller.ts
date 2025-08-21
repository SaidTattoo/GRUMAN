import { Body, Controller, Get, HttpException, HttpStatus, Param, Post, UploadedFile, UseInterceptors, Patch, Delete } from '@nestjs/common';
import { DocumentosService } from './documentos.service';
import { Documentos } from './documentos.entity';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('documentos')
export class DocumentosController {
    constructor(private documentosService: DocumentosService) {}

    @Get()
    findAll(): Promise<Documentos[]> {
        return this.documentosService.findAll();
    }
    @Post()
    create(@Body() documento: Documentos): Promise<Documentos> {
        return this.documentosService.create(documento);
    }
    @Post('vehiculos/:vehiculoId/documentos/:tipoDocumento')
    @UseInterceptors(FileInterceptor('file'))
    async subirDocumento(
      @UploadedFile() file: Express.Multer.File,
      @Param('vehiculoId') vehiculoId: string,
      @Param('tipoDocumento') tipoDocumento: string,
    ) {
      try {
        if (!file) {
          throw new HttpException('No se recibió ningún archivo', HttpStatus.BAD_REQUEST);
        }
  
        const documento = await this.documentosService.guardarDocumento(vehiculoId, tipoDocumento, file);
        return {
          message: 'Archivo subido correctamente',
          path: documento.path,
          url: documento.path,
          id: documento.id,
          fecha: documento.fecha,
          fechaVencimiento: documento.fechaVencimiento
        };
      } catch (error) {
        console.error('Error al subir documento:', error);
        throw new HttpException('Error al subir el documento', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }

    // Ruta alternativa para compatibilidad con frontend (ruta /upload/vehiculos/...)
    @Post('upload/vehiculos/:vehiculoId/documentos/:tipo')
    @UseInterceptors(FileInterceptor('file'))
    async subirDocumentoUpload(
      @UploadedFile() file: Express.Multer.File,
      @Param('vehiculoId') vehiculoId: string,
      @Param('tipo') tipo: string,
    ) {
      try {
        if (!file) {
          throw new HttpException('No se recibió ningún archivo', HttpStatus.BAD_REQUEST);
        }
  
        const documento = await this.documentosService.guardarDocumento(vehiculoId, tipo, file);
        return {
          message: 'Archivo subido correctamente',
          path: documento.path,
          url: documento.path,
          id: documento.id,
          fecha: documento.fecha,
          fechaVencimiento: documento.fechaVencimiento
        };
      } catch (error) {
        console.error('Error al subir documento:', error);
        throw new HttpException('Error al subir el documento', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }

    @Patch(':id/fecha-vencimiento')
    async actualizarFechaVencimiento(
      @Param('id') id: number,
      @Body('fechaVencimiento') fechaVencimiento: Date
    ) {
      return this.documentosService.actualizarFechaVencimiento(id, fechaVencimiento);
    }

    @Delete('vehiculos/:vehiculoId/documentos/:tipo')
    async eliminarDocumento(
      @Param('vehiculoId') vehiculoId: string,
      @Param('tipo') tipo: string
    ) {
      try {
        await this.documentosService.eliminarDocumento(vehiculoId, tipo);
        return { message: 'Documento eliminado correctamente' };
      } catch (error) {
        console.error('Error al eliminar documento:', error);
        throw new HttpException('Error al eliminar el documento', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
}
