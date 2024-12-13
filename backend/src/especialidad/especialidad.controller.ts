import { Controller, Get, Param, Post, Put, Delete, Body } from '@nestjs/common';
import { EspecialidadService } from './especialidad.service';
import { Especialidad } from './especialidad.entity';

@Controller('especialidad')
export class EspecialidadController {
    constructor(private readonly especialidadService: EspecialidadService) {}

    @Get()
    findAll() {
        return this.especialidadService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: number) {
        return this.especialidadService.findOne(id);
    }

    @Post()
    create(@Body() especialidad: Especialidad) {
        return this.especialidadService.create(especialidad);
    }

    @Put(':id')
    update(@Param('id') id: number, @Body() especialidad: Especialidad) {
        return this.especialidadService.update(id, especialidad);
    }

    @Delete(':id')
    delete(@Param('id') id: number) {
        return this.especialidadService.delete(id);
    }
}
