const MESES = [
  'ene', 'feb', 'mar', 'abr', 'may', 'jun',
  'jul', 'ago', 'sep', 'oct', 'nov', 'dic',
];

const MESES_LARGOS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

const LIMA_OFFSET_MIN = -5 * 60;

function partesLima(valor: string): { anio: number; mes: number; dia: number; hora: number; minuto: number } {
  if (/^\d{4}-\d{2}-\d{2}$/.test(valor)) {
    const [anio, mes, dia] = valor.split('-').map(Number);
    return { anio, mes, dia, hora: 12, minuto: 0 };
  }
  const base = new Date(valor);
  const utc = new Date(base.getTime() + LIMA_OFFSET_MIN * 60000);
  return {
    anio: utc.getUTCFullYear(),
    mes: utc.getUTCMonth() + 1,
    dia: utc.getUTCDate(),
    hora: utc.getUTCHours(),
    minuto: utc.getUTCMinutes(),
  };
}

export function soloFecha(valor: string): string {
  const p = partesLima(valor);
  return `${String(p.dia).padStart(2, '0')} ${MESES[p.mes - 1]} ${p.anio}`;
}

export function fechaHora(valor: string): string {
  const p = partesLima(valor);
  return `${String(p.dia).padStart(2, '0')} ${MESES[p.mes - 1]} ${p.anio}, ${String(p.hora).padStart(2, '0')}:${String(p.minuto).padStart(2, '0')}`;
}

export function claveMes(valor: string): string {
  const p = partesLima(valor);
  return `${p.anio}-${String(p.mes).padStart(2, '0')}`;
}

export function etiquetaMes(clave: string): string {
  const [anio, mes] = clave.split('-').map(Number);
  return `${MESES_LARGOS[mes - 1] ?? ''} ${anio}`;
}

function hoyLimaYMD(): string {
  const p = partesLima(new Date().toISOString());
  return `${p.anio}-${String(p.mes).padStart(2, '0')}-${String(p.dia).padStart(2, '0')}`;
}

export function diasHasta(fechaYMD: string): number {
  const objetivo = Date.parse(`${fechaYMD.slice(0, 10)}T00:00:00Z`);
  const base = Date.parse(`${hoyLimaYMD()}T00:00:00Z`);
  return Math.round((objetivo - base) / 86_400_000);
}

export function relativoEntrega(dias: number): string {
  if (dias < -1) return `venció hace ${Math.abs(dias)} días`;
  if (dias === -1) return 'venció ayer';
  if (dias === 0) return 'vence hoy';
  if (dias === 1) return 'vence mañana';
  return `en ${dias} días`;
}

export type Urgencia = 'ninguna' | 'pronto' | 'vencido';

export function urgenciaEntrega(dias: number, listo: boolean): Urgencia {
  if (listo) return 'ninguna';
  if (dias < 0) return 'vencido';
  if (dias <= 3) return 'pronto';
  return 'ninguna';
}

export const COLOR_URGENCIA: Record<Urgencia, string> = {
  ninguna: '#8a8397',
  pronto: '#b26a00',
  vencido: '#c9304a',
};

export function recortar(texto: string, max = 80): string {
  const limpio = texto.replace(/\s+/g, ' ').trim();
  return limpio.length > max ? `${limpio.slice(0, max).trimEnd()}…` : limpio;
}

export function iniciales(nombre: string): string {
  const partes = nombre.trim().split(/\s+/);
  const a = partes[0]?.[0] ?? '';
  const b = partes.length > 1 ? partes[partes.length - 1][0] : '';
  return (a + b).toUpperCase();
}
