import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { SolicitarVisita } from '../solicitar-visita/solicitar-visita.entity';
import { Client } from 'src/client/client.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([SolicitarVisita, Client])
  ],
  controllers: [DashboardController],
  providers: [DashboardService]
})
export class DashboardModule {}
