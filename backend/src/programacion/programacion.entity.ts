
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('programacion')
export class Programacion {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    local: number;

    @Column()
    sectorTrabajo: number;

    @Column()
    tipoServicio: number;

    @Column()
    fecha: Date;

    @Column()
    observaciones: string;
/* 
    @Column()
    imagen: string; */

    @Column()
    vehiculo: number;

    @Column()
    clienteId: number;
    /*   @Column()
    estado: string; */
}