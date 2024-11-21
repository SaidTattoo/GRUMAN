import { Module } from '@nestjs/common';
import { RepuestosController } from './repuestos.controller';
import { RepuestosService } from './repuestos.service';
import { Repuesto } from './repuestos.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Repuesto])],
  controllers: [RepuestosController],
  providers: [RepuestosService]
})
export class RepuestosModule {}
