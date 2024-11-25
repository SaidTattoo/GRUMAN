import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ServiciosRealizados } from './servicios_realizados.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ServiciosRealizadosService {
    constructor(
        @InjectRepository(ServiciosRealizados)
        private readonly serviciosRealizadosRepository: Repository<ServiciosRealizados>,
    ) {}

    async create(serviciosRealizados: ServiciosRealizados): Promise<ServiciosRealizados> {
        return this.serviciosRealizadosRepository.save(serviciosRealizados);
    }

    async getAll(): Promise<ServiciosRealizados[]> {
        return this.serviciosRealizadosRepository.find();
    }
}
