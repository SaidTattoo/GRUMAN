import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
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
    solicitarVisita: SolicitarVisita;
} 