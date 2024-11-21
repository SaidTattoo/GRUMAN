import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientesController } from './clientes.controller';
import { Cliente } from './clientes.entity';
import { ClientesService } from './clientes.service';
import { Programacion } from '../programacion/programacion.entity';
import { Locales } from '../locales/locales.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Cliente, Programacion, Locales])],
  providers: [ClientesService],
  controllers: [ClientesController],
})
export class ClientesModule {}
