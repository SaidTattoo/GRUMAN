import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { InformeGastoAcumuladoService } from './acumulado.service';
import { InformeGastoAcumulado } from '../entities/informe-gasto-acumulado.entity';
import { InformeGastoAcumuladoController } from './acumulado.controller';
import { Facturacion } from '../../facturacion/facturacion.entity';

@Module({
  imports: [TypeOrmModule.forFeature([InformeGastoAcumulado, Facturacion])],
  controllers: [InformeGastoAcumuladoController],
  providers: [InformeGastoAcumuladoService],
})
export class InformeGastoAcumuladoModule {}
