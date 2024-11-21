import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { SolicitudesAprobacionCorrectivaService } from './solicitudes-aprobacion-correctiva.service';
import { SolicitudesAprobacionCorrectiva } from './solicitudes-aprobacion-correctiva.entity';

@Controller('solicitudes-aprobacion-correctiva')
export class SolicitudesAprobacionCorrectivaController {

    constructor(private readonly solicitudesAprobacionCorrectivaService: SolicitudesAprobacionCorrectivaService) {}

    @Post()
    createSolicitudAprobacionCorrectiva(@Body() solicitud: SolicitudesAprobacionCorrectiva) {
        return this.solicitudesAprobacionCorrectivaService.createSolicitudAprobacionCorrectiva(solicitud);
    }

    @Get()
    findAllSolicitudesAprobacionCorrectiva() {
        return this.solicitudesAprobacionCorrectivaService.findAllSolicitudesAprobacionCorrectiva();
    }

    @Delete(':id')
    removeSolicitudAprobacionCorrectiva(@Param('id') id: number) {
        return this.solicitudesAprobacionCorrectivaService.removeSolicitudAprobacionCorrectiva(id);
    }
}
