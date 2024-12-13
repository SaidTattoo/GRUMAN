import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from './users.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Client } from '../client/client.entity';
import { JwtModule } from '@nestjs/jwt';
import { EspecialidadModule } from 'src/especialidad/especialidad.module';
import { Especialidad } from 'src/especialidad/especialidad.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Client,Especialidad]) ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService]
})
export class UsersModule {}
