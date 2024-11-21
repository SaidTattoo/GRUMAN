import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { User } from './users.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Client } from 'src/client/client.entity';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
    ) {}

    /** findAllUsers */
    findAllUsers(): Promise<User[]> {
        return this.userRepository.find({ relations: ['clients'] });
    }
    /** FINDALLUSERS WHERE CLIENTE  */
    findAllUsersByClient(clientId: number): Promise<User[]> {
        return this.userRepository.find({ where: { clients: { id: clientId } }, relations: ['clients'] });
    }

    /** FINDONEUSER */
    async findOneUser(rut: string): Promise<User | undefined> {
        return this.userRepository.findOne({ where: { rut }, relations: ['clients'] });
    }
    async findByEmail(email: string): Promise<User | undefined> {
        return this.userRepository.findOne({ where: { email }, relations: ['clients'] });
    }

    /** CREATEUSER  and asign client */
    /**encode password */
    async createUser(createUserDto: CreateUserDto): Promise<User> {
        const {name,  rut, email, password, profile, clientId } = createUserDto;
    
        const existingUser = await this.userRepository.findOne({
          where: [{ rut }, { email }],
        });
    
        if (existingUser) {
          throw new ConflictException('El rut o el email ya están en uso.');
        }
    
        const hashedPassword = await bcrypt.hash(password, 10);
    
        const user = this.userRepository.create({
          rut,
          name,
          email,
          profile,
          password: hashedPassword,
          clients: [{ id: clientId }],
        });
    
        return this.userRepository.save(user);
      }

    /** CHANGEPASSWORD */
    async changePassword(id: number, newPassword: any): Promise<User> {
        const user = await this.userRepository.findOne({ where: { id } });
        if (!user) {
            throw new NotFoundException('Usuario no encontrado');
        }
        user.password = await bcrypt.hash(newPassword.password, 10);
        return this.userRepository.save(user);
    }

    async getAllUsersByClient(clientId: number): Promise<User[]> {
        return this.userRepository.find({ where: { clients: { id: clientId } }, relations: ['clients'] });
    }
}
