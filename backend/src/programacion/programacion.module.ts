import { Module } from '@nestjs/common';
import { ProgramacionService } from './programacion.service';
import { ProgramacionController } from './programacion.controller';
import { Programacion } from './programacion.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Programacion])],
  providers: [ProgramacionService],
  controllers: [ProgramacionController]
})
export class ProgramacionModule {}
