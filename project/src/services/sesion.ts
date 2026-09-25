import messaging from '@react-native-firebase/messaging';
import { cerrarSesionServidor } from '../api/acceso';
import { useSesionStore } from '../store/sesionStore';
import { darDeBajaDispositivo } from './fcmRegistro';

/**
 * Cierra la sesión: este teléfono deja de recibir los avisos de la persona,
 * se revoca el token en el servidor y se vuelve a la pantalla de ingreso.
 * Cada paso es "mejor esfuerzo": aunque falle la red, la sesión local sí se cierra.
 */
export async function cerrarSesionCompleta(): Promise<void> {
  const { token, cerrar } = useSesionStore.getState();
  try {
    const fcm = await messaging().getToken();
    if (fcm) await darDeBajaDispositivo(fcm);
  } catch {
    // sin red o sin token FCM: no bloquea el cierre
  }
  try {
    if (token) await cerrarSesionServidor(token);
  } catch {
    // idem
  }
  await cerrar();
}
