import { useCallback, useEffect, useState } from 'react';
import { listarPedidos } from '../api/pedidos';
import type { Pedido } from '../lib/tipos';

interface Estado {
  pedidos: Pedido[];
  cargando: boolean;
  refrescando: boolean;
  error: string | null;
  refrescar: () => void;
}

export function usePedidos(): Estado {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async (esRefresco: boolean) => {
    if (esRefresco) setRefrescando(true);
    else setCargando(true);
    setError(null);
    try {
      const datos = await listarPedidos();
      setPedidos(datos);
    } catch {
      setError('No se pudo cargar el tablero. Revisa tu conexión.');
    } finally {
      setCargando(false);
      setRefrescando(false);
    }
  }, []);

  useEffect(() => {
    cargar(false);
  }, [cargar]);

  const refrescar = useCallback(() => {
    cargar(true);
  }, [cargar]);

  return { pedidos, cargando, refrescando, error, refrescar };
}
