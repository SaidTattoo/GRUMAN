import { Module } from '@nestjs/common';
import { ServiciosRealizadosController } from './servicios_realizados.controller';
import { ServiciosRealizadosService } from './servicios_realizados.service';
import { ServiciosRealizados } from './servicios_realizados.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([ServiciosRealizados])],
  controllers: [ServiciosRealizadosController],
  providers: [ServiciosRealizadosService]
})
export class ServiciosRealizadosModule {}
