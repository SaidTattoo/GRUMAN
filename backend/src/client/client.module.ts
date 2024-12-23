import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Client } from './client.entity';
import { ClientController } from './client.controller';
import { ClientService } from './client.service';
import { TipoServicio } from '../tipo-servicio/tipo-servicio.entity';
import { Facturacion } from '../facturacion/facturacion.entity';
import { FacturacionModule } from '../facturacion/facturacion.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Client, TipoServicio, Facturacion]),
    forwardRef(() => FacturacionModule)
  ],
  controllers: [ClientController],
  providers: [ClientService],
  exports: [ClientService]
})
export class ClientModule {}
