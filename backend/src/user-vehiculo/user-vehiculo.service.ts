import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserVehiculo } from './user-vehiculo.entity';

@Injectable()
export class UserVehiculoService {

    constructor(
        @InjectRepository(UserVehiculo)
        private userVehiculoRepository: Repository<UserVehiculo>,
    ) {}

    async findAll(): Promise<UserVehiculo[]> {
        return this.userVehiculoRepository.find({
            relations: ['user', 'vehiculo'],
            where: { activo: true }
        });
    }

    async findOne(id: number): Promise<UserVehiculo> {
        return this.userVehiculoRepository.findOne({ 
            where: { id },
            relations: ['user', 'vehiculo']
        });
    }

    async findLastActiveByVehiculo(vehiculoId: number): Promise<UserVehiculo> {
        return this.userVehiculoRepository.findOne({
            where: {
                vehiculo: { id: vehiculoId },
                odometro_fin: null,
                activo: true
            },
            relations: ['user', 'vehiculo'],
            order: { fecha_utilizado: 'DESC' }
        });
    }

    async findLastAssignmentByVehiculo(vehiculoId: number): Promise<UserVehiculo> {
        return this.userVehiculoRepository.findOne({
            where: {
                vehiculo: { id: vehiculoId },
                activo: true
            },
            relations: ['user', 'vehiculo'],
            order: { fecha_utilizado: 'DESC' }
        });
    }

    async validateOdometroInicial(vehiculoId: number, odometroInicial: number): Promise<{ isValid: boolean; message?: string; lastOdometro?: number }> {
        const lastAssignment = await this.findLastAssignmentByVehiculo(vehiculoId);
        
        if (lastAssignment && odometroInicial < lastAssignment.odometro_inicio) {
            return {
                isValid: false,
                message: `El odómetro inicial no puede ser menor al último registrado`,
                lastOdometro: lastAssignment.odometro_inicio
            };
        }
        
        return { 
            isValid: true,
            lastOdometro: lastAssignment?.odometro_inicio || 0
        };
    }

    async create(userVehiculo: UserVehiculo): Promise<UserVehiculo> {
        try {
            // Validar el odómetro inicial
            const validation = await this.validateOdometroInicial(userVehiculo.vehiculoId, userVehiculo.odometro_inicio);
            if (!validation.isValid) {
                throw {
                    status: 400,
                    message: validation.message,
                    lastOdometro: validation.lastOdometro
                };
            }

            // Buscar si existe una asignación anterior sin odómetro final
            const lastActive = await this.findLastActiveByVehiculo(userVehiculo.vehiculoId);
            
            if (lastActive) {
                // Si existe, actualizar el odómetro final con el inicial de la nueva asignación
                await this.updateOdometroFin(lastActive.id, userVehiculo.odometro_inicio);
            }
            
            // Crear la nueva asignación
            return this.userVehiculoRepository.save(userVehiculo);
        } catch (error) {
            if (error.status === 400) {
                throw error;
            }
            throw new Error('Error al crear la asignación');
        }
    }

    async update(id: number, userVehiculo: UserVehiculo): Promise<UserVehiculo> {
        await this.userVehiculoRepository.update(id, userVehiculo);
        return this.findOne(id);
    }

    async delete(id: number): Promise<void> {
        await this.userVehiculoRepository.update(id, { activo: false });
    }

    async updateOdometroFin(id: number, odometro_fin: number): Promise<UserVehiculo> {
        await this.userVehiculoRepository.update(id, { odometro_fin });
        return this.findOne(id);
    }

    async getHistorial() {
        return this.userVehiculoRepository.find({
            relations: ['user', 'vehiculo'],
            order: { fecha_utilizado: 'DESC' }
        });
    }
}
