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
        return this.userRepository.find({ where: { disabled: false }, relations: ['clients'] });
    }

    findAllTecnicos(): Promise<User[]> {
        return this.userRepository.find({ where: { profile: 'tecnico', disabled: false }, relations: ['especialidades'] });
    }

    findOneTecnico(id: number): Promise<User | undefined> {
        return this.userRepository.findOne({ where: { id, disabled: false }, relations: ['clients',  'especialidades'] });
    }

    /** FINDALLUSERS WHERE CLIENTE  */
    findAllUsersByClient(clientId: number): Promise<User[]> {
        return this.userRepository.find({ where: { clients: { id: clientId }, disabled: false }, relations: ['clients'] });
    }

    /** FINDONEUSER */
    async findOneUser(rut: string): Promise<User | undefined> {
        return this.userRepository.findOne({ where: { rut, disabled: false }, relations: ['clients'] });
    }
    async findByEmail(email: string): Promise<User | undefined> {
        return this.userRepository.findOne({ where: { email, disabled: false }, relations: ['clients'] });
    }

    /** CREATEUSER  and asign client */
    /**encode password */
    async createUser(createUserDto: CreateUserDto): Promise<User> {
        console.log(' createUserDto ------------->', createUserDto);
        const { name, lastName, rut, email, password, profile, clientId, especialidades } = createUserDto;
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
          lastName,
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
            const { name, lastName, rut, email, password, profile, clientId, especialidades } = createUserDto;
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
                lastName,
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

    async updateUser(id: number, updateUserDto: any): Promise<User> {
        console.log('=== DEBUG UPDATE USER SERVICE ===');
        console.log('Buscando usuario con ID:', id);
        
        const user = await this.userRepository.findOne({
            where: { id },
            relations: ['clients', 'especialidades']
        });

        if (!user) {
            console.log('Usuario no encontrado');
            throw new NotFoundException('Usuario no encontrado');
        }
        console.log('Usuario encontrado:', JSON.stringify(user, null, 2));

        try {
            // Actualizar los datos básicos del usuario
            const updateData = {
                name: updateUserDto.name,
                lastName: updateUserDto.lastName || updateUserDto.lastName,
                email: updateUserDto.email,
                rut: updateUserDto.rut,
                profile: updateUserDto.perfil || updateUserDto.profile
            };
            console.log('Datos a actualizar:', JSON.stringify(updateData, null, 2));

            // Si hay especialidades, actualizarlas
            if (updateUserDto.especialidades) {
                console.log('Actualizando especialidades:', updateUserDto.especialidades);
                const especialidades = await this.especialidadRepository.findByIds(
                    updateUserDto.especialidades
                );
                user.especialidades = especialidades;
            }

            // Manejar la actualización de clientes
            if (updateUserDto.clientId || updateUserDto.clients) {
                const clientIds = updateUserDto.clientId || updateUserDto.clients;
                console.log('Actualizando clientes:', clientIds);
                
                // Asegurarse de que tenemos un array de IDs
                const ids = Array.isArray(clientIds) ? clientIds : [clientIds];
                
                const clients = await this.clientRepository.findByIds(ids);
                if (clients.length === 0) {
                    throw new NotFoundException('Clientes no encontrados');
                }
                user.clients = clients;
            }

            // Aplicar actualizaciones básicas
            Object.assign(user, updateData);
            
            console.log('Usuario antes de guardar:', JSON.stringify(user, null, 2));
            const savedUser = await this.userRepository.save(user);
            console.log('Usuario guardado:', JSON.stringify(savedUser, null, 2));
            
            return savedUser;
        } catch (error) {
            console.error('Error al actualizar usuario:', error);
            throw error;
        }
    }
    async loginTecnico(rut: string, password: string): Promise<User> {
        const user = await this.userRepository.findOne({ where: { rut } });
        if (!user) {
            throw new NotFoundException('Usuario no encontrado');
        }
        return user;
    }
    async deleteTecnico(id: number): Promise<void> {
        const user = await this.userRepository.findOne({ where: { id } });
        if (!user) {
            throw new NotFoundException('Usuario no encontrado');
        }
        user.disabled = true;
        await this.userRepository.save(user);
    }
}
