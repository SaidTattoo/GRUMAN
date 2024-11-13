import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {  Locales } from './locales.entity';
import { SectorTrabajo } from '../sectores-trabajo/sectores-trabajo.entity';
import { SectorTrabajoDefault } from '../sectores-trabajo-default/sectores-trabajo-default.entity';

@Injectable()
export class LocalesService {
  constructor(
    @InjectRepository(Locales)
    private readonly localesRepository: Repository<Locales>,
    @InjectRepository(SectorTrabajo)
    private readonly sectorTrabajoRepository: Repository<SectorTrabajo>,
    @InjectRepository(SectorTrabajoDefault)
    private readonly sectorTrabajoDefaultRepository: Repository<SectorTrabajoDefault>,
  ) {}

  async findAll(): Promise<Locales[]> {
    return this.localesRepository.find({ 
      where: { deleted: false },
      order: { id: 'DESC' },
      relations: ['cliente', 'sectoresTrabajo','comuna', 'comuna.provincia', 'comuna.provincia.region']
    });
  }
  
  async findOne(id: number): Promise<Locales | undefined> {
    return this.localesRepository.findOne({ 
      where: { id },
      relations: ['cliente', 'sectoresTrabajo']
    });
  }
  
  async create(local: Locales): Promise<Locales> {
    // Crear el local
    const newLocal = this.localesRepository.create(local);
    const savedLocal = await this.localesRepository.save(newLocal);

    // Buscar sectores de trabajo por defecto
    const sectoresPorDefecto = await this.sectorTrabajoDefaultRepository.find();

    // Crear nuevos sectores basados en los sectores por defecto
    const sectoresParaGuardar = sectoresPorDefecto.map(defaultSector => {
      const sector = new SectorTrabajo();
      sector.nombre = defaultSector.nombre;
      sector.local = savedLocal;
      return sector;
    });

    // Guardar los nuevos sectores
    await this.sectorTrabajoRepository.save(sectoresParaGuardar);

    // Retornar el local con los sectores asociados
    return this.localesRepository.findOne({
      where: { id: savedLocal.id },
      relations: ['sectoresTrabajo'],
    });
  }

  async addSectorToLocal(localId: number, sectorData: Partial<SectorTrabajo>): Promise<Locales> {
    const local = await this.localesRepository.findOne({ where: { id: localId }, relations: ['sectoresTrabajo'] });
    if (!local) {
      throw new Error('Local no encontrado');
    }

    const newSector = this.sectorTrabajoRepository.create({
      ...sectorData,
      nombre: sectorData.nombre || 'Nombre por defecto',
      local,
    });
    await this.sectorTrabajoRepository.save(newSector);

    local.sectoresTrabajo.push(newSector);
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
      relations: ['cliente', 'sectoresTrabajo']
    });
  }
}
