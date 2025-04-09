import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClienteRepuesto } from './cliente-repuesto.entity';
import { ClienteRepuestoHistorial } from './cliente-repuesto-historial.entity';
import { CreateClienteRepuestoDto } from './dto/create-cliente-repuesto.dto';
import { UpdateClienteRepuestoDto } from './dto/update-cliente-repuesto.dto';
import { ClientService } from '../client/client.service';

@Injectable()
export class ClienteRepuestoService {
    constructor(
        @InjectRepository(ClienteRepuesto)
        private readonly clienteRepuestoRepository: Repository<ClienteRepuesto>,
        @InjectRepository(ClienteRepuestoHistorial)
        private readonly historialRepository: Repository<ClienteRepuestoHistorial>,
        private readonly clientService: ClientService
    ) {}

    async create(createDto: CreateClienteRepuestoDto): Promise<ClienteRepuesto> {
        const clienteRepuesto = this.clienteRepuestoRepository.create(createDto);
        return await this.clienteRepuestoRepository.save(clienteRepuesto);
    }

    async createMany(dtos: CreateClienteRepuestoDto[]): Promise<ClienteRepuesto[]> {
        const clienteRepuestos = this.clienteRepuestoRepository.create(dtos);
        return await this.clienteRepuestoRepository.save(clienteRepuestos);
    }

    async findAll(): Promise<ClienteRepuesto[]> {
        return await this.clienteRepuestoRepository.find({
            relations: ['cliente', 'repuesto']
        });
    }

    async findByClienteAndRepuesto(clienteId: number, repuestoId: number): Promise<ClienteRepuesto | null> {
        return await this.clienteRepuestoRepository.findOne({
            where: {
                cliente: { id: clienteId },
                repuesto: { id: repuestoId }
            },
            relations: ['cliente', 'repuesto']
        });
    }

    async update(id: number, updateDto: UpdateClienteRepuestoDto): Promise<ClienteRepuesto> {
        // Obtener el registro actual antes de actualizarlo
        const registroActual = await this.clienteRepuestoRepository.findOne({
            where: { id },
            relations: ['cliente', 'repuesto']
        });

        if (!registroActual) {
            throw new Error('Registro no encontrado');
        }

        // Crear registro en el historial
        const historial = this.historialRepository.create({
            cliente_repuesto_id: id,
            precio_venta_anterior: registroActual.precio_venta,
            precio_venta_nuevo: updateDto.precio_venta,
            precio_compra_anterior: registroActual.precio_compra,
            precio_compra_nuevo: updateDto.precio_compra,
            usuario_modificacion: 'sistema'
        });

        // Guardar el historial
        await this.historialRepository.save(historial);

        // Actualizar el registro con solo los campos de precios
        await this.clienteRepuestoRepository.update(id, {
            precio_venta: updateDto.precio_venta,
            precio_compra: updateDto.precio_compra
        });
        
        return this.clienteRepuestoRepository.findOne({
            where: { id },
            relations: ['cliente', 'repuesto']
        });
    }

    async createForNewRepuesto(repuestoId: number, precioBase: number = 0): Promise<void> {
        // Obtener todos los clientes
        const clientes = await this.clientService.findAllClientsWithGruman();
        
        // Crear registros de cliente_repuesto para cada cliente
        const clienteRepuestos = clientes.map(cliente => ({
            cliente_id: cliente.id,
            repuesto_id: repuestoId,
            precio_venta: precioBase,
            precio_compra: precioBase,
            activo: true,
            observaciones: 'Precios iniciales'
        }));

        await this.createMany(clienteRepuestos);
    }

    async delete(id: number): Promise<void> {
        await this.clienteRepuestoRepository.delete(id);
    }

    async findByRepuesto(repuestoId: number): Promise<ClienteRepuesto[]> {
        return await this.clienteRepuestoRepository.find({
            where: { repuesto: { id: repuestoId } },
            relations: ['cliente', 'repuesto']
        });
    }

    async getHistorialByClienteRepuesto(clienteRepuestoId: number): Promise<ClienteRepuestoHistorial[]> {
        return this.historialRepository.find({
            where: { cliente_repuesto_id: clienteRepuestoId },
            order: { fecha_cambio: 'DESC' },
            relations: ['clienteRepuesto']
        });
    }
} 