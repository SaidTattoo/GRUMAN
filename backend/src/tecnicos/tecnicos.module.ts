import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tecnico } from './tecnico.entity';
import { TecnicosController } from './tecnicos.controller';
import { TecnicosService } from './tecnicos.service';

@Module({
  imports: [TypeOrmModule.forFeature([Tecnico])],
  providers: [TecnicosService],
  controllers: [TecnicosController],
  exports: [TecnicosService],
})
export class TecnicosModule {}
