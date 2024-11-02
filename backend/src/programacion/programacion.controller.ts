import { Body, Controller, Get, Post } from '@nestjs/common';
import { ProgramacionService } from './programacion.service';
import { Programacion } from './programacion.entity';

@Controller('programacion')
export class ProgramacionController {
    constructor(private programacionService: ProgramacionService) {}

    @Get()
    findAll(): Promise<Programacion[]> {
        return this.programacionService.findAll();
    }

    @Post()
    create(@Body() programacion: Programacion): Promise<Programacion> {
        return this.programacionService.create(programacion);
    }
}
