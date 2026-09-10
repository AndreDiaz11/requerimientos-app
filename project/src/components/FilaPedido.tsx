import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import type { Pedido } from '../lib/tipos';
import { T } from '../lib/theme';
import { COLOR_URGENCIA, diasHasta, relativoEntrega, soloFecha, urgenciaEntrega } from '../lib/formato';
import { EstadoPill } from './EstadoPill';
import { Chip } from './Chip';
import { Avatar } from './Avatar';

function contarEnlaces(p: Pedido): number {
  return (
    (p.referencia ? 1 : 0) +
    (p.recursos ? 1 : 0) +
    (p.carpetaArchivos ? 1 : 0) +
    (p.enlaceArchivos ? 1 : 0)
  );
}

export function FilaPedido({ pedido, onPress }: { pedido: Pedido; onPress: () => void }) {
  const dias = diasHasta(pedido.fechaEntrega);
  const urgencia = urgenciaEntrega(dias, pedido.estado === 'listo');
  const enlaces = contarEnlaces(pedido);

  return (
    <Pressable
      style={({ pressed }) => [styles.fila, pressed && styles.presionada]}
      onPress={onPress}>
      <View style={styles.encabezado}>
        <EstadoPill estado={pedido.estado} />
        <Avatar nombre={pedido.solicitadoPor} />
      </View>

      <Text style={styles.descripcion} numberOfLines={2}>
        {pedido.descripcion}
      </Text>

      <View style={styles.chips}>
        <Chip texto={pedido.unidadNegocio} variante="unidad" />
        <Chip texto={pedido.tipo} variante="tipo" />
      </View>

      <View style={styles.pie}>
        <View style={styles.pieItem}>
          <Icon name="event" size={14} color={COLOR_URGENCIA[urgencia]} />
          <Text style={[styles.pieTexto, { color: COLOR_URGENCIA[urgencia] }]}>
            {soloFecha(pedido.fechaEntrega)} · {relativoEntrega(dias)}
          </Text>
        </View>
        {enlaces > 0 || pedido.adjuntoKey ? (
          <View style={styles.pieItem}>
            {enlaces > 0 ? (
              <>
                <Icon name="link" size={14} color={T.texto3} />
                <Text style={styles.pieTexto}>{enlaces}</Text>
              </>
            ) : null}
            {pedido.adjuntoKey ? (
              <Icon name="attach-file" size={14} color={T.texto3} style={styles.adjuntoIcono} />
            ) : null}
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fila: {
    backgroundColor: T.superficie,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: T.borde,
    padding: 14,
    gap: 8,
  },
  presionada: { opacity: 0.6 },
  encabezado: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  descripcion: { color: T.texto, fontSize: 14, fontWeight: '600', lineHeight: 19 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  pie: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 2 },
  pieItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  pieTexto: { fontSize: 11, color: T.texto3, fontWeight: '500' },
  adjuntoIcono: { marginLeft: 4 },
});
