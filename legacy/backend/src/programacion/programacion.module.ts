import { Module } from '@nestjs/common';
import { ProgramacionService } from './programacion.service';
import { ProgramacionController } from './programacion.controller';
import { Programacion } from './programacion.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cliente } from '../clientes/clientes.entity';
import { Vehiculo } from '../vehiculos/vehiculos.entity';
import { Locales } from '../locales/locales.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Programacion, Cliente, Vehiculo, Locales])],
  providers: [ProgramacionService],
  controllers: [ProgramacionController]
})
export class ProgramacionModule {}
