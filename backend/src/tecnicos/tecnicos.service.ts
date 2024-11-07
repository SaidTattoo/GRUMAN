import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { Repository } from 'typeorm';
import { User } from './tecnico.entity';
@Injectable()
export class TecnicosService {
  constructor(
    @InjectRepository(User)
    private readonly tecnicoRepository: Repository<User>,
  ) {}

  async findAll(): Promise<User[]> {
    return this.tecnicoRepository.find({ order: { id: 'DESC' } });
  }

  async findByEmail(email: string): Promise<User | undefined> {
    return this.tecnicoRepository.findOne({
      where: { email },
      relations: ['companies'], // Carga las compañías asociadas
    });
  }


  async findOne(id: number): Promise<User | null> {
    return this.tecnicoRepository.findOneBy({ id });
  }
  async createUser(user: Partial<User>): Promise<User> {
    const newUser = this.tecnicoRepository.create(user);
    return this.tecnicoRepository.save(newUser);
  }
  async create({
    password,
    rut,
    email,
    name,
    lastname,
  }: User): Promise<User> {
    const tecnico = new User();
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

  async update(id: number, tecnico: User): Promise<User | null> {
    await this.tecnicoRepository.update(id, tecnico);
    return this.tecnicoRepository.findOneBy({ id });
  }

  async delete(id: number): Promise<void> {
    await this.tecnicoRepository.delete(id);
  }
  async  updateUser(id: number, user: Partial<User>): Promise<User | null> {
    await this.tecnicoRepository.update(id, user);
    return this.tecnicoRepository.findOneBy({ id });
   }
}
