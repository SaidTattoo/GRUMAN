import { Controller, Get, Query } from '@nestjs/common';
import { ReportesService } from './reportes.service';
import { ReportesActivos } from './entities/reportes-activos.entity';
import { InformeConsumoService } from './informe-consumo/informe-consumo.service';

@Controller('reportes')
export class ReportesController {
  constructor(private readonly reportesService: ReportesService, private readonly informeConsumoService: InformeConsumoService) { }

  @Get('reportes_activo')
  async getReportesActivos(@Query('companyId') companyId: string): Promise<ReportesActivos[]> {
    return this.reportesService.getReportesActivos(companyId);
  }

}
