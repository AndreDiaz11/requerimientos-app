import React, { useState } from 'react';
import { Alert, Linking, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { T } from '../lib/theme';
import { API_BASE } from '../lib/config';
import { useAjustesStore } from '../store/ajustesStore';
import { pedirPermisoNotificaciones, sincronizarRegistro } from '../services/pushNotifications';
import { buscarActualizacion } from '../services/updateChecker';
import { descargarEInstalarApk } from '../services/apkInstaller';
import paquete from '../../package.json';

export function AjustesScreen() {
  const pushHabilitado = useAjustesStore(s => s.pushHabilitado);
  const setPushHabilitado = useAjustesStore(s => s.setPushHabilitado);
  const [ocupado, setOcupado] = useState(false);
  const [buscando, setBuscando] = useState(false);
  const insets = useSafeAreaInsets();

  async function alternarPush(valor: boolean) {
    setOcupado(true);
    try {
      if (valor) {
        const permitido = await pedirPermisoNotificaciones();
        if (!permitido) {
          Alert.alert(
            'Permiso denegado',
            'Activa las notificaciones para Requerimientos en los ajustes de Android.',
          );
          return;
        }
      }
      await setPushHabilitado(valor);
      await sincronizarRegistro(valor);
    } catch {
      Alert.alert('Error', 'No se pudo actualizar la preferencia de notificaciones.');
    } finally {
      setOcupado(false);
    }
  }

  async function revisarActualizacion() {
    setBuscando(true);
    try {
      const info = await buscarActualizacion(paquete.version);
      if (!info) {
        Alert.alert('Todo al día', 'Ya tienes la última versión instalada.');
        return;
      }
      Alert.alert(
        'Actualización disponible',
        `Hay una versión nueva (v${info.version}). ¿Descargar e instalar ahora?`,
        [
          { text: 'Ahora no', style: 'cancel' },
          {
            text: 'Actualizar',
            onPress: () =>
              descargarEInstalarApk(info.urlApk).catch(() =>
                Alert.alert('Error', 'No se pudo descargar la actualización.'),
              ),
          },
        ],
      );
    } catch {
      Alert.alert('Error', 'No se pudo comprobar si hay actualizaciones.');
    } finally {
      setBuscando(false);
    }
  }

  return (
    <ScrollView
      style={styles.contenedor}
      contentContainerStyle={[styles.contenido, { paddingBottom: insets.bottom + 32 }]}>
      <View style={styles.tarjeta}>
        <View style={styles.filaSwitch}>
          <View style={styles.filaTexto}>
            <Text style={styles.titulo}>Avisos push</Text>
            <Text style={styles.sub}>
              Recibe una notificación cuando se registra un requerimiento nuevo.
            </Text>
          </View>
          <Switch
            value={pushHabilitado}
            onValueChange={alternarPush}
            disabled={ocupado}
            trackColor={{ true: T.azul, false: '#c9cdd6' }}
            thumbColor="#ffffff"
          />
        </View>
      </View>

      <TouchableOpacity style={styles.tarjeta} onPress={revisarActualizacion} disabled={buscando}>
        <View style={styles.filaAccion}>
          <Icon name="system-update" size={20} color={T.azul} />
          <Text style={styles.accionTexto}>
            {buscando ? 'Comprobando…' : 'Buscar actualización'}
          </Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.tarjeta}
        onPress={() => Linking.openURL(API_BASE).catch(() => {})}>
        <View style={styles.filaAccion}>
          <Icon name="open-in-new" size={20} color={T.azul} />
          <Text style={styles.accionTexto}>Abrir reqdiseno.com</Text>
        </View>
      </TouchableOpacity>

      <Text style={styles.version}>Versión {paquete.version}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: T.fondo },
  contenido: { padding: 16, gap: 12 },
  tarjeta: {
    backgroundColor: T.superficie,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: T.borde,
    padding: 16,
  },
  filaSwitch: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  filaTexto: { flex: 1, gap: 3 },
  titulo: { color: T.texto, fontSize: 15, fontWeight: '600' },
  sub: { color: T.texto2, fontSize: 12, lineHeight: 17 },
  filaAccion: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  accionTexto: { color: T.texto, fontSize: 15, fontWeight: '600' },
  version: { color: T.texto3, fontSize: 12, textAlign: 'center', marginTop: 8 },
});
