import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Region } from './entities/region.entity';
import { Provincia } from './entities/provincia.entity';
import { Comuna } from './entities/comuna.entity';

@Injectable()
export class RegionesComunasService {
  constructor(
    @InjectRepository(Region)
    private regionRepository: Repository<Region>,
    @InjectRepository(Provincia)
    private provinciaRepository: Repository<Provincia>,
    @InjectRepository(Comuna)
    private comunaRepository: Repository<Comuna>,
  ) {}

  async getRegiones() {
    return this.regionRepository.find({
      order: {
        region_id: 'ASC',
      },
    });
  }

  async getProvinciasByRegion(regionId: number) {
    return this.provinciaRepository.find({
      where: {
        region_id: regionId,
      },
      order: {
        provincia_nombre: 'ASC',
      },
    });
  }

  async getComunasByProvincia(provinciaId: number) {
    return this.comunaRepository.find({
      where: {
        provincia_id: provinciaId,
      },
      order: {
        comuna_nombre: 'ASC',
      },
    });
  }
}
