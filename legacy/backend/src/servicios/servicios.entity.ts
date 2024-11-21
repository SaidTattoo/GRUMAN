import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('servicios')
export class Servicios {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length: 255 })
    nombre: string;

    @Column({ type: 'boolean', default: false })
    deleted: boolean;
}