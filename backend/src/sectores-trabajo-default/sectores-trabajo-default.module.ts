import { Module } from '@nestjs/common';
import { SectoresTrabajoDefaultService } from './sectores-trabajo-default.service';
import { SectoresTrabajoDefaultController } from './sectores-trabajo-default.controller';
import { SectorTrabajoDefault } from './sectores-trabajo-default.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([SectorTrabajoDefault])],
  providers: [SectoresTrabajoDefaultService],
  controllers: [SectoresTrabajoDefaultController]
})
export class SectoresTrabajoDefaultModule {}
