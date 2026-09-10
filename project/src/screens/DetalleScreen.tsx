import React, { useCallback, useEffect, useState } from 'react';
import {
  Linking,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParams } from '../navigation/navigationRef';
import { obtenerPedido, urlAdjunto } from '../api/pedidos';
import type { Pedido } from '../lib/tipos';
import { T } from '../lib/theme';
import {
  COLOR_URGENCIA,
  diasHasta,
  fechaHora,
  relativoEntrega,
  soloFecha,
  urgenciaEntrega,
} from '../lib/formato';
import { EstadoPill } from '../components/EstadoPill';
import { Chip } from '../components/Chip';
import { Avatar } from '../components/Avatar';
import { MensajeEstado } from '../components/MensajeEstado';

type Props = NativeStackScreenProps<RootStackParams, 'Detalle'>;

interface Enlace {
  etiqueta: string;
  url: string;
}

function enlacesDe(p: Pedido): Enlace[] {
  const lista: Enlace[] = [];
  if (p.referencia) lista.push({ etiqueta: 'Referencia', url: p.referencia });
  if (p.recursos) lista.push({ etiqueta: 'Recursos', url: p.recursos });
  if (p.carpetaArchivos) lista.push({ etiqueta: 'Carpeta de archivos', url: p.carpetaArchivos });
  if (p.enlaceArchivos) lista.push({ etiqueta: 'Enlace de descarga', url: p.enlaceArchivos });
  return lista;
}

export function DetalleScreen({ route }: Props) {
  const { id } = route.params;
  const [pedido, setPedido] = useState<Pedido | null>(null);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const insets = useSafeAreaInsets();

  const cargar = useCallback(
    async (esRefresco: boolean) => {
      if (esRefresco) setRefrescando(true);
      else setCargando(true);
      setError(null);
      try {
        setPedido(await obtenerPedido(id));
      } catch {
        setError('No se pudo cargar el requerimiento.');
      } finally {
        setCargando(false);
        setRefrescando(false);
      }
    },
    [id],
  );

  useEffect(() => {
    cargar(false);
  }, [cargar]);

  if (cargando) return <MensajeEstado tipo="cargando" />;
  if (error || !pedido) {
    return <MensajeEstado tipo="error" mensaje={error ?? 'No encontrado'} onReintentar={() => cargar(false)} />;
  }

  const dias = diasHasta(pedido.fechaEntrega);
  const urgencia = urgenciaEntrega(dias, pedido.estado === 'listo');
  const enlaces = enlacesDe(pedido);

  function abrir(url: string) {
    Linking.openURL(url).catch(() => {});
  }

  return (
    <ScrollView
      style={styles.contenedor}
      contentContainerStyle={[styles.contenido, { paddingBottom: insets.bottom + 32 }]}
      refreshControl={
        <RefreshControl refreshing={refrescando} onRefresh={() => cargar(true)} colors={[T.azul]} />
      }>
      <View style={styles.encabezado}>
        <EstadoPill estado={pedido.estado} />
        <Text style={styles.numero}>#{pedido.id}</Text>
      </View>

      <Text style={styles.descripcion}>{pedido.descripcion}</Text>

      <View style={styles.chips}>
        <Chip texto={pedido.unidadNegocio} variante="unidad" />
        <Chip texto={pedido.tipo} variante="tipo" />
      </View>

      <View style={styles.tarjeta}>
        <Dato icono="person" etiqueta="Solicitado por">
          <View style={styles.solicitante}>
            <Avatar nombre={pedido.solicitadoPor} tam={22} />
            <Text style={styles.valor}>{pedido.solicitadoPor}</Text>
          </View>
        </Dato>
        <Separador />
        <Dato icono="event" etiqueta="Fecha de entrega">
          <Text style={[styles.valor, { color: COLOR_URGENCIA[urgencia] }]}>
            {soloFecha(pedido.fechaEntrega)} · {relativoEntrega(dias)}
          </Text>
        </Dato>
        <Separador />
        <Dato icono="schedule" etiqueta="Registrado">
          <Text style={styles.valor}>{fechaHora(pedido.creadoEn)}</Text>
        </Dato>
      </View>

      {pedido.comentario ? (
        <View style={styles.tarjeta}>
          <Text style={styles.seccionTitulo}>Comentario</Text>
          <Text style={styles.parrafo}>{pedido.comentario}</Text>
        </View>
      ) : null}

      {enlaces.length > 0 ? (
        <View style={styles.tarjeta}>
          <Text style={styles.seccionTitulo}>Enlaces de apoyo</Text>
          {enlaces.map(e => (
            <TouchableOpacity key={e.etiqueta} style={styles.enlace} onPress={() => abrir(e.url)}>
              <Icon name="open-in-new" size={16} color={T.azul} />
              <Text style={styles.enlaceTexto}>{e.etiqueta}</Text>
            </TouchableOpacity>
          ))}
        </View>
      ) : null}

      {pedido.adjuntoKey ? (
        <View style={styles.tarjeta}>
          <Text style={styles.seccionTitulo}>Archivo adjunto</Text>
          <TouchableOpacity
            style={styles.enlace}
            onPress={() => abrir(urlAdjunto(pedido.adjuntoKey as string))}>
            <Icon name="attach-file" size={16} color={T.azul} />
            <Text style={styles.enlaceTexto}>{pedido.adjuntoNombre ?? 'Abrir adjunto'}</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      <Text style={styles.nota}>
        Para registrar o editar requerimientos, entra a reqdiseno.com desde la web.
      </Text>
    </ScrollView>
  );
}

function Dato({
  icono,
  etiqueta,
  children,
}: {
  icono: string;
  etiqueta: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.dato}>
      <View style={styles.datoEtiqueta}>
        <Icon name={icono} size={16} color={T.texto3} />
        <Text style={styles.etiqueta}>{etiqueta}</Text>
      </View>
      {children}
    </View>
  );
}

function Separador() {
  return <View style={styles.datoSeparador} />;
}

const styles = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: T.fondo },
  contenido: { padding: 16, gap: 14 },
  encabezado: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  numero: { color: T.texto3, fontWeight: '700', fontSize: 13 },
  descripcion: { color: T.texto, fontSize: 17, fontWeight: '700', lineHeight: 24 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tarjeta: {
    backgroundColor: T.superficie,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: T.borde,
    padding: 14,
    gap: 10,
  },
  dato: { gap: 6 },
  datoEtiqueta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  datoSeparador: { height: 1, backgroundColor: T.borde },
  etiqueta: { color: T.texto3, fontSize: 12, fontWeight: '600', textTransform: 'uppercase' },
  valor: { color: T.texto, fontSize: 14, fontWeight: '500' },
  solicitante: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  seccionTitulo: { color: T.texto3, fontSize: 12, fontWeight: '700', textTransform: 'uppercase' },
  parrafo: { color: T.texto, fontSize: 14, lineHeight: 20 },
  enlace: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 6 },
  enlaceTexto: { color: T.azul, fontSize: 14, fontWeight: '600' },
  nota: { color: T.texto3, fontSize: 12, textAlign: 'center', marginTop: 4, lineHeight: 17 },
});
