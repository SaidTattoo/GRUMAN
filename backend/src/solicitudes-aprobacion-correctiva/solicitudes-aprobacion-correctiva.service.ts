import { Injectable } from '@nestjs/common';
import { SolicitudesAprobacionCorrectiva } from './solicitudes-aprobacion-correctiva.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class SolicitudesAprobacionCorrectivaService {
    
    constructor(
        @InjectRepository(SolicitudesAprobacionCorrectiva)
        private readonly solicitudesAprobacionCorrectivaRepository: Repository<SolicitudesAprobacionCorrectiva>,
      ) {}

      async createSolicitudAprobacionCorrectiva(solicitud: SolicitudesAprobacionCorrectiva): Promise<SolicitudesAprobacionCorrectiva> {
        return this.solicitudesAprobacionCorrectivaRepository.save(solicitud);
      }

      async findAllSolicitudesAprobacionCorrectiva(): Promise<SolicitudesAprobacionCorrectiva[]> {
        return this.solicitudesAprobacionCorrectivaRepository.find({ relations: ['inspectorId'] });
      }

      async removeSolicitudAprobacionCorrectiva(id: number): Promise<void> {
        await this.solicitudesAprobacionCorrectivaRepository.delete(id);
      }

}
