import { GITHUB_REPO } from '../lib/config';

export interface InfoActualizacion {
  version: string;
  urlApk: string;
  urlRelease: string;
}

function esMasNueva(remota: string, local: string): boolean {
  const p = (v: string) => v.split('.').map(n => parseInt(n, 10) || 0);
  const r = p(remota);
  const l = p(local);
  for (let i = 0; i < 3; i++) {
    const rv = r[i] ?? 0;
    const lv = l[i] ?? 0;
    if (rv !== lv) return rv > lv;
  }
  return false;
}

export async function buscarActualizacion(
  versionActual: string,
): Promise<InfoActualizacion | null> {
  const res = await fetch(
    `https://api.github.com/repos/${GITHUB_REPO}/releases/latest`,
    { headers: { Accept: 'application/vnd.github+json' } },
  );
  if (!res.ok) return null;

  const data = await res.json();
  const tag = String(data.tag_name ?? '').replace(/^v/, '');
  if (!tag || !esMasNueva(tag, versionActual)) return null;

  const assets: Array<{ name?: string; browser_download_url?: string }> = data.assets ?? [];
  const apk = assets.find(a => String(a.name).endsWith('.apk'));
  const urlRelease = data.html_url ?? `https://github.com/${GITHUB_REPO}/releases/latest`;

  return {
    version: tag,
    urlApk: apk?.browser_download_url ?? urlRelease,
    urlRelease,
  };
}
