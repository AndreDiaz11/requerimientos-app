import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { T } from '../lib/theme';

interface Props {
  texto: string;
  variante?: 'unidad' | 'tipo';
}

export function Chip({ texto, variante = 'tipo' }: Props) {
  const esUnidad = variante === 'unidad';
  return (
    <View
      style={[
        styles.chip,
        { backgroundColor: esUnidad ? T.chipUnidadBg : T.chipTipoBg },
      ]}>
      <Text
        style={[
          styles.texto,
          { color: esUnidad ? T.chipUnidadTexto : T.chipTipoTexto },
        ]}
        numberOfLines={1}>
        {texto}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    maxWidth: 220,
  },
  texto: { fontSize: 11, fontWeight: '600' },
});
