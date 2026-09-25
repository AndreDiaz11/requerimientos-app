import { API_BASE } from '../lib/config';
import type { Pedido } from '../lib/tipos';
import { useSesionStore } from '../store/sesionStore';

export class ErrorSesion extends Error {
  constructor() {
    super('La sesión terminó. Ingresa de nuevo.');
  }
}

async function pedirJson<T>(ruta: string): Promise<T> {
  const token = useSesionStore.getState().token;
  const res = await fetch(`${API_BASE}${ruta}`, {
    headers: {
      accept: 'application/json',
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
  });
  if (res.status === 401) {
    // Sesión vencida o revocada: se vuelve a la pantalla de ingreso.
    await useSesionStore.getState().cerrar();
    throw new ErrorSesion();
  }
  if (!res.ok) {
    throw new Error(`El servidor respondió ${res.status}`);
  }
  return (await res.json()) as T;
}

export async function listarPedidos(): Promise<Pedido[]> {
  const data = await pedirJson<{ pedidos: Pedido[] }>('/api/pedidos');
  return data.pedidos ?? [];
}

export async function obtenerPedido(id: number): Promise<Pedido> {
  const data = await pedirJson<{ pedido: Pedido }>(`/api/pedidos/${id}`);
  return data.pedido;
}

export function urlAdjunto(key: string): string {
  return `${API_BASE}/api/adjuntos/${key}`;
}
