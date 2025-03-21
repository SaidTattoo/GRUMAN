import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChecklistClima } from './checklist_clima.entity';
import { SolicitarVisita } from '../solicitar-visita/solicitar-visita.entity';
import { ActivoFijoLocal } from '../activo-fijo-local/activo-fijo-local.entity';

@Injectable()
export class ChecklistClimaService {
  constructor(
    @InjectRepository(ChecklistClima)
    private checklistClimaRepository: Repository<ChecklistClima>,
    @InjectRepository(SolicitarVisita)
    private solicitudRepository: Repository<SolicitarVisita>,
    @InjectRepository(ActivoFijoLocal)
    private activoFijoRepository: Repository<ActivoFijoLocal>
  ) {}

  async create(createChecklistDto: any): Promise<ChecklistClima> {
    // Verificar que la solicitud existe
    const solicitud = await this.solicitudRepository.findOne({
      where: { id: createChecklistDto.solicitudId }
    });
    if (!solicitud) {
      throw new NotFoundException(`Solicitud with ID ${createChecklistDto.solicitudId} not found`);
    }

    // Verificar que el activo fijo existe
    const activoFijo = await this.activoFijoRepository.findOne({
      where: { id: createChecklistDto.activoFijoId }
    });
    if (!activoFijo) {
      throw new NotFoundException(`Activo Fijo with ID ${createChecklistDto.activoFijoId} not found`);
    }

    // Verificar si ya existe un checklist para este activo fijo en esta solicitud
    const existingChecklist = await this.checklistClimaRepository.findOne({
      where: {
        solicitudId: createChecklistDto.solicitudId,
        activoFijoId: createChecklistDto.activoFijoId
      }
    });

    if (existingChecklist) {
      throw new BadRequestException('Ya existe un checklist para este activo fijo en esta solicitud');
    }

    const checklist = this.checklistClimaRepository.create(createChecklistDto);
    const saved = await this.checklistClimaRepository.save(checklist);
    return Array.isArray(saved) ? saved[0] : saved;
  }

  async findAll(): Promise<ChecklistClima[]> {
    return await this.checklistClimaRepository.find({
      relations: ['solicitud', 'activoFijo']
    });
  }

  async findOne(id: number): Promise<ChecklistClima> {
    const checklist = await this.checklistClimaRepository.findOne({
      where: { id },
      relations: ['solicitud', 'activoFijo']
    });

    if (!checklist) {
      throw new NotFoundException(`Checklist with ID ${id} not found`);
    }

    return checklist;
  }

  async findBySolicitud(solicitudId: number): Promise<ChecklistClima[]> {
    return await this.checklistClimaRepository.find({
      where: { solicitudId },
      relations: ['solicitud', 'activoFijo']
    });
  }

  async update(id: number, updateChecklistDto: any): Promise<ChecklistClima> {
    const checklist = await this.findOne(id);
    
    // Merge existing checklist with update data
    const updated = Object.assign(checklist, updateChecklistDto);
    return await this.checklistClimaRepository.save(updated);
  }

  async remove(id: number): Promise<void> {
    const checklist = await this.findOne(id);
    await this.checklistClimaRepository.remove(checklist);
  }
} 