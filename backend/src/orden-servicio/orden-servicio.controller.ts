import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { OrdenServicioService } from './orden-servicio.service';
import { EstadoServicio, OrdenServicio } from './orden-servicio.entity';
import { TipoServicio } from 'src/tipo-servicio/tipo-servicio.entity';

@Controller('orden-servicio')
export class OrdenServicioController {


        constructor(private readonly ordenServicioService: OrdenServicioService) {}

        @Get()
        getOrdenesServicio(): Promise<OrdenServicio[]> {
            return this.ordenServicioService.getOrdenesServicio();
        }

        @Get('estado/:estado/:tipoServicio')
        async getOrdenesServicioPorEstado(
            @Param('estado') estado: EstadoServicio,
            @Param('tipoServicio') tipoServicioId: number
        ) {
            return await this.ordenServicioService.getOrdenesServicioPorEstado(estado, tipoServicioId);
        }

        @Get('servicios-del-dia')
        async getServiciosDelDia() {
            console.log('GET /orden-servicio/servicios-del-dia called');
            const result = await this.ordenServicioService.getServiciosDelDia();
            console.log('Returning result:', result);
            return result;
        }

        @Get('preventivas/proximas')
        async getProximasVisitasPreventivas() {
            console.log('GET /orden-servicio/preventivas/proximas called');
            const result = await this.ordenServicioService.getProximasVisitasPreventivas();
            console.log('Returning result:', result);
            return result;
        }

        //aca se puede crear ordenes de servicio pero desde distintas partes del front  y cada parte se le ingresan mas o menos datos 
        @Post('crear-orden')
        async createOrdenServicio(@Body() ordenServicio: OrdenServicio) {
            return await this.ordenServicioService.createOrdenServicio(ordenServicio);
        }

        @Post('solicitud-correctiva')
        async createSolicitudCorrectiva(@Body() data: any) {
            return await this.ordenServicioService.createSolicitudCorrectiva(data);
        }
}
