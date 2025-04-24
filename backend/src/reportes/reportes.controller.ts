import { Controller, Get } from '@nestjs/common';
import { ReportesService } from './reportes.service';
import { ReportesActivos } from './entities/reportes-activos.entity';

@Controller('reportes')
export class ReportesController {
  constructor(private readonly reportesService: ReportesService) { }

  @Get('reportes_activo')
  async getReportesActivos(): Promise<ReportesActivos[]> {
    return this.reportesService.getReportesActivos();
  }
}
