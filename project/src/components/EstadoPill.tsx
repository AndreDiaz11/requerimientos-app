import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { estadoPorId } from '../lib/constantes';

export function EstadoPill({ estado }: { estado: string }) {
  const e = estadoPorId(estado);
  return (
    <View style={[styles.pill, { backgroundColor: e.color }]}>
      <Text style={[styles.texto, { color: e.colorTexto }]}>{e.etiqueta}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  texto: { fontSize: 12, fontWeight: '600' },
});
