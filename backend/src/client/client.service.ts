import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { Client } from './client.entity';
import { TipoServicio } from '../tipo-servicio/tipo-servicio.entity';

@Injectable()
export class ClientService {
    constructor(
        @InjectRepository(Client)
        private clientRepository: Repository<Client>,
        @InjectRepository(TipoServicio)
        private tipoServicioRepository: Repository<TipoServicio>
    ) {}

    /** FINDALLCLIENTS */
    /** mostrar todos los clientes menos uno llamado GRUMAN */
    async findAllClients(): Promise<Client[]> {
        return this.clientRepository.find({ 
            where: { deleted: false, nombre: Not('GRUMAN') },
            relations: ['tipoServicio'],
        });
    }

    /** FINDONECLIENT */
    async findOneClient(id: number): Promise<Client | undefined> {
        return this.clientRepository.findOne({ 
            where: { id, deleted: false },
            relations: ['tipoServicio']
        });
    }

    async findIdClientByName(name: string): Promise<number> {
        console.log(name);
        const client = await this.clientRepository.findOne({ where: { nombre: name } });
        return client ? client.id : null;
    }

    /** CREATECLIENT */
    async createClient(data: any): Promise<Client> {
        const { tipoServicio, ...clienteData } = data;
    
        // Verificar y obtener los servicios desde la base de datos
        const servicios = await this.tipoServicioRepository.findByIds(tipoServicio);
    
        if (servicios.length !== tipoServicio.length) {
            throw new Error('Algunos tipos de servicio no existen en la base de datos');
        }
    
        // Crear una instancia del cliente con los servicios asociados
        const cliente: any = this.clientRepository.create({
            ...clienteData,
            tipoServicio: servicios,
        });
    
        // Guardar en la base de datos
        return this.clientRepository.save(cliente);
    }
    /** UPDATECLIENT */
    async updateClient(id: number, updateClientDto: any) {
        try {
            const client = await this.clientRepository.findOne({ 
                where: { id },
                relations: ['tipoServicio']
            });

            if (!client) {
                throw new NotFoundException(`Cliente con ID ${id} no encontrado`);
            }

            // Actualizar lista de inspección si existe en el DTO
            if (updateClientDto.listaInspeccion) {
                client.listaInspeccion = updateClientDto.listaInspeccion;
            }

            // Actualizar otros campos si existen
            if (updateClientDto.nombre) client.nombre = updateClientDto.nombre;
            if (updateClientDto.rut) client.rut = updateClientDto.rut;
            if (updateClientDto.razonSocial) client.razonSocial = updateClientDto.razonSocial;
            
            // Actualizar tipo de servicio si existe
            if (updateClientDto.tipoServicio) {
                const servicio = await this.tipoServicioRepository.findOne({
                    where: { id: updateClientDto.tipoServicio.id }
                });
                if (servicio) {
                    client.tipoServicio = [servicio];
                }
            }

            // Guardar los cambios
            const savedClient = await this.clientRepository.save(client);
            return savedClient;

        } catch (error) {
            console.error('Error en updateClient:', error);
            throw new BadRequestException('Error al actualizar el cliente: ' + error.message);
        }
    }
    async findClientWithUsers(clientId: number): Promise<Client> {
        return this.clientRepository.findOne({
            where: { id: clientId },
            relations: ['users'], // Asegúrate de que 'users' esté correctamente definido en la entidad Client
        });
    }

        async deleteClient(id: number): Promise<void> {
            await this.clientRepository.update(id, { deleted: true });
    }

    async findClientByName(name: string): Promise<Client> {
        const client = await this.clientRepository.findOne({ 
            where: { nombre: name, deleted: false } 
        });
        
        if (!client) {
            throw new NotFoundException(`Cliente con nombre ${name} no encontrado`);
        }
        
        return client;
    }
}
