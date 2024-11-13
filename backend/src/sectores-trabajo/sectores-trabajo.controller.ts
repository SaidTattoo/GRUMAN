import { Body, Controller, Get, Post } from '@nestjs/common';
import { SectoresTrabajoService } from './sectores-trabajo.service';
import { SectorTrabajo } from './sectores-trabajo.entity';

@Controller('sectores-trabajo')
export class SectoresTrabajoController {
    constructor(private readonly sectoresTrabajoService: SectoresTrabajoService) {}

    @Post()
    createSectores(@Body() sectorTrabajo: SectorTrabajo): Promise<SectorTrabajo> {
        return this.sectoresTrabajoService.createSectores(sectorTrabajo);
    }

    @Get()
    findAll(): Promise<SectorTrabajo[]> {
        return this.sectoresTrabajoService.findAll();
    }
}
