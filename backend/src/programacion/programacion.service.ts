import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Programacion } from './programacion.entity';

@Injectable()
export class ProgramacionService {
    constructor(
        @InjectRepository(Programacion)
        private programacionRepository: Repository<Programacion>,
    ) {}

    findAll(): Promise<Programacion[]> {
        return this.programacionRepository.find({
            relations: ['client' , 'vehiculo' , 'local'  ]
        });
    }

    create(programacion: Programacion): Promise<Programacion> {
        console.log(programacion);
        return this.programacionRepository.save(programacion);
    }
}
