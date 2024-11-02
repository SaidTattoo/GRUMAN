import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RegionesComunasController } from './regiones-comunas.controller';
import { RegionesComunasService } from './regiones-comunas.service';
import { Region } from './entities/region.entity';
import { Provincia } from './entities/provincia.entity';
import { Comuna } from './entities/comuna.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Region, Provincia, Comuna])],
  controllers: [RegionesComunasController],
  providers: [RegionesComunasService],
  exports: [RegionesComunasService],
})
export class RegionesComunasModule {}
