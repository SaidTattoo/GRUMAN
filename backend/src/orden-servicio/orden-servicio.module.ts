import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdenServicioController } from './orden-servicio.controller';
import { OrdenServicioService } from './orden-servicio.service';
import { OrdenServicio } from './orden-servicio.entity';
import { Client } from '../client/client.entity';
import { Locales } from '../locales/locales.entity';
import { User } from '../users/users.entity';
import { SectorTrabajo } from '../sectores-trabajo/sectores-trabajo.entity';
import { TipoServicio } from '../tipo-servicio/tipo-servicio.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      OrdenServicio,
      Client,
      Locales,
      User,
      SectorTrabajo,
      TipoServicio
    ])
  ],
  controllers: [OrdenServicioController],
  providers: [OrdenServicioService],
  exports: [OrdenServicioService]
})
export class OrdenServicioModule {}
