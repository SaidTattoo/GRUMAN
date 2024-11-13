import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VehiculosController } from './vehiculos.controller';
import { Vehiculo } from './vehiculos.entity';
import { VehiculosService } from './vehiculos.service';
import { Programacion } from '../programacion/programacion.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Vehiculo, Programacion])],
  controllers: [VehiculosController],
  providers: [VehiculosService],
})
export class VehiculosModule {}
