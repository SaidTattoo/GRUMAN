import { Module } from '@nestjs/common';
import { RepuestosController } from './repuestos.controller';
import { RepuestosService } from './repuestos.service';
import { Repuesto } from './repuestos.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClienteRepuesto } from '../cliente-repuesto/cliente-repuesto.entity';
import { ClienteRepuestoHistorial } from '../cliente-repuesto/cliente-repuesto-historial.entity';
import { ClienteRepuestoService } from '../cliente-repuesto/cliente-repuesto.service';
import { ClientModule } from '../client/client.module';
import { Client } from '../client/client.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Repuesto, ClienteRepuesto, ClienteRepuestoHistorial, Client]),
    ClientModule
  ],
  controllers: [RepuestosController],
  providers: [RepuestosService, ClienteRepuestoService]
})
export class RepuestosModule {}
