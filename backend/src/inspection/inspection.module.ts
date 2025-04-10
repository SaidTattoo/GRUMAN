import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InspectionController } from './inspection.controller';
import { InspectionService } from './inspection.service';
import { Section } from './entities/section.entity';
import { Item } from './entities/item.entity';
import { SubItem } from './entities/sub-item.entity';
import { Client } from '../client/client.entity';
import { ItemRepuesto } from './entities/item-repuesto.entity';
import { Repuesto } from '../repuestos/repuestos.entity';
import { ItemFotos } from './entities/item-fotos.entity';
import { ClienteRepuestoModule } from '../cliente-repuesto/cliente-repuesto.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Section,
      Item,
      SubItem,
      Client,
      ItemRepuesto,
      Repuesto,
      ItemFotos
    ]),
    ClienteRepuestoModule
  ],
  controllers: [InspectionController],
  providers: [InspectionService],
  exports: [InspectionService]
})
export class InspectionModule {} 