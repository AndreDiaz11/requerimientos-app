export interface Novedad {
  version: string;
  cambios: string[];
}

export const NOVEDADES: Novedad[] = [
  {
    version: '1.0.1',
    cambios: [
      'Nuevo icono de la app.',
      'La app ahora aparece como "Z Requerimientos" para quedar al final de tu lista de apps.',
    ],
  },
  {
    version: '1.0.0',
    cambios: [
      'Primera versión de la app.',
      'Tablero de requerimientos agrupado por mes, con filtros y búsqueda.',
      'Detalle completo de cada requerimiento, con enlaces y adjunto.',
      'Aviso push cuando se registra un requerimiento nuevo.',
    ],
  },
];

function comparar(a: string, b: string): number {
  const pa = a.split('.').map(n => parseInt(n, 10) || 0);
  const pb = b.split('.').map(n => parseInt(n, 10) || 0);
  for (let i = 0; i < 3; i++) {
    const d = (pa[i] ?? 0) - (pb[i] ?? 0);
    if (d !== 0) return d;
  }
  return 0;
}

export function novedadesDesde(versionVista: string | null, versionActual: string): Novedad[] {
  return NOVEDADES.filter(
    n =>
      comparar(n.version, versionActual) <= 0 &&
      (versionVista === null || comparar(n.version, versionVista) > 0),
  ).sort((a, b) => comparar(b.version, a.version));
}
