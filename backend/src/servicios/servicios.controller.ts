import { Body, Controller, Get, Post } from '@nestjs/common';
import { ServiciosService } from './servicios.service';
import { Servicios } from './servicios.entity';

@Controller('servicios')
export class ServiciosController {
    constructor(private readonly serviciosService: ServiciosService) {}

    @Get()
    findAll(): Promise<Servicios[]> {
        return this.serviciosService.findAll();
    }

    @Post()
    create(@Body() servicios: Servicios): Promise<Servicios> {
        return this.serviciosService.create(servicios);
    }
}
