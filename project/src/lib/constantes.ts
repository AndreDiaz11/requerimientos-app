export const ESTADO_IDS = ['no_empezado', 'en_proceso', 'en_pausa', 'listo'] as const;
export type EstadoId = (typeof ESTADO_IDS)[number];

export interface OpcionEstado {
  id: EstadoId;
  etiqueta: string;
  color: string;
  colorTexto: string;
}

export const ESTADOS: OpcionEstado[] = [
  { id: 'no_empezado', etiqueta: 'No empezado', color: '#c4c4c4', colorTexto: '#323338' },
  { id: 'en_proceso', etiqueta: 'En proceso', color: '#fdab3d', colorTexto: '#ffffff' },
  { id: 'en_pausa', etiqueta: 'En pausa', color: '#a25ddc', colorTexto: '#ffffff' },
  { id: 'listo', etiqueta: 'Entregado', color: '#00c875', colorTexto: '#ffffff' },
];

export const ESTADOS_POR_ID: Record<EstadoId, OpcionEstado> = Object.fromEntries(
  ESTADOS.map(e => [e.id, e]),
) as Record<EstadoId, OpcionEstado>;

export function estadoPorId(id: string): OpcionEstado {
  return ESTADOS_POR_ID[id as EstadoId] ?? ESTADOS[0];
}

export const UNIDADES_NEGOCIO = [
  '(CAD) Carreras a Distancia',
  '(CPE) Cursos y Programas de Extensión Nacional',
  '(ENG) Conversa',
  '(PFR) Programa de Formación Regular',
  '(TV) Tecsup Virtual',
  'Institucional',
  'Sede Arequipa',
  'Sede Lima',
  'Sede Trujillo',
] as const;

export const TIPOS = [
  '(ATL) Above The Line',
  '(BTL) Below The Line',
  'Landing Page',
  'Masivo',
  'Orgánico',
  'Pauta',
  'Otros',
] as const;

export const SOLICITANTES = [
  'Alejandra',
  'Alessa',
  'Alex',
  'Alexandra',
  'Cyndi',
  'Fiorella',
  'Maju',
  'Ronald',
] as const;
