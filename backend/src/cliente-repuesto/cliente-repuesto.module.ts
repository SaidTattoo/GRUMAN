import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClienteRepuesto } from './cliente-repuesto.entity';
import { ClienteRepuestoHistorial } from './cliente-repuesto-historial.entity';
import { ClienteRepuestoController } from './cliente-repuesto.controller';
import { ClienteRepuestoService } from './cliente-repuesto.service';
import { ClientModule } from '../client/client.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([ClienteRepuesto, ClienteRepuestoHistorial]),
        ClientModule
    ],
    controllers: [ClienteRepuestoController],
    providers: [ClienteRepuestoService],
    exports: [ClienteRepuestoService]
})
export class ClienteRepuestoModule {} 