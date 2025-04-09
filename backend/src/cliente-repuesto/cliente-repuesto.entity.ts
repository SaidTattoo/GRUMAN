import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Client } from '../client/client.entity';
import { Repuesto } from '../repuestos/repuestos.entity';

@Entity('cliente_repuesto')
export class ClienteRepuesto {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    cliente_id: number;

    @Column()
    repuesto_id: number;

    @ManyToOne(() => Client, cliente => cliente.clienteRepuestos)
    @JoinColumn({ name: 'cliente_id' })
    cliente: Client;

    @ManyToOne(() => Repuesto, repuesto => repuesto.clienteRepuestos)
    @JoinColumn({ name: 'repuesto_id' })
    repuesto: Repuesto;

    @Column('decimal', { precision: 10, scale: 2 })
    precio_compra: number;

    @Column('decimal', { precision: 10, scale: 2 })
    precio_venta: number;

    @Column({ type: 'boolean', default: true })
    activo: boolean;

    @CreateDateColumn()
    fecha_creacion: Date;

    @UpdateDateColumn()
    fecha_actualizacion: Date;

    @Column({ type: 'text', nullable: true })
    observaciones: string;
} 