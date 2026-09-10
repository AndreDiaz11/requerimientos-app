import React from 'react';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { T } from '../lib/theme';
import type { Novedad } from '../lib/novedades';

interface Props {
  novedades: Novedad[];
  onCerrar: () => void;
}

export function NovedadesDialog({ novedades, onCerrar }: Props) {
  if (novedades.length === 0) return null;
  const versionTope = novedades[0].version;

  return (
    <Modal transparent animationType="fade" visible onRequestClose={onCerrar}>
      <View style={styles.fondo}>
        <View style={styles.tarjeta}>
          <Text style={styles.titulo}>Novedades · v{versionTope}</Text>
          <ScrollView style={styles.lista} contentContainerStyle={styles.listaContenido}>
            {novedades.map(n => (
              <View key={n.version} style={styles.bloque}>
                {novedades.length > 1 ? (
                  <Text style={styles.versionEtiqueta}>v{n.version}</Text>
                ) : null}
                {n.cambios.map((c, i) => (
                  <View key={i} style={styles.item}>
                    <Text style={styles.vinieta}>•</Text>
                    <Text style={styles.itemTexto}>{c}</Text>
                  </View>
                ))}
              </View>
            ))}
          </ScrollView>
          <TouchableOpacity style={styles.boton} onPress={onCerrar}>
            <Text style={styles.botonTexto}>Entendido</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fondo: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', alignItems: 'center', justifyContent: 'center', padding: 24 },
  tarjeta: { width: '100%', maxWidth: 360, backgroundColor: T.superficie, borderRadius: 16, padding: 20 },
  titulo: { color: T.texto, fontSize: 17, fontWeight: '700', marginBottom: 12 },
  lista: { maxHeight: 320 },
  listaContenido: { gap: 14 },
  bloque: { gap: 8 },
  versionEtiqueta: { fontSize: 12, fontWeight: '700', color: T.texto3 },
  item: { flexDirection: 'row', gap: 8 },
  vinieta: { color: T.azul, fontSize: 14, lineHeight: 20 },
  itemTexto: { flex: 1, color: T.texto2, fontSize: 14, lineHeight: 20 },
  boton: { marginTop: 18, backgroundColor: T.azul, borderRadius: 8, paddingVertical: 11, alignItems: 'center' },
  botonTexto: { color: '#fff', fontWeight: '700' },
});
