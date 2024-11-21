import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RepuestosController } from './repuestos.controller';
import { Repuesto } from './repuestos.entity';
import { RepuestosService } from './repuestos.service';

@Module({
  imports: [TypeOrmModule.forFeature([Repuesto])],
  controllers: [RepuestosController],
  providers: [RepuestosService],
})
export class RepuestosModule {}
