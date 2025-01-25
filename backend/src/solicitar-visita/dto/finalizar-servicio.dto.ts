export class FinalizarServicioDto {
  firma_cliente: string;
  repuestos: {
    [key: string]: {
      id: number;
      cantidad: number;
      comentario: string;
      repuesto: {
        id: number;
        familia: string;
        articulo: string;
        marca: string;
        codigoBarra: string;
        precio: number;
        precioNetoCompra: number;
        sobreprecio: number;
        precioIva: number;
        precioBruto: number;
      }
    }[]
  };
} 