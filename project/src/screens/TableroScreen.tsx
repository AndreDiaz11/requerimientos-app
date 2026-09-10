import React, { useMemo, useState } from 'react';
import { RefreshControl, SectionList, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParams } from '../navigation/navigationRef';
import { usePedidos } from '../hooks/usePedidos';
import { agruparPorMes } from '../lib/agrupar';
import { T } from '../lib/theme';
import type { Pedido } from '../lib/tipos';
import { FiltrosBar, Filtros } from '../components/FiltrosBar';
import { GrupoMes } from '../components/GrupoMes';
import { FilaPedido } from '../components/FilaPedido';
import { MensajeEstado } from '../components/MensajeEstado';

type Props = NativeStackScreenProps<RootStackParams, 'Tablero'>;

function coincide(p: Pedido, f: Filtros): boolean {
  if (f.estado && p.estado !== f.estado) return false;
  const q = f.texto.trim().toLowerCase();
  if (!q) return true;
  return (
    p.descripcion.toLowerCase().includes(q) ||
    p.unidadNegocio.toLowerCase().includes(q) ||
    p.solicitadoPor.toLowerCase().includes(q) ||
    p.tipo.toLowerCase().includes(q) ||
    (p.comentario ?? '').toLowerCase().includes(q)
  );
}

export function TableroScreen({ navigation }: Props) {
  const { pedidos, cargando, refrescando, error, refrescar } = usePedidos();
  const [filtros, setFiltros] = useState<Filtros>({ texto: '', estado: null });
  const [colapsados, setColapsados] = useState<Set<string>>(new Set());
  const [tocado, setTocado] = useState(false);
  const insets = useSafeAreaInsets();

  const grupos = useMemo(() => {
    const filtrados = pedidos.filter(p => coincide(p, filtros));
    return agruparPorMes(filtrados);
  }, [pedidos, filtros]);

  const secciones = useMemo(() => {
    const abiertosPorDefecto = new Set(grupos.slice(0, 2).map(g => g.clave));
    return grupos.map(g => {
      const colapsado = tocado
        ? colapsados.has(g.clave)
        : !abiertosPorDefecto.has(g.clave);
      return {
        clave: g.clave,
        etiqueta: g.etiqueta,
        total: g.pedidos.length,
        colapsado,
        data: colapsado ? [] : g.pedidos,
      };
    });
  }, [grupos, colapsados, tocado]);

  function alternar(clave: string) {
    setTocado(true);
    setColapsados(prev => {
      const siguiente = new Set(prev);
      const yaColapsado = secciones.find(s => s.clave === clave)?.colapsado ?? false;
      if (yaColapsado) siguiente.delete(clave);
      else siguiente.add(clave);
      return siguiente;
    });
  }

  if (cargando) {
    return <MensajeEstado tipo="cargando" />;
  }

  if (error && pedidos.length === 0) {
    return <MensajeEstado tipo="error" mensaje={error} onReintentar={refrescar} />;
  }

  return (
    <View style={styles.contenedor}>
      <SectionList
        sections={secciones}
        keyExtractor={item => String(item.id)}
        stickySectionHeadersEnabled={false}
        contentContainerStyle={[styles.lista, { paddingBottom: insets.bottom + 24 }]}
        ListHeaderComponent={
          <View style={styles.filtros}>
            <FiltrosBar filtros={filtros} onChange={setFiltros} />
          </View>
        }
        renderSectionHeader={({ section }) => (
          <GrupoMes
            etiqueta={section.etiqueta}
            cantidad={section.total}
            abierto={!section.colapsado}
            onToggle={() => alternar(section.clave)}
          />
        )}
        renderItem={({ item }) => (
          <FilaPedido
            pedido={item}
            onPress={() => navigation.navigate('Detalle', { id: item.id })}
          />
        )}
        ItemSeparatorComponent={() => <View style={styles.separador} />}
        ListEmptyComponent={
          <MensajeEstado
            tipo="vacio"
            mensaje={
              pedidos.length === 0
                ? 'Todavía no hay requerimientos.'
                : 'Ningún requerimiento coincide con el filtro.'
            }
          />
        }
        refreshControl={
          <RefreshControl refreshing={refrescando} onRefresh={refrescar} colors={[T.azul]} tintColor={T.azul} />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: T.fondo },
  lista: { paddingHorizontal: 14, paddingTop: 12 },
  filtros: { marginBottom: 4 },
  separador: { height: 10 },
});
