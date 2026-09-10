import { Platform } from 'react-native';
import messaging, {
  FirebaseMessagingTypes,
} from '@react-native-firebase/messaging';
import notifee, { AndroidImportance, EventType } from '@notifee/react-native';
import { CANAL_NOTIFICACIONES } from '../lib/config';
import { registrarDispositivo, darDeBajaDispositivo } from './fcmRegistro';
import { abrirPedido } from '../navigation/navigationRef';
import { useAjustesStore } from '../store/ajustesStore';

let inicializado = false;
let cancelarRefresh: (() => void) | null = null;

function idDesdeData(data: Record<string, string | object> | undefined): number | null {
  const url = data?.url;
  if (typeof url !== 'string') return null;
  const n = Number(url.trim());
  return Number.isInteger(n) && n > 0 ? n : null;
}

async function crearCanal(): Promise<void> {
  await notifee.createChannel({
    id: CANAL_NOTIFICACIONES,
    name: 'Requerimientos',
    importance: AndroidImportance.HIGH,
  });
}

async function mostrarEnPrimerPlano(
  mensaje: FirebaseMessagingTypes.RemoteMessage,
): Promise<void> {
  const id = idDesdeData(mensaje.data);
  await notifee.displayNotification({
    title: mensaje.notification?.title ?? 'Requerimientos',
    body: mensaje.notification?.body ?? '',
    data: id !== null ? { url: String(id) } : {},
    android: {
      channelId: CANAL_NOTIFICACIONES,
      smallIcon: 'ic_launcher',
      pressAction: { id: 'default' },
    },
  });
}

export async function pedirPermisoNotificaciones(): Promise<boolean> {
  const estado = await messaging().requestPermission();
  return (
    estado === messaging.AuthorizationStatus.AUTHORIZED ||
    estado === messaging.AuthorizationStatus.PROVISIONAL
  );
}

export async function sincronizarRegistro(habilitado: boolean): Promise<void> {
  const token = await messaging().getToken().catch(() => null);
  if (!token) return;
  if (habilitado) {
    await registrarDispositivo(token);
  } else {
    await darDeBajaDispositivo(token).catch(() => {});
  }
}

export async function inicializarPush(): Promise<void> {
  if (inicializado) return;
  inicializado = true;

  try {
    await crearCanal();

    if (Platform.OS === 'android' && Platform.Version >= 33) {
      await notifee.requestPermission();
    }

    const habilitado = useAjustesStore.getState().pushHabilitado;
    if (habilitado) {
      const permitido = await pedirPermisoNotificaciones();
      if (permitido) {
        await sincronizarRegistro(true);
      }
    }

    cancelarRefresh?.();
    cancelarRefresh = messaging().onTokenRefresh(async nuevo => {
      if (useAjustesStore.getState().pushHabilitado) {
        await registrarDispositivo(nuevo).catch(() => {});
      }
    });

    messaging().onMessage(mostrarEnPrimerPlano);

    messaging().onNotificationOpenedApp(mensaje => {
      const id = idDesdeData(mensaje.data);
      if (id !== null) abrirPedido(id);
    });

    const inicial = await messaging().getInitialNotification();
    if (inicial) {
      const id = idDesdeData(inicial.data);
      if (id !== null) abrirPedido(id);
    }

    notifee.onForegroundEvent(({ type, detail }) => {
      if (type === EventType.PRESS) {
        const url = detail.notification?.data?.url;
        const n = typeof url === 'string' ? Number(url) : NaN;
        if (Number.isInteger(n) && n > 0) abrirPedido(n);
      }
    });
  } catch {
    // El push es secundario: si algo falla, la app debe seguir funcionando.
  }
}
