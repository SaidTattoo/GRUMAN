import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Facturacion } from './facturacion.entity';
import { FacturacionController } from './facturacion.controller';
import { FacturacionService } from './facturacion.service';
import { Client } from '../client/client.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Facturacion, Client])
  ],
  controllers: [FacturacionController],
  providers: [FacturacionService],
  exports: [FacturacionService]
})
export class FacturacionModule {}
