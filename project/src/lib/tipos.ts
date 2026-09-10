import type { EstadoId } from './constantes';

export interface Pedido {
  id: number;
  fechaPedido: string;
  unidadNegocio: string;
  descripcion: string;
  comentario: string | null;
  tipo: string;
  solicitadoPor: string;
  fechaEntrega: string;
  estado: EstadoId;
  referencia: string | null;
  recursos: string | null;
  carpetaArchivos: string | null;
  enlaceArchivos: string | null;
  adjuntoKey: string | null;
  adjuntoNombre: string | null;
  creadoEn: string;
  actualizadoEn: string;
}

export interface GrupoMes {
  clave: string;
  etiqueta: string;
  pedidos: Pedido[];
}
