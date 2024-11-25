/* 
{
    "tipoServicio": 1,
    "tipoSolicitud": 5,
    "diaSeleccionadoInicio": "2024-11-26T03:00:00.000Z",
    "diaSeleccionadoTermino": "2024-11-27T03:00:00.000Z",
    "mesFacturacion": 11,
    "tipoBusqueda": "rangoFechas"
} */

import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";


@Entity('servicios_realizados')
export class ServiciosRealizados {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'int' })
    tipoServicio: number;

    @Column({ type: 'int' })
    tipoSolicitud: number;

    @Column({ type: 'date' })
    diaSeleccionadoInicio: Date;

    @Column({ type: 'date' })
    diaSeleccionadoTermino: Date;

    @Column({ type: 'int' })
    mesFacturacion: number;

    @Column({ type: 'varchar', length: 255 })
    tipoBusqueda: string;
}