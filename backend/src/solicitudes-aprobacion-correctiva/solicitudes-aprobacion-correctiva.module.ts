import { Module } from '@nestjs/common';
import { SolicitudesAprobacionCorrectivaController } from './solicitudes-aprobacion-correctiva.controller';
import { SolicitudesAprobacionCorrectivaService } from './solicitudes-aprobacion-correctiva.service';
import { SolicitudesAprobacionCorrectiva } from './solicitudes-aprobacion-correctiva.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/users.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SolicitudesAprobacionCorrectiva, User])],
  controllers: [SolicitudesAprobacionCorrectivaController],
  providers: [SolicitudesAprobacionCorrectivaService]
})
export class SolicitudesAprobacionCorrectivaModule {}
