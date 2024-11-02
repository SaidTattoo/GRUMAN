import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TipoDocumento } from './tipo-documento.entity';
import { Repository } from 'typeorm';

@Injectable()
export class TipoDocumentoService {

    constructor(
        @InjectRepository(TipoDocumento)
        private tipoDocumentoRepository: Repository<TipoDocumento>,
    ) {}

    async findAll(): Promise<TipoDocumento[]> {
        return this.tipoDocumentoRepository.find({ where: { disabled: false }, relations: ['documentos'] });
    }
    async create(tipoDocumento: TipoDocumento): Promise<TipoDocumento> {
        return this.tipoDocumentoRepository.save(tipoDocumento);
    }
    async delete(id: number): Promise<any> {
        return this.tipoDocumentoRepository.update(id, { disabled: true });
    }
}
