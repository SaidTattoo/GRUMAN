import { Module } from '@nestjs/common';
import { TipoServicioService } from './tipo-servicio.service';
import { TipoServicioController } from './tipo-servicio.controller';
import { TipoServicio } from './tipo-servicio.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  providers: [TipoServicioService],
  controllers: [TipoServicioController],
  imports: [TypeOrmModule.forFeature([TipoServicio])]
})
export class TipoServicioModule {}
