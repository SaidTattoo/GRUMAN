import { Module } from '@nestjs/common';
import { ClientController } from './client.controller';
import { ClientService } from './client.service';
import { Client } from './client.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/users.entity';
import { ActivoFijoLocal } from 'src/activo-fijo-local/activo-fijo-local.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Client, User, ActivoFijoLocal])],
  controllers: [ClientController],
  providers: [ClientService]
})
export class ClientModule {}
