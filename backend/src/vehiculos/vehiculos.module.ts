import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VehiculosController } from './vehiculos.controller';
import { Vehiculo } from './vehiculos.entity';
import { VehiculosService } from './vehiculos.service';

@Module({
  imports: [TypeOrmModule.forFeature([Vehiculo])],
  controllers: [VehiculosController],
  providers: [VehiculosService],
})
export class VehiculosModule {}
