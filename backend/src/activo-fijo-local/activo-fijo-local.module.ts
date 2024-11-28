import { Module } from '@nestjs/common';
import { ActivoFijoLocalService } from './activo-fijo-local.service';
import { ActivoFijoLocalController } from './activo-fijo-local.controller';
import { Locales } from 'src/locales/locales.entity';
import { TipoActivo } from 'src/tipo_activo/tipo_activo.entity';
import { Client } from 'src/client/client.entity';
import { ActivoFijoLocal } from './activo-fijo-local.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([ActivoFijoLocal, Client, TipoActivo, Locales])],
  providers: [ActivoFijoLocalService],
  controllers: [ActivoFijoLocalController]
})
export class ActivoFijoLocalModule {}
