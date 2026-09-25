import { API_BASE } from '../lib/config';
import type { PersonaSesion } from '../store/sesionStore';

async function enviarJson(ruta: string, cuerpo: object, token?: string): Promise<Response> {
  return fetch(`${API_BASE}${ruta}`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      accept: 'application/json',
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(cuerpo),
  });
}

/** Pide el código de 6 dígitos. El servidor responde igual exista o no el correo. */
export async function pedirCodigo(correo: string): Promise<void> {
  const res = await enviarJson('/api/app/codigo', { correo });
  if (res.status === 400) throw new Error('Escribe un correo válido.');
  if (!res.ok) throw new Error('No se pudo enviar el código. Inténtalo de nuevo.');
}

export async function verificarCodigo(
  correo: string,
  codigo: string,
): Promise<{ token: string; persona: PersonaSesion }> {
  const res = await enviarJson('/api/app/verificar', { correo, codigo });
  if (res.status === 400 || res.status === 401) {
    throw new Error('Código incorrecto o vencido.');
  }
  if (!res.ok) throw new Error('No se pudo verificar el código. Inténtalo de nuevo.');
  return (await res.json()) as { token: string; persona: PersonaSesion };
}

export async function cerrarSesionServidor(token: string): Promise<void> {
  await enviarJson('/api/app/salir', {}, token);
}
