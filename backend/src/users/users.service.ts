import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

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
