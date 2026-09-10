import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { T } from '../lib/theme';

interface Props {
  tipo: 'cargando' | 'error' | 'vacio';
  mensaje?: string;
  onReintentar?: () => void;
}

export function MensajeEstado({ tipo, mensaje, onReintentar }: Props) {
  return (
    <View style={styles.contenedor}>
      {tipo === 'cargando' ? (
        <ActivityIndicator color={T.azul} size="large" />
      ) : (
        <Icon
          name={tipo === 'error' ? 'cloud-off' : 'inbox'}
          size={44}
          color={T.texto3}
        />
      )}
      <Text style={styles.texto}>
        {mensaje ??
          (tipo === 'cargando'
            ? 'Cargando…'
            : tipo === 'error'
            ? 'Algo salió mal.'
            : 'No hay nada por aquí.')}
      </Text>
      {tipo === 'error' && onReintentar ? (
        <TouchableOpacity style={styles.boton} onPress={onReintentar}>
          <Text style={styles.botonTexto}>Reintentar</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: { alignItems: 'center', justifyContent: 'center', padding: 40, gap: 12 },
  texto: { color: T.texto2, fontSize: 14, textAlign: 'center' },
  boton: {
    marginTop: 4,
    backgroundColor: T.azul,
    borderRadius: 8,
    paddingHorizontal: 18,
    paddingVertical: 9,
  },
  botonTexto: { color: '#fff', fontWeight: '700', fontSize: 13 },
});
