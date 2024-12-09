import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
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

    @Put(':id')
    updateTipoServicio(@Param('id') id: number, @Body() tipoServicio: TipoServicio): Promise<TipoServicio> {
        return this.tipoServicioService.updateTipoServicio(id, tipoServicio);
    }

    @Get(':id')
    findById(@Param('id') id: number): Promise<TipoServicio> {
        return this.tipoServicioService.findById(id);
    }

    @Delete(':id')
    deleteTipoServicio(@Param('id') id: number): Promise<TipoServicio> {
        return this.tipoServicioService.deleteTipoServicio(id);
    }
}
