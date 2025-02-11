import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

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
} 