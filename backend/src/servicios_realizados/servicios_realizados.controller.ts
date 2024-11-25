import { Body, Controller, Get, Post } from '@nestjs/common';
import { ServiciosRealizadosService } from './servicios_realizados.service';
import { ServiciosRealizados } from './servicios_realizados.entity';

@Controller('servicios-realizados')
export class ServiciosRealizadosController {

    constructor(private readonly serviciosRealizadosService: ServiciosRealizadosService) {}

    @Post()
    create(@Body() serviciosRealizados: ServiciosRealizados): Promise<ServiciosRealizados> {
        return this.serviciosRealizadosService.create(serviciosRealizados);
    }

    @Get()
    getAll(): Promise<ServiciosRealizados[]> {
        return this.serviciosRealizadosService.getAll();
    }
}
