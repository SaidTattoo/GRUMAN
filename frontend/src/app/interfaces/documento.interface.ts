export interface Documento {
  fecha?: string;
  nombre?: string;
}

export interface Documentacion {
  revision_tecnica?: Documento;
  permiso_circulacion?: Documento;
  seguro_obligatorio?: Documento;
  gases?: Documento;
  otros?: Documento[];  // Array de documentos para "otros"
} 