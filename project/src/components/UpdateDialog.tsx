import React, { useState } from 'react';
import { ActivityIndicator, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { T } from '../lib/theme';
import type { InfoActualizacion } from '../services/updateChecker';
import { descargarEInstalarApk } from '../services/apkInstaller';

interface Props {
  info: InfoActualizacion;
  onCerrar: () => void;
}

export function UpdateDialog({ info, onCerrar }: Props) {
  const [descargando, setDescargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function actualizar() {
    setDescargando(true);
    setError(null);
    try {
      await descargarEInstalarApk(info.urlApk);
      onCerrar();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo instalar la actualización');
    } finally {
      setDescargando(false);
    }
  }

  return (
    <Modal transparent animationType="fade" visible onRequestClose={() => {}}>
      <View style={styles.fondo}>
        <View style={styles.tarjeta}>
          <Text style={styles.titulo}>Actualización disponible</Text>
          <Text style={styles.cuerpo}>
            Hay una versión nueva de Requerimientos (v{info.version}).
          </Text>
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <View style={styles.acciones}>
            <TouchableOpacity onPress={onCerrar} disabled={descargando} style={styles.botonGhost}>
              <Text style={styles.ghostTexto}>Ahora no</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={actualizar} disabled={descargando} style={styles.botonPrimario}>
              {descargando ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.primarioTexto}>Actualizar</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fondo: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', alignItems: 'center', justifyContent: 'center', padding: 24 },
  tarjeta: { width: '100%', maxWidth: 360, backgroundColor: T.superficie, borderRadius: 16, padding: 20 },
  titulo: { color: T.texto, fontSize: 17, fontWeight: '700', marginBottom: 8 },
  cuerpo: { color: T.texto2, fontSize: 14, lineHeight: 20 },
  error: { color: T.peligro, marginTop: 10, fontSize: 12 },
  acciones: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 20, gap: 8 },
  botonGhost: { paddingVertical: 10, paddingHorizontal: 14 },
  ghostTexto: { color: T.texto2, fontWeight: '600' },
  botonPrimario: {
    backgroundColor: T.azul,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    minWidth: 104,
    alignItems: 'center',
  },
  primarioTexto: { color: '#fff', fontWeight: '700' },
});
