import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Servicios } from './servicios.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ServiciosService {
    constructor(
        @InjectRepository(Servicios)
        private readonly serviciosRepository: Repository<Servicios>,
    ) {}

    async findAll(): Promise<Servicios[]> {
        return this.serviciosRepository.find({ where: { deleted: false } });
    }

    async create(servicios: Servicios): Promise<Servicios> {
        return this.serviciosRepository.save(servicios);
    }   
}
