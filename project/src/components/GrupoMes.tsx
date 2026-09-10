import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { T } from '../lib/theme';

interface Props {
  etiqueta: string;
  cantidad: number;
  abierto: boolean;
  onToggle: () => void;
}

export function GrupoMes({ etiqueta, cantidad, abierto, onToggle }: Props) {
  return (
    <Pressable style={styles.fila} onPress={onToggle}>
      <Icon
        name={abierto ? 'keyboard-arrow-down' : 'keyboard-arrow-right'}
        size={22}
        color={T.texto2}
      />
      <Text style={styles.etiqueta}>{etiqueta}</Text>
      <Text style={styles.cantidad}>{cantidad}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fila: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 10,
    paddingHorizontal: 4,
  },
  etiqueta: { fontSize: 15, fontWeight: '700', color: T.texto },
  cantidad: {
    fontSize: 12,
    fontWeight: '600',
    color: T.texto2,
    backgroundColor: T.borde,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
    overflow: 'hidden',
  },
});
