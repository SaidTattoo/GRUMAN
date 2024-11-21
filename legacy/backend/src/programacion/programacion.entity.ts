
import { Vehiculo } from '../vehiculos/vehiculos.entity';
import { Cliente } from '../clientes/clientes.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Locales } from '../locales/locales.entity';

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
    clienteId: number;

    @ManyToOne(() => Cliente, cliente => cliente.programaciones)
    cliente: Cliente;

    @ManyToOne(() => Vehiculo, vehiculo => vehiculo.programaciones)
    vehiculo: Vehiculo;

    @ManyToOne(() => Locales, local => local.programaciones)
    local: Locales;
}