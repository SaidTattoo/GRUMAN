import { Module } from '@nestjs/common';
import { UserVehiculoController } from './user-vehiculo.controller';
import { UserVehiculoService } from './user-vehiculo.service';
import { UserVehiculo } from './user-vehiculo.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Vehiculo } from 'src/vehiculos/vehiculos.entity';
import { User } from 'src/users/users.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserVehiculo, User, Vehiculo])],
  controllers: [UserVehiculoController],
  providers: [UserVehiculoService]
})
export class UserVehiculoModule {}
