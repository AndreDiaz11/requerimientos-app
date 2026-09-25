/**
 * @format
 */

import React, { useEffect, useState } from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RootNavigator } from './src/navigation/RootNavigator';
import { UpdateDialog } from './src/components/UpdateDialog';
import { NovedadesDialog } from './src/components/NovedadesDialog';
import { useAjustesStore } from './src/store/ajustesStore';
import { useSesionStore } from './src/store/sesionStore';
import { inicializarPush, sincronizarRegistro } from './src/services/pushNotifications';
import { buscarActualizacion, InfoActualizacion } from './src/services/updateChecker';
import { novedadesDesde, Novedad } from './src/lib/novedades';
import paquete from './package.json';

function App() {
  const cargarAjustes = useAjustesStore(s => s.cargar);
  const ajustesCargados = useAjustesStore(s => s.cargado);
  const cargarSesion = useSesionStore(s => s.cargar);
  const tokenSesion = useSesionStore(s => s.token);
  const versionVista = useAjustesStore(s => s.versionVista);
  const marcarVersionVista = useAjustesStore(s => s.marcarVersionVista);

  const [actualizacion, setActualizacion] = useState<InfoActualizacion | null>(null);
  const [updateDescartado, setUpdateDescartado] = useState(false);
  const [novedades, setNovedades] = useState<Novedad[]>([]);

  useEffect(() => {
    cargarAjustes();
    cargarSesion();
  }, [cargarAjustes, cargarSesion]);

  useEffect(() => {
    if (!ajustesCargados) return;
    buscarActualizacion(paquete.version).then(setActualizacion).catch(() => {});
    setNovedades(novedadesDesde(versionVista, paquete.version));
  }, [ajustesCargados, versionVista]);

  // El push necesita una sesión: liga este teléfono a la persona que ingresó.
  useEffect(() => {
    if (!ajustesCargados || !tokenSesion) return;
    inicializarPush()
      .then(() => sincronizarRegistro(useAjustesStore.getState().pushHabilitado))
      .catch(() => {});
  }, [ajustesCargados, tokenSesion]);

  function cerrarNovedades() {
    marcarVersionVista(paquete.version);
    setNovedades([]);
  }

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" backgroundColor="#0073ea" />
      <RootNavigator />
      {actualizacion && !updateDescartado ? (
        <UpdateDialog info={actualizacion} onCerrar={() => setUpdateDescartado(true)} />
      ) : novedades.length > 0 ? (
        <NovedadesDialog novedades={novedades} onCerrar={cerrarNovedades} />
      ) : null}
    </SafeAreaProvider>
  );
}

export default App;
