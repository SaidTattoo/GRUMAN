import { Injectable, NotFoundException, BadRequestException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { Client } from './client.entity';
import { TipoServicio } from '../tipo-servicio/tipo-servicio.entity';
import { FacturacionService } from '../facturacion/facturacion.service';

@Injectable()
export class ClientService {
    constructor(
        @InjectRepository(Client)
        private clientRepository: Repository<Client>,
        @InjectRepository(TipoServicio)
        private tipoServicioRepository: Repository<TipoServicio>,
        @Inject(forwardRef(() => FacturacionService))
        private facturacionService: FacturacionService
    ) {}


    //que busque sin inportar que sea Uppercase o Lowercase


    /** FINDALLCLIENTS */
    /** mostrar todos los clientes menos uno llamado GRUMAN */
    async findAllClients(): Promise<Client[]> {
        return this.clientRepository.find({ 
            where: { deleted: false, nombre: Not('GRUMAN') },
            relations: ['tipoServicio', 'facturaciones'],
            order: {
                nombre: 'ASC'
            }
        });
    }

    async findAllClientsWithGruman(): Promise<Client[]> {
        return this.clientRepository.find({ 
            where: { deleted: false },
            relations: ['tipoServicio', 'facturaciones'],
        });
    }

    /** FINDONECLIENT */
    async findOneClient(id: number): Promise<Client | undefined> {
        return this.clientRepository.findOne({ 
            where: { id, deleted: false },
            relations: ['tipoServicio', 'facturaciones']
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
    
        const anioActual = new Date().getFullYear();
        const ANIOS_FACTURACION = 2;
        
        // Guardar en la base de datos y generar facturación
        const clienteGuardado = await this.clientRepository.save(cliente);
        await this.facturacionService.generarFacturacionMensual(clienteGuardado, anioActual, ANIOS_FACTURACION);
        
        return clienteGuardado;
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
            if (updateClientDto.sobreprecio) client.sobreprecio = updateClientDto.sobreprecio;
            if (updateClientDto.valorPorLocal) client.valorPorLocal = updateClientDto.valorPorLocal;
            if (updateClientDto.logo) client.logo = updateClientDto.logo;
            
            // Actualizar tipos de servicio si existen
            if (updateClientDto.tipoServicio && Array.isArray(updateClientDto.tipoServicio)) {
                const servicios = await this.tipoServicioRepository.findByIds(updateClientDto.tipoServicio);
                if (servicios.length > 0) {
                    client.tipoServicio = servicios;
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

    /** DELETECLIENT */
    async deleteClient(id: number): Promise<void> {
        const client = await this.clientRepository.findOne({ where: { id } });
        if (!client) {
            throw new NotFoundException(`Cliente con ID ${id} no encontrado`);
        }
        client.deleted = true;
        await this.clientRepository.save(client);
    }

    async findClientWithUsers(id: number): Promise<Client> {
        return this.clientRepository.findOne({
            where: { id },
            relations: ['users', 'tipoServicio']
        });
    }

    async findClientByName(name: string): Promise<Client> {
        return this.clientRepository.findOne({
            where: { nombre: name },
            relations: ['tipoServicio']
        });
    }
}
