import { API_BASE } from '../lib/config';

export async function registrarDispositivo(token: string): Promise<void> {
  const res = await fetch(`${API_BASE}/api/fcm/registrar`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ token, plataforma: 'android' }),
  });
  if (!res.ok && res.status !== 201) {
    throw new Error(`registrar dispositivo: ${res.status}`);
  }
}

export async function darDeBajaDispositivo(token: string): Promise<void> {
  const res = await fetch(`${API_BASE}/api/fcm/baja`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ token }),
  });
  if (!res.ok) {
    throw new Error(`baja dispositivo: ${res.status}`);
  }
}
