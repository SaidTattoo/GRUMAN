import { Body, Controller, Get, Post } from '@nestjs/common';
import { DocumentosService } from './documentos.service';
import { Documentos } from './documentos.entity';

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
}
