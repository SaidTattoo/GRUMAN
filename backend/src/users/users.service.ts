import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { User } from './users.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Client } from 'src/client/client.entity';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { Especialidad } from 'src/especialidad/especialidad.entity';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
        @InjectRepository(Client)
        private clientRepository: Repository<Client>,
        @InjectRepository(Especialidad)
        private especialidadRepository: Repository<Especialidad>,
    ) {}

    /** findAllUsers */
    findAllUsers(): Promise<User[]> {
        return this.userRepository.find({ relations: ['clients'] });
    }

    findAllTecnicos(): Promise<User[]> {
        return this.userRepository.find({ where: { profile: 'tecnico' }, relations: ['especialidades'] });
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
        console.log(' createUserDto ------------->', createUserDto);
        const { name, rut, email, password, profile, clientId, especialidades } = createUserDto;
        //console.log('------------->', createUserDto);
        if (!createUserDto.clientId || !Array.isArray(createUserDto.clientId)) {
            throw new BadRequestException('clientId debe ser un array válido');
          }
        const existingUser = await this.userRepository.findOne({
          where: [{ rut }, { email }],
        });
        if (!Array.isArray(clientId) || clientId.length === 0) {
            throw new Error('clientId debe ser un array no vacío');
        }
        if (existingUser) {
          throw new ConflictException('El rut o el email ya están en uso.');
        }
    
        const hashedPassword = await bcrypt.hash(password, 10);

        // Manejar múltiples clientId
        const clients = await this.clientRepository.findByIds(Array.isArray(clientId) ? clientId : [clientId]);
        console.log('clients ------------->',clients);
        if (clients.length === 0) {
            throw new NotFoundException('Clientes no encontrados');
        }

        // Buscar las especialidades por sus IDs
        const especialidadesEntities = await this.especialidadRepository.findByIds(
            especialidades
        );
        console.log('especialidadesEntities ------------->',especialidadesEntities);
        const user = this.userRepository.create({
          rut,
          name,
          email,
          profile,
          password: hashedPassword,
          clients,
          especialidades: especialidadesEntities
        });
        console.log(' user ------------->', user);
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

    async createUsers(createUsersDto: CreateUserDto[]): Promise<User[]> {
        const users: User[] = [];

        for (const createUserDto of createUsersDto) {
            const { name, rut, email, password, profile, clientId, especialidades } = createUserDto;
            //console.log('------------->',createUserDto);

            const existingUser = await this.userRepository.findOne({
                where: [{ rut }, { email }],
            });
            //console.log('------------->',existingUser);
            if (existingUser) {
                throw new ConflictException(`El rut o el email ya están en uso para el usuario: ${email}`);
            }
            
            const hashedPassword = await bcrypt.hash(password, 10);

            // Manejar múltiples clientId
            const clients = await this.clientRepository.findByIds([clientId]);
            if (clients.length === 0) {
                throw new NotFoundException(`Clientes no encontrados para el usuario: ${email}`);
            }
            console.log('clients ------------->',clients);

            // Buscar las especialidades por sus IDs
            const especialidadesEntities = await this.especialidadRepository.findByIds(
                especialidades
            );
            console.log(' espcialidades ------------->',especialidadesEntities);
            const user = this.userRepository.create({
                rut,
                name,
                email,
                profile,
                password: hashedPassword,
                clients,
                especialidades: especialidadesEntities
            });
            console.log('users ------------->',user);
            const savedUser = await this.userRepository.save(user);
            users.push(savedUser);
        }

        return users;
    }

   
}
