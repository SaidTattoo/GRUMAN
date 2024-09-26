import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { Repository } from 'typeorm';
import { Tecnico } from './tecnico.entity';
@Injectable()
export class TecnicosService {
  constructor(
    @InjectRepository(Tecnico)
    private readonly tecnicoRepository: Repository<Tecnico>,
  ) {}

  async findAll(): Promise<Tecnico[]> {
    return this.tecnicoRepository.find({ order: { id: 'DESC' } });
  }

  async findOne(id: number): Promise<Tecnico | null> {
    return this.tecnicoRepository.findOneBy({ id });
  }

  async create({
    password,
    rut,
    email,
    name,
    lastname,
  }: Tecnico): Promise<Tecnico> {
    const tecnico = new Tecnico();
    /* buscar si existe ya un tecnico con el rut */
    const tecnicoRut = await this.tecnicoRepository.findOneBy({ rut });
    if (tecnicoRut) {
      throw new Error('El rut ya existe');
    }

    tecnico.rut = rut;
    tecnico.email = email;
    tecnico.name = name;
    tecnico.lastname = lastname;
    tecnico.password = await bcrypt.hash(password, 10);
    return this.tecnicoRepository.save(tecnico);
  }

  async update(id: number, tecnico: Tecnico): Promise<Tecnico | null> {
    await this.tecnicoRepository.update(id, tecnico);
    return this.tecnicoRepository.findOneBy({ id });
  }

  async delete(id: number): Promise<void> {
    await this.tecnicoRepository.delete(id);
  }
}
