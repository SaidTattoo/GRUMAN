import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Client } from './client.entity';

@Injectable()
export class ClientService {
    constructor(
        @InjectRepository(Client)
        private clientRepository: Repository<Client>,
    ) {}

    /** FINDALLCLIENTS */
    async findAllClients(): Promise<Client[]> {
        return this.clientRepository.find();
    }

    /** FINDONECLIENT */
    async findOneClient(id: number): Promise<Client | undefined> {
        return this.clientRepository.findOne({ where: { id } });
    }

    /** CREATECLIENT */
    async createClient(client: Client): Promise<Client> {
        return this.clientRepository.save(client);
    }

    /** UPDATECLIENT */
    async updateClient(id: number, client: Client): Promise<Client> {
        return this.clientRepository.update(id, client).then(() => {
            return this.clientRepository.findOne({ where: { id } });
        });
    }
    async findClientWithUsers(clientId: number): Promise<Client> {
        return this.clientRepository.findOne({
            where: { id: clientId },
            relations: ['users'], // Asegúrate de que 'users' esté correctamente definido en la entidad Client
        });
    }
    
}
