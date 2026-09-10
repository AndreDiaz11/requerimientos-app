import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { iniciales } from '../lib/formato';

const COLORES = ['#0073ea', '#00c875', '#a25ddc', '#fdab3d', '#e2445c', '#579bfc', '#037f4c', '#784bd1'];

function colorPara(nombre: string): string {
  let h = 0;
  for (let i = 0; i < nombre.length; i++) h = (h * 31 + nombre.charCodeAt(i)) % 2147483647;
  return COLORES[h % COLORES.length];
}

interface Props {
  nombre: string;
  tam?: number;
}

export function Avatar({ nombre, tam = 28 }: Props) {
  return (
    <View
      style={[
        styles.circulo,
        { width: tam, height: tam, borderRadius: tam / 2, backgroundColor: colorPara(nombre) },
      ]}>
      <Text style={[styles.texto, { fontSize: tam * 0.4 }]}>{iniciales(nombre)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  circulo: { alignItems: 'center', justifyContent: 'center' },
  texto: { color: '#fff', fontWeight: '700' },
});
