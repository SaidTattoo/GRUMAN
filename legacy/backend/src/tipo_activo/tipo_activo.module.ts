import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TipoActivoController } from './tipo_activo.controller';
import { TipoActivo } from './tipo_activo.entity';
import { TipoActivoService } from './tipo_activo.service';

@Module({
  imports: [TypeOrmModule.forFeature([TipoActivo])],
  controllers: [TipoActivoController],
  providers: [TipoActivoService],
})
export class TipoActivoModule {}
