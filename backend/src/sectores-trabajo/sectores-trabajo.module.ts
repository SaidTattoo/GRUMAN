import { Module } from '@nestjs/common';
import { SectoresTrabajoService } from './sectores-trabajo.service';
import { SectoresTrabajoController } from './sectores-trabajo.controller';
import { SectorTrabajo } from './sectores-trabajo.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Locales } from '../locales/locales.entity';
import { Client } from '../client/client.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SectorTrabajo, Locales, Client])],
  providers: [SectoresTrabajoService],
  controllers: [SectoresTrabajoController]
})
export class SectoresTrabajoModule {}
