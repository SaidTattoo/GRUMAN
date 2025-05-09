import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportesController } from './reportes.controller';
import { ReportesService } from './reportes.service';
import { ReportesActivos } from './entities/reportes-activos.entity';
import { ActivoFijoLocal } from '../activo-fijo-local/activo-fijo-local.entity';
import { InformeConsumoController } from './informe-consumo/informe-consumo.controller';
import { InformeConsumoService } from './informe-consumo/informe-consumo.service';
import { InformesConsumo } from './entities/informes-consumo.entity';
import { InformeMesFacturacionModule } from './informe-mes-facturacion/informe-mes-facturacion.module';
import { InformeGastoAcumuladoModule } from './informe-gasto-acumulado/acumulado.module';
import { InformeGastoAcumulado } from './entities/informe-gasto-acumulado.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ReportesActivos,
      ActivoFijoLocal,
      InformesConsumo,
      InformeGastoAcumulado,
    ]),
    InformeMesFacturacionModule,
    InformeGastoAcumuladoModule,
  ],
  controllers: [ReportesController, InformeConsumoController],
  providers: [ReportesService, InformeConsumoService],
})
export class ReportesModule {}
