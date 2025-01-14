import { Body, Controller, Get, HttpException, HttpStatus, Param, Post, UploadedFile, UseInterceptors, Patch } from '@nestjs/common';
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
        return documento;
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
}
