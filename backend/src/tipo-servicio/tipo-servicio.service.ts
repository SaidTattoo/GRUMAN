import { Injectable } from '@nestjs/common';
import { TipoServicio } from './tipo-servicio.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class TipoServicioService {
    constructor(
        @InjectRepository(TipoServicio)
        private readonly tipoServicioRepository: Repository<TipoServicio>,
      ) {}

      async findAll(): Promise<TipoServicio[]> {
        return this.tipoServicioRepository.find({
          order: {
            id: 'DESC',
          },
        });
      }

      async createTipoServicio(tipoServicio: TipoServicio): Promise<TipoServicio> {
        return this.tipoServicioRepository.save(tipoServicio);
      }
}