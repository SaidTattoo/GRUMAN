import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { TipoDocumentoService } from './tipo-documento.service';
import { TipoDocumento } from './tipo-documento.entity';

@Controller('tipo-documento')
export class TipoDocumentoController {
    constructor(private tipoDocumentoService: TipoDocumentoService) {}

    @Get()
    findAll(): Promise<TipoDocumento[]> {
        return this.tipoDocumentoService.findAll();
    }
    @Post()
    create(@Body() tipoDocumento: TipoDocumento): Promise<TipoDocumento> {
        return this.tipoDocumentoService.create(tipoDocumento);
    }   

    @Delete(':id')
    delete(@Param('id') id: number): Promise<any> {
        return this.tipoDocumentoService.delete(id);
    }
}
