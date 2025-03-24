export interface RepuestoAsociado {
  id: number;
  cantidad: number;
  comentario: string;
  estado: string;
  precio_unitario: number;
  repuesto: {
    id: number;
    nombre: string;
  };
}

export interface ItemRepuestoDataDto {
  id: number;
  estado: string;
  comentario: string;
  fotos: { url: string }[];
  repuestos: RepuestoAsociado[];
}

export class ManipularRepuestosDto {
  firma_cliente: string;
  repuestos: Record<string, ItemRepuestoDataDto>;
  checklistClima: any[];
  activoFijoRepuestos: any[];
}
