import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {  Locales } from './locales.entity';
import { SectorTrabajo } from '../sectores-trabajo/sectores-trabajo.entity';
import { SectorTrabajoDefault } from '../sectores-trabajo-default/sectores-trabajo-default.entity';
import { Client } from '../client/client.entity';

@Injectable()
export class LocalesService {
  constructor(
    @InjectRepository(Locales)
    private readonly localesRepository: Repository<Locales>,
    @InjectRepository(SectorTrabajo)
    private readonly sectorTrabajoRepository: Repository<SectorTrabajo>,
    @InjectRepository(SectorTrabajoDefault)
    private readonly sectorTrabajoDefaultRepository: Repository<SectorTrabajoDefault>,
    @InjectRepository(Client)
    private readonly clienteRepository: Repository<Client>,
  ) {}

  async findAll(): Promise<Locales[]> {
    return this.localesRepository.find({ 
      where: { deleted: false },
      order: { id: 'DESC' },
      relations: ['client', 'sectoresTrabajo','comuna', 'comuna.provincia', 'comuna.provincia.region']
    });
  }
  
  async findOne(id: number): Promise<Locales | undefined> {
    return this.localesRepository.findOne({ 
      where: { id },
      relations: ['client', 'sectoresTrabajo']
    });
  }
  async create(localData: any): Promise<Locales> {
    // Buscar el cliente por ID
    const cliente = await this.clienteRepository.findOne({ where: { id: localData.clientId } });
    if (!cliente) {
      throw new Error('Cliente no encontrado');
    }
  
    // Crear el objeto Locales
    const local = this.localesRepository.create({
      ...localData,
      client: cliente, // Usa 'client' en lugar de 'clientId'
    });
  
    // Guardar el local
    const savedLocal: any = await this.localesRepository.save(local);
  
    // Verificar que el local se haya guardado correctamente
    if (!savedLocal || !savedLocal.id) {
      throw new Error('No se pudo guardar el local o no tiene ID');
    }
  
    // Crear sectores de trabajo por defecto
    const sectoresPorDefecto = await this.sectorTrabajoDefaultRepository.find();
    const sectoresParaGuardar = sectoresPorDefecto.map((defaultSector) => {
      return this.sectorTrabajoRepository.create({
        nombre: defaultSector.nombre,
        local: savedLocal, // Asigna la instancia única de Locales
      });
    });
  
    // Guardar los sectores
    await this.sectorTrabajoRepository.save(sectoresParaGuardar);
  
    // Retornar el local con las relaciones cargadas
    return this.localesRepository.findOne({
      where: { id: savedLocal.id },
      relations: ['sectoresTrabajo', 'client'], // Usa 'client' como nombre de la relación
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
  getLocalesByCliente(clientId: number): Promise<Locales[]> {
    return this.localesRepository.find({
      where: {
        client: { id: clientId }, // Filtra por la propiedad id del cliente
        deleted: false,
      },
      order: { id: 'DESC' },
      relations: ['client', 'sectoresTrabajo'],
    });
  }
}
