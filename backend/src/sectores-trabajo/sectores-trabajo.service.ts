import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SectorTrabajo } from './sectores-trabajo.entity';
import { Repository } from 'typeorm';

@Injectable()
export class SectoresTrabajoService {

    constructor(
        @InjectRepository(SectorTrabajo)
        private readonly sectorTrabajoRepository: Repository<SectorTrabajo>,
    ) {}

    async findAll(): Promise<SectorTrabajo[]> {
        return this.sectorTrabajoRepository.find({ 
            where: { deleted: false },
            order: { id: 'DESC' },
            relations: ['local']
        });
    }

    async createSectores(sectorTrabajo: SectorTrabajo): Promise<SectorTrabajo> {
        return this.sectorTrabajoRepository.save(sectorTrabajo);
    }
    

    async create(sectorTrabajo: SectorTrabajo): Promise<SectorTrabajo> {
        return this.sectorTrabajoRepository.save(sectorTrabajo);
    }
}
