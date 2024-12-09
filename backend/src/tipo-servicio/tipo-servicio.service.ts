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
          where: {
            deleted: false
          },
          order: {
            id: 'DESC',
          },
        });
      }

      async createTipoServicio(tipoServicio: TipoServicio): Promise<TipoServicio> {
        return this.tipoServicioRepository.save(tipoServicio);
      }

      async updateTipoServicio(id: number, tipoServicio: TipoServicio): Promise<TipoServicio> {
        await this.tipoServicioRepository.update(id, tipoServicio);
        return this.tipoServicioRepository.findOne({ where: { id, deleted: false } });
      }

      async findById(id: number): Promise<TipoServicio> {
        return this.tipoServicioRepository.findOne({ where: { id, deleted: false } });
      }

      async deleteTipoServicio(id: number): Promise<TipoServicio> {
        await this.tipoServicioRepository.update(id, { deleted: true });
        return this.tipoServicioRepository.findOne({ where: { id, deleted: true } });
      }
}