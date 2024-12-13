import { Injectable } from '@nestjs/common';
import { Especialidad } from './especialidad.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class EspecialidadService {

    constructor(
        @InjectRepository(Especialidad)
        private readonly especialidadRepository: Repository<Especialidad>,
    ) {}

    async findAll(): Promise<Especialidad[]> {
        return this.especialidadRepository.find({ where: { deleted: false } });
    }

    async findOne(id: number): Promise<Especialidad> {
        return this.especialidadRepository.findOne({ where: { id, deleted: false } });
    }

    async create(especialidad: Especialidad): Promise<Especialidad> {
        return this.especialidadRepository.save(especialidad);
    }

    async update(id: number, especialidad: Especialidad): Promise<Especialidad> {
        await this.especialidadRepository.update(id, especialidad);
        return this.especialidadRepository.findOne({ where: { id, deleted: false } });
    }

    async delete(id: number): Promise<void> {
        await this.especialidadRepository.update(id, { deleted: true });
    }
}