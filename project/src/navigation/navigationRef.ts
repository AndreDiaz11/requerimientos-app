import { createNavigationContainerRef } from '@react-navigation/native';
import { useSesionStore } from '../store/sesionStore';

export type RootStackParams = {
  Login: undefined;
  Tablero: undefined;
  Detalle: { id: number };
  Ajustes: undefined;
};

export const navigationRef = createNavigationContainerRef<RootStackParams>();

let pendiente: number | null = null;

export function abrirPedido(id: number): void {
  // Sin sesión iniciada no existe la pantalla de detalle: se guarda hasta que ingrese.
  if (navigationRef.isReady() && useSesionStore.getState().token) {
    navigationRef.navigate('Detalle', { id });
  } else {
    pendiente = id;
  }
}

export function consumirPedidoPendiente(): void {
  if (pendiente !== null && navigationRef.isReady() && useSesionStore.getState().token) {
    const id = pendiente;
    pendiente = null;
    navigationRef.navigate('Detalle', { id });
  }
}
