import { Module } from '@nestjs/common';
import { SolicitarVisitaService } from './solicitar-visita.service';
import { SolicitarVisitaController } from './solicitar-visita.controller';
import { SolicitarVisita } from './solicitar-visita.entity';
import { SectorTrabajo } from 'src/sectores-trabajo/sectores-trabajo.entity';
import { Locales } from 'src/locales/locales.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TipoServicio } from 'src/tipo-servicio/tipo-servicio.entity';
import { Client } from 'src/client/client.entity';
import { User } from 'src/users/users.entity';
import { ItemRepuesto } from '../inspection/entities/item-repuesto.entity';
import { Facturacion } from 'src/facturacion/facturacion.entity';
import { FacturacionModule } from 'src/facturacion/facturacion.module';
import { Repuesto } from 'src/repuestos/repuestos.entity';
import { ItemFotos } from 'src/inspection/entities/item-fotos.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SolicitarVisita, 
      Locales, 
      SectorTrabajo, 
      TipoServicio, 
      Client,
      User,
      ItemRepuesto,
      ItemFotos,
      Repuesto,
      Facturacion
    ]),
    FacturacionModule
  ],
  providers: [SolicitarVisitaService],
  controllers: [SolicitarVisitaController]
})
export class SolicitarVisitaModule {}
