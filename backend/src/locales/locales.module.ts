import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Locales } from './locales.entity';
import { LocalesService } from './locales.service';
import { LocalesController } from './locales.controller';
import { Cliente } from '../clientes/clientes.entity';
import { SectorTrabajo } from '../sectores-trabajo/sectores-trabajo.entity';
import { Programacion } from '../programacion/programacion.entity';
import { SectorTrabajoDefault } from '../sectores-trabajo-default/sectores-trabajo-default.entity';
import { Comuna } from '../regiones-comunas/entities/comuna.entity';
import { Provincia } from '../regiones-comunas/entities/provincia.entity';
import { Region } from '../regiones-comunas/entities/region.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Locales, Programacion, SectorTrabajo, Cliente, SectorTrabajoDefault, Comuna, Provincia, Region])],
  controllers: [LocalesController],
  providers: [LocalesService],
  exports: [LocalesService]
})
export class LocalesModule {}
