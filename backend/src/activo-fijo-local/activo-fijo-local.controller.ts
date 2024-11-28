import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { ActivoFijoLocalService } from './activo-fijo-local.service';
import { ActivoFijoLocal } from './activo-fijo-local.entity';

@Controller('activo-fijo-local')
export class ActivoFijoLocalController {
    constructor(private readonly activoFijoLocalService: ActivoFijoLocalService) {}

    @Post()
    createActivoFijoLocal(@Body() activoFijoLocal: ActivoFijoLocal) {
        return this.activoFijoLocalService.createActivoFijoLocal(activoFijoLocal);
    }

    @Get()
    getAllActivoFijoLocal() {
        return this.activoFijoLocalService.getAllActivoFijoLocal();
    }

    @Get(':id')
    getActivoFijoLocal(@Param('id') id: number) {
        return this.activoFijoLocalService.getActivoFijoLocalById(id);
    }

    @Put(':id')
    updateActivoFijoLocal(@Param('id') id: number, @Body() activoFijoLocal: ActivoFijoLocal) {
        return this.activoFijoLocalService.updateActivoFijoLocal(id, activoFijoLocal);
    }

    @Delete(':id')
    deleteActivoFijoLocal(@Param('id') id: number) {
        return this.activoFijoLocalService.deleteActivoFijoLocal(id);
    }
}
