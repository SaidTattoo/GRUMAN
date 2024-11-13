import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { SectorTrabajoDefault } from './sectores-trabajo-default.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class SectoresTrabajoDefaultService {
    constructor(
        @InjectRepository(SectorTrabajoDefault)
        private readonly sectorTrabajoDefaultRepository: Repository<SectorTrabajoDefault>,
    ) {}
    async findAll(): Promise<SectorTrabajoDefault[]> {
        return this.sectorTrabajoDefaultRepository.find({ 
            where: { deleted: false },
            order: { id: 'DESC' },
         
        });
    }

    async createSectores(sectorTrabajo: SectorTrabajoDefault): Promise<SectorTrabajoDefault> {
        return this.sectorTrabajoDefaultRepository.save(sectorTrabajo);
    }
    
}
