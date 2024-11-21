import { Body, Controller, Get, Post } from '@nestjs/common';
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
}
