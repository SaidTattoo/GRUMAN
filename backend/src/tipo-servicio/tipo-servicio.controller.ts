import { Body, Controller, Get, Post } from '@nestjs/common';
import { TipoServicioService } from './tipo-servicio.service';
import { TipoServicio } from './tipo-servicio.entity';

@Controller('tipo-servicio')
export class TipoServicioController {
    constructor(private readonly tipoServicioService: TipoServicioService) {}

    @Get()
    findAll(): Promise<TipoServicio[]> {
        return this.tipoServicioService.findAll();
    }

    @Post()
    createTipoServicio(@Body() tipoServicio: TipoServicio): Promise<TipoServicio> {
        return this.tipoServicioService.createTipoServicio(tipoServicio);
    }
}
