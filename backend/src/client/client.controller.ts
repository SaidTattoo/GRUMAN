import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { ClientService } from './client.service';
import { Client } from './client.entity';
import { ApiBody, ApiOperation, ApiParam } from '@nestjs/swagger';

@Controller('client')
export class ClientController {
    constructor(private readonly clientService: ClientService) {}
    
    @Get()
    @ApiOperation({ summary: 'Obtener todos los clientes' })
    findAllClients(): Promise<Client[]> {
        return this.clientService.findAllClients();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Obtener un cliente por ID' })
    findOneClient(@Param('id') id: number): Promise<Client | undefined> {
        return this.clientService.findOneClient(id);
    }

    @Post()
    @ApiOperation({ summary: 'Crear un cliente' })
    @ApiParam({ name: 'client', type: Client, description: 'Cliente a crear' })
    @ApiBody({
        description: 'Estructura del cliente a crear',
        examples: {
            ejemplo1: {
                summary: 'Ejemplo de cliente',
                value: {
                    id: 1,
                    nombre: 'Juan Pérez',
                    rut: '12345678-9',
                    razonSocial: 'Empresa S.A.',
                    sobreprecio: 10,
                    valorPorLocal: 100,
                    fechaAlta: new Date(),
                    activo: true,   
                },
            },
        },
    })
    createClient(@Body() client: Client): Promise<Client> {
        return this.clientService.createClient(client);
    }

    @Get('client/:id')
    @ApiOperation({ summary: 'Obtener un cliente con usuarios por ID' })
    @ApiParam({ name: 'id', type: Number, description: 'ID del cliente' })
    findClientWithUsers(@Param('id') id: number): Promise<Client> {
        return this.clientService.findClientWithUsers(id);
    }


    @Put(':id')
    @ApiOperation({ summary: 'Actualizar un cliente' })
    @ApiParam({ name: 'id', type: Number, description: 'ID del cliente' })
    @ApiBody({
        description: 'Estructura del cliente a actualizar',
        examples: {
            ejemplo1: {
                summary: 'Ejemplo de cliente',
                value: {
                    nombre: 'Juan Pérez',
                },
            },
        },
    })
    updateClient(@Param('id') id: number, @Body() client: Client): Promise<Client> {
        return this.clientService.updateClient(id, client);
    }
}
