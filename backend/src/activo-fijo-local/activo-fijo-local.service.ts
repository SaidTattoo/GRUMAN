import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ActivoFijoLocal } from './activo-fijo-local.entity';

@Injectable()
export class ActivoFijoLocalService {
    constructor(
        @InjectRepository(ActivoFijoLocal)
        private activoFijoLocalRepository: Repository<ActivoFijoLocal>,
    ) {}

    async createActivoFijoLocal(activoFijoLocal: ActivoFijoLocal): Promise<ActivoFijoLocal> {
        return this.activoFijoLocalRepository.save(activoFijoLocal);
    }

    async getActivoFijoLocalById(id: number): Promise<ActivoFijoLocal> {
        return this.activoFijoLocalRepository.findOne({ where: { id }, relations: ['client', 'locales', 'tipoActivo' ] });
    }

    async updateActivoFijoLocal(id: number, activoFijoLocal: ActivoFijoLocal): Promise<ActivoFijoLocal> {
        await this.activoFijoLocalRepository.update(id, activoFijoLocal);
        return this.activoFijoLocalRepository.findOne({ where: { id } });
    }

    async deleteActivoFijoLocal(id: number): Promise<void> {
        await this.activoFijoLocalRepository.delete(id);
    }

    async getAllActivoFijoLocal(): Promise<ActivoFijoLocal[]> {
        return this.activoFijoLocalRepository.find({ relations: ['client', 'locales', 'tipoActivo' ] });
    }

}
