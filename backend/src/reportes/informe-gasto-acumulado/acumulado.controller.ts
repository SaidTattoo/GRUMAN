import { Controller, Get, Query } from '@nestjs/common';
import { InformeGastoAcumuladoService } from './acumulado.service';
import { InformeGastoAcumulado } from '../entities/informe-gasto-acumulado.entity';

@Controller('informe-gasto-acumulado')
export class InformeGastoAcumuladoController {
  constructor(
    private readonly informeGastoAcumuladoService: InformeGastoAcumuladoService,
  ) {}  

  @Get()
  async getReportesActivos(
    @Query('clientId') clientId: number,
  ): Promise<{ headerFile: any; servicesFile: any; reactiveRMFile: any; reactiveRegionsFile: any; luminariesFile: any }> {
    const mesFacturacion = new Date().getMonth() + 1;
    const headerFile = await this.informeGastoAcumuladoService.getHeader(
      clientId,
      mesFacturacion,
    );
    const servicesFile = await this.informeGastoAcumuladoService.getServices(
      clientId,
      mesFacturacion,
    );
    const reactiveRMFile = await this.informeGastoAcumuladoService.getReactivosRM(
      clientId,
      mesFacturacion,
    );
    const reactiveRegionsFile = await this.informeGastoAcumuladoService.getReactivosRegion(
      clientId,
      mesFacturacion,
    );
    const luminariesFile = await this.informeGastoAcumuladoService.getLuminaries(
      clientId,
      mesFacturacion,
    );
    return {
      headerFile,
      servicesFile,
      reactiveRMFile,
      reactiveRegionsFile,
      luminariesFile,
    };
  }
}
