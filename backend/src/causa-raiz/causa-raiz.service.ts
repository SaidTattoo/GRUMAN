import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CausaRaiz } from './causa-raiz.entity';
import { CreateCausaRaizDto, UpdateCausaRaizDto } from './dto/causa-raiz.dto';

@Injectable()
export class CausaRaizService {
  constructor(
    @InjectRepository(CausaRaiz)
    private causaRaizRepository: Repository<CausaRaiz>,
  ) {}

  // CREATE
  async create(createCausaRaizDto: CreateCausaRaizDto): Promise<CausaRaiz> {
    try {
      // Verificar si ya existe una causa raíz con el mismo nombre
      const existingCausaRaiz = await this.causaRaizRepository.findOne({
        where: { nombre: createCausaRaizDto.nombre }
      });

      if (existingCausaRaiz) {
        throw new ConflictException(`Ya existe una causa raíz con el nombre '${createCausaRaizDto.nombre}'`);
      }

      const causaRaiz = this.causaRaizRepository.create(createCausaRaizDto);
      return await this.causaRaizRepository.save(causaRaiz);
    } catch (error) {
      // Si es un error que ya manejamos, lo relanzamos
      if (error instanceof ConflictException) {
        throw error;
      }
      // Para otros errores, podemos lanzar uno más genérico
      throw new ConflictException('Error al crear la causa raíz');
    }
  }

  // READ ALL
  async findAll(): Promise<CausaRaiz[]> {
    return this.causaRaizRepository.find({
      order: { nombre: 'ASC' },
    });
  }

  // READ ONE
  async findOne(id: number): Promise<CausaRaiz> {
    const causaRaiz = await this.causaRaizRepository.findOne({ where: { id } });
    if (!causaRaiz) {
      throw new NotFoundException(`Causa raíz con ID ${id} no encontrada`);
    }
    return causaRaiz;
  }

  // UPDATE
  async update(id: number, updateCausaRaizDto: UpdateCausaRaizDto): Promise<CausaRaiz> {
    try {
      // Verificar si existe la causa raíz
      const causaRaiz = await this.findOne(id);

      // Verificar si ya existe otra causa raíz con el mismo nombre
      const existingCausaRaiz = await this.causaRaizRepository.findOne({
        where: { nombre: updateCausaRaizDto.nombre }
      });

      if (existingCausaRaiz && existingCausaRaiz.id !== id) {
        throw new ConflictException(`Ya existe otra causa raíz con el nombre '${updateCausaRaizDto.nombre}'`);
      }

      // Actualizar y guardar
      Object.assign(causaRaiz, updateCausaRaizDto);
      return await this.causaRaizRepository.save(causaRaiz);
    } catch (error) {
      // Si es un error que ya manejamos, lo relanzamos
      if (error instanceof NotFoundException || error instanceof ConflictException) {
        throw error;
      }
      // Para otros errores, podemos lanzar uno más genérico
      throw new ConflictException('Error al actualizar la causa raíz');
    }
  }

  // DELETE
  async remove(id: number): Promise<void> {
    const causaRaiz = await this.findOne(id);
    await this.causaRaizRepository.remove(causaRaiz);
  }
} 