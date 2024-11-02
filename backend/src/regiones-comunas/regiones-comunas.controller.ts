import { Controller, Get, Param } from '@nestjs/common';
import { RegionesComunasService } from './regiones-comunas.service';

@Controller('regiones-comunas')
export class RegionesComunasController {
    constructor(private readonly regionesComunasService: RegionesComunasService) {}

    @Get('regiones')
    getRegiones() {
        return this.regionesComunasService.getRegiones();
    }

    @Get('provincias/:regionId')
    getProvinciasByRegion(@Param('regionId') regionId: number) {
        return this.regionesComunasService.getProvinciasByRegion(regionId);
    }

    @Get('comunas/:provinciaId')
    getComunasByProvincia(@Param('provinciaId') provinciaId: number) {
        return this.regionesComunasService.getComunasByProvincia(provinciaId);
    }
}
