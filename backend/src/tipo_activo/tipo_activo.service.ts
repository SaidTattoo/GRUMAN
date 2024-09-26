import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TipoActivo } from './tipo_activo.entity';

@Injectable()
export class TipoActivoService {
  constructor(
    @InjectRepository(TipoActivo)
    private readonly tipoActivoRepository: Repository<TipoActivo>,
  ) {}

  async findAll(): Promise<TipoActivo[]> {
    return this.tipoActivoRepository.find({
      order: {
        id: 'DESC',
      },
    });
  }

  async findOne(id: number): Promise<TipoActivo | null> {
    return this.tipoActivoRepository.findOneBy({ id });
  }

  async create(tipoActivo: TipoActivo): Promise<TipoActivo> {
    return this.tipoActivoRepository.save(tipoActivo);
  }

  async update(id: number, tipoActivo: TipoActivo): Promise<TipoActivo | null> {
    await this.tipoActivoRepository.update(id, tipoActivo);
    return this.tipoActivoRepository.findOneBy({ id });
  }

  async delete(id: number): Promise<void> {
    await this.tipoActivoRepository.delete(id);
  }
}
