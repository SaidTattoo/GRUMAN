import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportesController } from './reportes.controller';
import { ReportesService } from './reportes.service';
import { ReportesActivos } from './entities/reportes-activos.entity';
import { ActivoFijoLocal } from '../activo-fijo-local/activo-fijo-local.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ReportesActivos,
      ActivoFijoLocal
    ])
  ],
  controllers: [ReportesController],
  providers: [ReportesService],
})
export class ReportesModule { }
