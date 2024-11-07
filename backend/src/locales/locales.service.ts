import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Locales } from './locales.entity';

@Injectable()
export class LocalesService {
  constructor(
    @InjectRepository(Locales)
    private readonly localesRepository: Repository<Locales>,
  ) {}

  async findAll(): Promise<Locales[]> {
    return this.localesRepository.find({ 
      where: { deleted: false },
      order: { id: 'DESC' },
      relations: ['cliente']
    });
  }
  
  async findOne(id: number): Promise<Locales | undefined> {
    return this.localesRepository.findOne({ 
      where: { id },
      relations: ['cliente']
    });
  }

  async create(local: Locales): Promise<Locales> {
    return this.localesRepository.save(local);
  }

  async update(id: number, local: Locales): Promise<Locales> {
    await this.localesRepository.update(id, local);
    return this.findOne(id);
  }

  async delete(id: number): Promise<void> {
    await this.localesRepository.update(id, { deleted: true });
  }
  getLocalesByCliente(clienteId: number): Promise<Locales[]> {
    return this.localesRepository.find({ 
      where: { cliente: { id: clienteId }, deleted: false },
      order: { id: 'DESC' },
      relations: ['cliente']
    });
  }
}
