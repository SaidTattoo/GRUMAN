import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Sla } from './entity/sla.entity';
import { SlaDto } from './dto/sla.dto';

@Injectable()
export class SlaService {
  constructor(
    @InjectRepository(Sla)
    private slaRepository: Repository<Sla>,
  ) {}

  async create(createSlaDto: SlaDto): Promise<Sla> {
    const sla = this.slaRepository.create(createSlaDto);
    return this.slaRepository.save(sla);
  }

  async findAll(): Promise<Sla[]> {
    return this.slaRepository.find();
  }

  async findOne(id: number): Promise<Sla> {
    return this.slaRepository.findOneBy({ id });
  }

  async remove(id: number): Promise<void> {
    await this.slaRepository.delete(id);
  }

  async update(id: number, updateSlaDto: SlaDto): Promise<Sla> {
    await this.slaRepository.update(id, updateSlaDto);
    return this.findOne(id);
  }
}
