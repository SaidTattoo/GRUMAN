import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Repuesto } from './repuestos.entity';

@Injectable()
export class RepuestosService {
  constructor(
    @InjectRepository(Repuesto)
    private readonly repuestosRepository: Repository<Repuesto>,
  ) {}

  async findAll(): Promise<Repuesto[]> {
    return this.repuestosRepository.find();
  }

  async findOne(id: number): Promise<Repuesto | null> {
    return this.repuestosRepository.findOneBy({ id });
  }
  async create(repuesto: Repuesto): Promise<Repuesto> {
    if (!repuesto.precioNetoCompra || !repuesto.sobreprecio) {
      throw new Error('Los valores de precioNetoCompra y sobreprecio son obligatorios.');
    }
    // Cálculo de los precios relacionados
    repuesto.precioIva = repuesto.precioNetoCompra * 0.19; // Ejemplo: 19% de IVA
    repuesto.precioBruto = repuesto.precioNetoCompra + repuesto.precioIva;
    repuesto.precio = repuesto.precioBruto + repuesto.sobreprecio;


    return this.repuestosRepository.save(repuesto);
  }
  async delete(id: number): Promise<void> {
    await this.repuestosRepository.delete(id);
  }
}
