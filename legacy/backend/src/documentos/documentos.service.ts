import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Documentos } from './documentos.entity';
import { Repository } from 'typeorm';

@Injectable()
export class DocumentosService {
    constructor(
        @InjectRepository(Documentos)
        private documentosRepository: Repository<Documentos>,
    ) {}

    async findAll(): Promise<Documentos[]> {
        return this.documentosRepository.find({ order: { id: 'DESC' }, relations: ['tipoDocumento'] });
    }
    async create(documento: Documentos): Promise<Documentos> {
        //console.log(documento);
        return this.documentosRepository.save(documento);
    }
}
