import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { User } from './users.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { Client } from 'src/client/client.entity';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { Especialidad } from 'src/especialidad/especialidad.entity';
import { MoreThan } from 'typeorm';

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
    //treaer a todos los usuarios menos al ' name = Atlantis_IA'
    async findAllUsers(): Promise<User[]> {
        return this.userRepository.find({ where: { disabled: false , profile: 'user' , name: Not('Atlantis_IA') }, relations: ['clients'] });
    }

    /** findOne - Obtener un usuario por ID */
    async findOne(id: number): Promise<User | undefined> {
        return this.userRepository.findOne({ 
            where: { 
                id, 
                disabled: false,
                name: Not('Atlantis_IA'),
                clients: {
                    deleted: false
                }
            }, 
            relations: ['clients', 'especialidades'] 
        });
    }

    async findAllTecnicos(): Promise<User[]> {
        console.log('Iniciando búsqueda de técnicos');
        try {
            const tecnicos = await this.userRepository.find({ 
                where: { 
                    profile: 'tecnico', 
                    disabled: false ,
                    name: Not('Atlantis_IA')
                }, 
                relations: ['especialidades'] 
            });
            console.log(`Se encontraron ${tecnicos.length} técnicos`);
            return tecnicos;
        } catch (error) {
            console.error('Error al buscar técnicos:', error);
            throw error;
        }
    }

    async findTecnicosByRut(rut: string): Promise<User[]> {
        return this.userRepository.find({ where: { rut, disabled: false , profile: 'tecnico' }});
    }

    async findOneTecnico(id: number): Promise<User | undefined> {
        return this.userRepository.findOne({ where: { id, disabled: false }, relations: ['clients',  'especialidades'] });
    }

    /** FINDALLUSERS WHERE CLIENTE  */
    async findAllUsersByClient(clientId: number): Promise<User[]> {
        return this.userRepository.find({ where: { clients: { id: clientId , deleted:false}, disabled: false }, relations: ['clients'] });
    }

    /** FINDONEUSER */
    async findOneUser(rut: string): Promise<User | undefined> {
        return this.userRepository.findOne({ where: { rut, disabled: false , clients: {
            deleted: false
        }}, relations: ['clients'] });
    }
    async findByEmail(email: string): Promise<User | undefined> {
        return this.userRepository.findOne({ 
            where: { 
                email, 
                disabled: false,
                clients: {
                    deleted: false
                }
            }, 
            relations: ['clients'] 
        });
    }
    async findByRut(rut: string): Promise<User | undefined> {
        return this.userRepository.findOne({ where: { rut, disabled: false }, relations: ['clients', 'especialidades' ,] });
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

    /*CHANGE PASSWORD BY RUT  */
    async changePasswordByRut(rut: string, newPassword: any): Promise<User> {    
        const user = await this.userRepository.findOne({ where: { rut } });
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
        console.log('Datos de actualización recibidos:', updateUserDto);
        
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
            const updateData: any = {
                name: updateUserDto.name,
                lastName: updateUserDto.lastName || updateUserDto.lastName,
                email: updateUserDto.email,
                rut: updateUserDto.rut,
                profile: updateUserDto.perfil || updateUserDto.profile
            };

            // Manejar campos de recuperación de contraseña
            if (updateUserDto.resetPasswordToken !== undefined) {
                updateData.resetPasswordToken = updateUserDto.resetPasswordToken;
            }
            if (updateUserDto.resetPasswordExpires !== undefined) {
                updateData.resetPasswordExpires = updateUserDto.resetPasswordExpires;
            }
            
            // Manejar actualización de contraseña
            if (updateUserDto.password) {
                updateData.password = updateUserDto.password;
            }

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

            // Aplicar actualizaciones
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

    async getTecnicoClientes(id: number) {
        // Primero, busquemos al usuario sin restricciones para debug
        const usuario = await this.userRepository.findOne({
            where: { id: id , name: Not('Atlantis_IA')},
            relations: ['clients']
        });

        if (!usuario) {
            throw new NotFoundException(`No existe ningún usuario con ID ${id}`);
        }

        // Log para debug
        console.log('Usuario encontrado:', {
            id: usuario.id,
            profile: usuario.profile,
            disabled: usuario.disabled,
            clientsCount: usuario.clients?.length || 0
        });

        // Ahora verificamos si es técnico
        if (usuario.profile === 'tecnico') {
            throw new BadRequestException(`El usuario con ID ${id} es un técnico`);
        }

        // Verificamos si está deshabilitado
        if (usuario.disabled) {
            throw new BadRequestException(`El técnico con ID ${id} está deshabilitado`);
        }

        const clientes = usuario.clients || [];
        
        return clientes.map(client => ({
            id: client.id,
            nombre: client.nombre,
            logo: client.logo || '',
            rut: client.rut
        }));
    }

    async findVehiculoByTecnicoId(userId: number): Promise<any> {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const user = await this.userRepository
            .createQueryBuilder('user')
            .leftJoinAndSelect('user.vehiculoAsignaciones', 'asignacion')
            .leftJoinAndSelect('asignacion.vehiculo', 'vehiculo')
            .leftJoinAndSelect('vehiculo.documentos', 'documentos', 'documentos.activo = :activo AND documentos.deleted = :deleted', {
                activo: true,
                deleted: false
            })
            .where('user.id = :userId', { userId })
            .andWhere('user.disabled = :disabled', { disabled: false })
            .andWhere('vehiculo.deleted = :vehiculoDeleted', { vehiculoDeleted: false })
            .orderBy('documentos.fecha', 'DESC') // Ordenar documentos por fecha
            .getOne();

        if (!user) {
            throw new NotFoundException('Técnico no encontrado');
        }

        const todayVehiculo = user.vehiculoAsignaciones
            .find(asig => {
                const asigDate = new Date(asig.fecha_utilizado);
                asigDate.setHours(0, 0, 0, 0);
                
                return asig.activo && 
                       !asig.odometro_fin && 
                       asigDate.getTime() === today.getTime();
            });

        if (!todayVehiculo) {
            return {
                message: 'No hay vehículo asignado para hoy',
                vehiculo: null
            };
        }

        return {
            message: 'Vehículo encontrado',
            vehiculo: {
                id: todayVehiculo.vehiculo.id,
                movil: todayVehiculo.vehiculo.movil,
                patente: todayVehiculo.vehiculo.patente,
                marca: todayVehiculo.vehiculo.marca,
                modelo: todayVehiculo.vehiculo.modelo,
                anio: todayVehiculo.vehiculo.anio,
                activo: todayVehiculo.vehiculo.activo,
                documentos: todayVehiculo.vehiculo.documentos || [], // Asegurar que siempre devuelva un array
                documentacion: todayVehiculo.vehiculo.documentacion,
                odometro_inicio: todayVehiculo.odometro_inicio,
                fecha_utilizado: todayVehiculo.fecha_utilizado
            }
        };
    }

    async findByResetToken(token: string): Promise<User | undefined> {
        console.log('Buscando usuario por token:', token);
        const user = await this.userRepository.findOne({
            where: {
                resetPasswordToken: token,
                disabled: false,
                resetPasswordExpires: MoreThan(new Date())
            }
        });
        console.log('Resultado de la búsqueda:', user ? {
            id: user.id,
            email: user.email,
            resetPasswordExpires: user.resetPasswordExpires,
            disabled: user.disabled
        } : 'No encontrado');
        return user;
    }
}
