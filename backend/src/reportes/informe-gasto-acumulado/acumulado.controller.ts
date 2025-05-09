import { Controller, Get, Query } from '@nestjs/common';
import { InformeGastoAcumuladoService } from './acumulado.service';
import { InformeGastoAcumulado } from '../entities/informe-gasto-acumulado.entity';

@Controller('informe-gasto-acumulado')
export class InformeGastoAcumuladoController {
  constructor(
    private readonly informeGastoAcumuladoService: InformeGastoAcumuladoService,
  ) {}  

  @Get('reporte_gasto_acumulado')
  async getReportesActivos(
    @Query('companyId') companyId: number,
  ): Promise<InformeGastoAcumulado[]> {
    const mesFacturacion = new Date().getMonth() + 1;
    return this.informeGastoAcumuladoService.getHeader(companyId, mesFacturacion);
  }
}
