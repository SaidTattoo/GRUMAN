import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../users/users.entity';
import { Vehiculo } from 'src/vehiculos/vehiculos.entity';


@Entity('user_vehiculo')
export class UserVehiculo {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User, user => user.vehiculoAsignaciones)
    user: User;

    @Column()
    userId: number;

    @ManyToOne(() => Vehiculo, vehiculo => vehiculo.userAsignaciones)
    vehiculo: Vehiculo;

    @Column()
    vehiculoId: number;

    @Column({ type: 'timestamp' })
    fecha_utilizado: Date;

    @Column({ type: 'int', nullable: true })
    odometro_inicio: number;

    @Column({ type: 'int', nullable: true })
    odometro_fin: number;

    @CreateDateColumn({ type: 'timestamp' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamp' })
    updatedAt: Date;

    @Column({ default: true })
    activo: boolean;
} 