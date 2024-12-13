import { Injectable, NotFoundException } from '@nestjs/common';
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
        private tipoServicioRepository: Repository<TipoServicio>,
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
        const client = await this.clientRepository.findOne({ where: { nombre: name } });
        return client ? client.id : null;
    }

    /** CREATECLIENT */
    async createClient(data: any): Promise<Client> {
        const { tipoServicio, ...clienteData } = data;
    
        // Verificar y obtener los servicios desde la base de datos
        const servicios = await this.tipoServicioRepository.findByIds(
            tipoServicio.map((ts) => ts.id),
        );
    
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
    async updateClient(id: number, data: any): Promise<Client> {
        const { tipoServicio, ...clienteData } = data;
        
        // Primero obtenemos el cliente existente
        const clienteExistente = await this.clientRepository.findOne({
            where: { id },
            relations: ['tipoServicio']
        });

        if (!clienteExistente) {
            throw new Error('Cliente no encontrado');
        }

        // Obtenemos los nuevos tipos de servicio
        const servicios = await this.tipoServicioRepository.findByIds(tipoServicio);

        // Actualizamos el cliente con los nuevos datos y servicios
        clienteExistente.nombre = clienteData.nombre;
        clienteExistente.rut = clienteData.rut;
        clienteExistente.razonSocial = clienteData.razonSocial;
        clienteExistente.logo = clienteData.logo;
        clienteExistente.sobreprecio = clienteData.sobreprecio;
        clienteExistente.valorPorLocal = clienteData.valorPorLocal;
        clienteExistente.tipoServicio = servicios;

        // Guardamos los cambios
        await this.clientRepository.save(clienteExistente);

        return this.findOneClient(id);
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
