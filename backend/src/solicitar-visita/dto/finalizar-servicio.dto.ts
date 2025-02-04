export class FinalizarServicioDto {
  firma_cliente: string;
  repuestos: {
    [key: string]: {
      id: number;
      cantidad: number;
      comentario: string;
      estado: string;
      fotos?: string[];  // Array opcional de URLs o base64 de las fotos
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