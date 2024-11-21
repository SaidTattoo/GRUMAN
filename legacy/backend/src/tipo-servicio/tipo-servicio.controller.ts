import { Controller, Get } from '@nestjs/common';
import { TipoServicioService } from './tipo-servicio.service';
import { TipoServicio } from './tipo-servicio.entity';

@Controller('tipo-servicio')
export class TipoServicioController {
    constructor(private readonly tipoServicioService: TipoServicioService) {}

    @Get()
    findAll(): Promise<TipoServicio[]> {
        return this.tipoServicioService.findAll();
    }
}
