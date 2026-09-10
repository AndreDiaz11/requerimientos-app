import { createNavigationContainerRef } from '@react-navigation/native';

export type RootStackParams = {
  Tablero: undefined;
  Detalle: { id: number };
  Ajustes: undefined;
};

export const navigationRef = createNavigationContainerRef<RootStackParams>();

let pendiente: number | null = null;

export function abrirPedido(id: number): void {
  if (navigationRef.isReady()) {
    navigationRef.navigate('Detalle', { id });
  } else {
    pendiente = id;
  }
}

export function consumirPedidoPendiente(): void {
  if (pendiente !== null && navigationRef.isReady()) {
    const id = pendiente;
    pendiente = null;
    navigationRef.navigate('Detalle', { id });
  }
}
