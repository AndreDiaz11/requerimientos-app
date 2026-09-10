import React from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { ESTADOS } from '../lib/constantes';
import { T } from '../lib/theme';

export interface Filtros {
  texto: string;
  estado: string | null;
}

interface Props {
  filtros: Filtros;
  onChange: (f: Filtros) => void;
}

export function FiltrosBar({ filtros, onChange }: Props) {
  return (
    <View style={styles.contenedor}>
      <View style={styles.buscador}>
        <Icon name="search" size={18} color={T.texto3} />
        <TextInput
          style={styles.input}
          placeholder="Buscar por descripción, unidad o solicitante"
          placeholderTextColor={T.texto3}
          value={filtros.texto}
          onChangeText={texto => onChange({ ...filtros, texto })}
          returnKeyType="search"
        />
        {filtros.texto.length > 0 ? (
          <TouchableOpacity onPress={() => onChange({ ...filtros, texto: '' })}>
            <Icon name="close" size={18} color={T.texto3} />
          </TouchableOpacity>
        ) : null}
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chips}>
        <Filtro
          activo={filtros.estado === null}
          etiqueta="Todos"
          onPress={() => onChange({ ...filtros, estado: null })}
        />
        {ESTADOS.map(e => (
          <Filtro
            key={e.id}
            activo={filtros.estado === e.id}
            etiqueta={e.etiqueta}
            color={e.color}
            onPress={() => onChange({ ...filtros, estado: filtros.estado === e.id ? null : e.id })}
          />
        ))}
      </ScrollView>
    </View>
  );
}

function Filtro({
  activo,
  etiqueta,
  color,
  onPress,
}: {
  activo: boolean;
  etiqueta: string;
  color?: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.chip, activo && styles.chipActivo]}
      onPress={onPress}>
      {color ? <View style={[styles.punto, { backgroundColor: color }]} /> : null}
      <Text style={[styles.chipTexto, activo && styles.chipTextoActivo]}>{etiqueta}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  contenedor: { gap: 10, paddingBottom: 4 },
  buscador: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: T.superficie,
    borderWidth: 1,
    borderColor: T.borde,
    borderRadius: 10,
    paddingHorizontal: 10,
  },
  input: { flex: 1, paddingVertical: 9, fontSize: 14, color: T.texto },
  chips: { gap: 8, paddingRight: 8 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: T.borde,
    backgroundColor: T.superficie,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  chipActivo: { borderColor: T.azul, backgroundColor: T.chipUnidadBg },
  chipTexto: { fontSize: 12, fontWeight: '600', color: T.texto2 },
  chipTextoActivo: { color: T.azulOscuro },
  punto: { width: 8, height: 8, borderRadius: 4 },
});
