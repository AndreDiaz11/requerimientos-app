import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CLAVE_PUSH = 'ajustes.pushHabilitado';
const CLAVE_VERSION_VISTA = 'ajustes.versionVista';

interface AjustesState {
  pushHabilitado: boolean;
  versionVista: string | null;
  cargado: boolean;
  cargar: () => Promise<void>;
  setPushHabilitado: (valor: boolean) => Promise<void>;
  marcarVersionVista: (version: string) => Promise<void>;
}

export const useAjustesStore = create<AjustesState>((set) => ({
  pushHabilitado: true,
  versionVista: null,
  cargado: false,

  cargar: async () => {
    try {
      const [push, version] = await Promise.all([
        AsyncStorage.getItem(CLAVE_PUSH),
        AsyncStorage.getItem(CLAVE_VERSION_VISTA),
      ]);
      set({
        pushHabilitado: push === null ? true : push === '1',
        versionVista: version,
        cargado: true,
      });
    } catch {
      set({ cargado: true });
    }
  },

  setPushHabilitado: async (valor: boolean) => {
    set({ pushHabilitado: valor });
    try {
      await AsyncStorage.setItem(CLAVE_PUSH, valor ? '1' : '0');
    } catch {
      // preferencia local; si no persiste, no es crítico
    }
  },

  marcarVersionVista: async (version: string) => {
    set({ versionVista: version });
    try {
      await AsyncStorage.setItem(CLAVE_VERSION_VISTA, version);
    } catch {
      // idem
    }
  },
}));
