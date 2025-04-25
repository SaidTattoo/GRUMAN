import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InformeConsumoController } from './informe-consumo.controller';
import { InformeConsumoService } from './informe-consumo.service';
import { InformesConsumo } from '../entities/informes-consumo.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      InformesConsumo
    ])
  ],
  controllers: [InformeConsumoController],
  providers: [InformeConsumoService],
})
export class InformeConsumoModule { }
