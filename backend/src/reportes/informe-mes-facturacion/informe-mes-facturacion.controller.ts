import { Controller, Get, Query } from '@nestjs/common';
import { InformeMesFacturacionService } from './informe-mes-facturacion.service';
import { InformesConsumo } from '../entities/informes-consumo.entity';

@Controller('informe-mes-facturacion')
export class InformeMesFacturaionController {
  constructor(private readonly informeMesFacturacionService: InformeMesFacturacionService) {}

  @Get()
  async getReportesMesFacturacion(
    @Query('companyId') companyId: number,
    @Query('mesFacturacion') mesFacturacion: number,
  ): Promise<InformesConsumo[]> {
    return this.informeMesFacturacionService.getReportesMesFacturacion(
      companyId,
      mesFacturacion
    );
  }
}
