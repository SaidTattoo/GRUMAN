export class DetalleRepuestoDto {
    cantidad: number;
    comentario: string;
    estado: string;
    precio_unitario: number;
    repuesto: {
        id: number;
        nombre?: string;
    };
} 