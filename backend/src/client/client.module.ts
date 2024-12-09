import { Module } from '@nestjs/common';
import { ClientController } from './client.controller';
import { ClientService } from './client.service';
import { Client } from './client.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/users.entity';
import { ActivoFijoLocal } from 'src/activo-fijo-local/activo-fijo-local.entity';
import { TipoServicio } from 'src/tipo-servicio/tipo-servicio.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Client, User, ActivoFijoLocal, TipoServicio])],
  controllers: [ClientController],
  providers: [ClientService]
})
export class ClientModule {}
