import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChecklistClima } from './checklist_clima.entity';
import { ChecklistClimaService } from './checklist_clima.service';
import { ChecklistClimaController } from './checklist_clima.controller';
import { SolicitarVisita } from '../solicitar-visita/solicitar-visita.entity';
import { ActivoFijoLocal } from '../activo-fijo-local/activo-fijo-local.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ChecklistClima,
      SolicitarVisita,
      ActivoFijoLocal
    ])
  ],
  controllers: [ChecklistClimaController],
  providers: [ChecklistClimaService],
  exports: [ChecklistClimaService]
})
export class ChecklistClimaModule {}
