import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { SectorTrabajoDefault } from './sectores-trabajo-default.entity';
import { SectoresTrabajoDefaultService } from './sectores-trabajo-default.service';

@Controller('sectores-trabajo-default')
export class SectoresTrabajoDefaultController {
    constructor(private readonly sectoresTrabajoDefaultService: SectoresTrabajoDefaultService) {}
    @Post()
    createSectores(@Body() sectorTrabajo: SectorTrabajoDefault): Promise<SectorTrabajoDefault> {
        return this.sectoresTrabajoDefaultService.createSectores(sectorTrabajo);
    }

    @Get()
    findAll(): Promise<SectorTrabajoDefault[]> {
        return this.sectoresTrabajoDefaultService.findAll();
    }

    @Put(':id')
    updateSectorDefault(@Param('id') id: number, @Body() sector: SectorTrabajoDefault): Promise<SectorTrabajoDefault> {
        return this.sectoresTrabajoDefaultService.updateSectorDefault(id, sector);
    }

    @Get(':id')
    findOne(@Param('id') id: number): Promise<SectorTrabajoDefault> {
        return this.sectoresTrabajoDefaultService.findOne(id);
    }
}
