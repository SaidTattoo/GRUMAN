import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActivoFijoRepuestosController } from './activo-fijo-repuestos.controller';
import { ActivoFijoRepuestosService } from './activo-fijo-repuestos.service';
import { ActivoFijoRepuestos } from './entities/activo-fijo-repuestos.entity';
import { DetalleRepuestoActivoFijo } from './entities/detalle-repuesto-activo-fijo.entity';
import { SolicitarVisita } from '../solicitar-visita/solicitar-visita.entity';
import { ChecklistClima } from 'src/checklist_clima/checklist_clima.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            ActivoFijoRepuestos,
            DetalleRepuestoActivoFijo,
            SolicitarVisita,
            ChecklistClima
        ])
    ],
    controllers: [ActivoFijoRepuestosController],
    providers: [ActivoFijoRepuestosService],
    exports: [ActivoFijoRepuestosService]
})
export class ActivoFijoRepuestosModule {} 