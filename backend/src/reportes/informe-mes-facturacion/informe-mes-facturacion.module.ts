import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { InformeMesFacturacionService } from './informe-mes-facturacion.service';
import { InformesConsumo } from '../entities/informes-consumo.entity';
import { InformeMesFacturaionController } from './informe-mes-facturacion.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      InformesConsumo
    ])
  ],
  controllers: [InformeMesFacturaionController],
  providers: [InformeMesFacturacionService],
})
export class InformeMesFacturacionModule { }
