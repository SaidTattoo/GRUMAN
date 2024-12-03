import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, UpdateResult } from 'typeorm';
import { Programacion } from './programacion.entity';

@Injectable()
export class ProgramacionService {
    constructor(
        @InjectRepository(Programacion)
        private programacionRepository: Repository<Programacion>,
    ) {}

    findAll(): Promise<Programacion[]> {
        return this.programacionRepository.find({
            where: {
                deleted: false
            },
            relations: ['client' , 'vehiculo' , 'local'  ]
        });
    }

    findById(id: number): Promise<Programacion> {
        return this.programacionRepository.findOne({
            where: { id, deleted: false },
            relations: ['client' , 'vehiculo' , 'local'  ]
        });
    }

    create(programacion: Programacion): Promise<Programacion> {
        //console.log(programacion);
        return this.programacionRepository.save(programacion);
    }
    //al eliminar un registro, se actualiza el campo deleted a true
    delete(id: number): Promise<UpdateResult> {
        return this.programacionRepository.update(id, { deleted: true });
    }
    update(id: number, programacion: Programacion): Promise<UpdateResult> {
        return this.programacionRepository.update(id, programacion);
    }
}
