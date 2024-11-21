import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cliente } from './clientes.entity';

@Injectable()
export class ClientesService {
  constructor(
    @InjectRepository(Cliente)
    private readonly clienteRepository: Repository<Cliente>,
  ) {}

  async findAll(): Promise<Cliente[]> {
    return this.clienteRepository.findBy({ activo: true });
  }
  async findOne(id: number): Promise<Cliente | null> {
    return this.clienteRepository.findOne({ where: { id } });
  }
  async create(cliente: Cliente): Promise<Cliente> {
    return this.clienteRepository.save(cliente);
  }
  async update(id: number, cliente: Cliente): Promise<Cliente | null> {
    const clienteToUpdate = await this.clienteRepository.findOne({
      where: { id },
    });
    if (!clienteToUpdate) {
      return null;
    }
    return this.clienteRepository.save({ ...clienteToUpdate, ...cliente });
  }
  async delete(id: number): Promise<void> {
    await this.clienteRepository.update(id, { activo: false });
  }
}
