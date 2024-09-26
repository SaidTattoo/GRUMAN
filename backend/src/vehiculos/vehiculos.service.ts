import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vehiculo } from './vehiculos.entity';

@Injectable()
export class VehiculosService {
  constructor(
    @InjectRepository(Vehiculo)
    private vehiculosRepository: Repository<Vehiculo>,
  ) {}

  findAll(): Promise<Vehiculo[]> {
    /* order by id desc */
    return this.vehiculosRepository.find({ order: { id: 'DESC' } });
  }

  /* async findOne(id: number): Promise<Vehiculo> {
    const vehiculo = await this.vehiculosRepository.findOne(id);
    if (vehiculo) {
      vehiculo.deserializeDocumentacion();
    }
    return vehiculo;
  } */

  create(vehiculo: Vehiculo): Promise<Vehiculo> {
    return this.vehiculosRepository.save(vehiculo);
  }

  /*   async update(id: number, vehiculo: Vehiculo): Promise<Vehiculo> {
    await this.vehiculosRepository.update(id, vehiculo);
    return this.findOne(id);
  } */

  async remove(id: number): Promise<void> {
    await this.vehiculosRepository.delete(id);
  }
}
