import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { ProgramacionService } from './programacion.service';
import { Programacion } from './programacion.entity';
import { UpdateResult } from 'typeorm';

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

    @Delete(':id')
    delete(@Param('id') id: number): Promise<UpdateResult> {
        return this.programacionService.delete(id);
    }

    @Get(':id')
    findById(@Param('id') id: number): Promise<Programacion> {
        return this.programacionService.findById(id);
    }

    @Put(':id')
    update(@Param('id') id: number, @Body() programacion: Programacion): Promise<UpdateResult> {
        return this.programacionService.update(id, programacion);
    }
}
