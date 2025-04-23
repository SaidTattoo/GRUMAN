import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MesesFacturacionController } from './meses_facturacion.controller';
import { MesesFacturacionService } from './meses_facturacion.service';
import { MesesFacturacion } from './meses_facturacion.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MesesFacturacion])],
  controllers: [MesesFacturacionController],
  providers: [MesesFacturacionService],
  exports: [MesesFacturacionService]
})
export class MesesFacturacionModule {}
