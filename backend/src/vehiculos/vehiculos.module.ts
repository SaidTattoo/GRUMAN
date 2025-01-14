import { Module } from '@nestjs/common';
import { VehiculosService } from './vehiculos.service';
import { VehiculosController } from './vehiculos.controller';
import { Vehiculo } from './vehiculos.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Documentos } from '../documentos/documentos.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Vehiculo, Documentos])],
    controllers: [VehiculosController],
    providers: [VehiculosService],
})
export class VehiculosModule {}
