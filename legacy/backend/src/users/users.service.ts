import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import * as bcrypt from 'bcrypt';
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findByEmail(email: string): Promise<User | undefined> {
    return this.userRepository.findOne({
      where: { email },
      relations: ['companies'], // Carga las compañías asociadas
    });
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
    const tecnicoRut = await this.userRepository.findOneBy({ rut });
    if (tecnicoRut) {
      throw new Error('El rut ya existe');
    }

    tecnico.rut = rut;
    tecnico.email = email;
    tecnico.name = name;
    tecnico.lastname = lastname;
    tecnico.password = await bcrypt.hash(password, 10);
    return this.userRepository.save(tecnico);
  }

  
  //filtrar por empresa opcional
  async getUsers(company?: string): Promise<User[]> {
    const query = this.userRepository.createQueryBuilder('user');
    if (company) {
      query.where('user.company = :company', { company });
    }
    return query.getMany();
  }
  async updateUser(user: User): Promise<User> {
    return this.userRepository.save(user);
  }
  async deleteUser(id: number): Promise<void> {
    await this.userRepository.delete(id);
  }
}
