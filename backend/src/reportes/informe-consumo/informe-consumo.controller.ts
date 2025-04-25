import { Controller, Get, Query } from '@nestjs/common';
import { InformeConsumoService } from './informe-consumo.service';
import { InformesConsumo } from '../entities/informes-consumo.entity';

@Controller('informe-consumo')
export class InformeConsumoController {
  constructor(private readonly informeConsumoService: InformeConsumoService) {}

  @Get()
  async getInformeConsumo(
    @Query('fechaInicio') fechaInicio?: string,
    @Query('fechaFin') fechaFin?: string,
    @Query('clienteId') clienteId?: number,
  ): Promise<InformesConsumo[]> {
    return this.informeConsumoService.getInformeConsumo(
      fechaInicio,
      fechaFin,
      clienteId
    );
  }
}
