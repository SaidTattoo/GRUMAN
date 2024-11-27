
import { Vehiculo } from '../vehiculos/vehiculos.entity';
import { Column, Entity,  ManyToOne,  PrimaryGeneratedColumn } from 'typeorm';
import { Locales } from '../locales/locales.entity';
import { Client } from 'src/client/client.entity';

@Entity('programacion')
export class Programacion {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    sectorTrabajo: number;

    @Column()
    tipoServicio: number;

    @Column()
    fecha: Date;

    @Column()
    observaciones: string;

    @Column()
    clientId: number; 

    @ManyToOne(() => Client, client => client.programaciones)
    client: Client;

    @ManyToOne(() => Vehiculo, vehiculo => vehiculo.programaciones)
    vehiculo: Vehiculo;

    @ManyToOne(() => Locales, local => local.programaciones)
    local: Locales;

    @Column({ default: false })
    deleted: boolean;
}