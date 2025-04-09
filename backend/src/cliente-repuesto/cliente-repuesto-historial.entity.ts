import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { ClienteRepuesto } from './cliente-repuesto.entity';

@Entity('cliente_repuesto_historial')
export class ClienteRepuestoHistorial {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => ClienteRepuesto)
    @JoinColumn({ name: 'cliente_repuesto_id' })
    clienteRepuesto: ClienteRepuesto;

    @Column()
    cliente_repuesto_id: number;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    precio_venta_anterior: number;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    precio_venta_nuevo: number;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    precio_compra_anterior: number;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    precio_compra_nuevo: number;

    @CreateDateColumn()
    fecha_cambio: Date;

    @Column({ type: 'varchar', length: 255, nullable: true })
    usuario_modificacion: string;

    @Column({ type: 'text', nullable: true })
    motivo_cambio: string;
} 