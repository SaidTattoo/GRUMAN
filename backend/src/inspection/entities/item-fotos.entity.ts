import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { SolicitarVisita } from 'src/solicitar-visita/solicitar-visita.entity';

@Entity()
export class ItemFotos {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    itemId: number;

    @Column()
    solicitarVisitaId: number;

    @Column('simple-array')
    fotos: string[];

    @CreateDateColumn()
    fechaAgregado: Date;

    @ManyToOne(() => SolicitarVisita, solicitud => solicitud.itemFotos)
    @JoinColumn({ name: 'solicitarVisitaId' })
    solicitarVisita: SolicitarVisita;
} 