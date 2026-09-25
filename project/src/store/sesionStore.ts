import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CLAVE_TOKEN = 'sesion.token';
const CLAVE_PERSONA = 'sesion.persona';
const CLAVE_CORREO = 'sesion.correo';

export interface PersonaSesion {
  slug: string;
  nombre: string;
}

interface SesionState {
  token: string | null;
  persona: PersonaSesion | null;
  correo: string | null;
  cargada: boolean;
  cargar: () => Promise<void>;
  iniciar: (token: string, persona: PersonaSesion, correo: string) => Promise<void>;
  cerrar: () => Promise<void>;
}

export const useSesionStore = create<SesionState>(set => ({
  token: null,
  persona: null,
  correo: null,
  cargada: false,

  cargar: async () => {
    try {
      const [token, persona, correo] = await Promise.all([
        AsyncStorage.getItem(CLAVE_TOKEN),
        AsyncStorage.getItem(CLAVE_PERSONA),
        AsyncStorage.getItem(CLAVE_CORREO),
      ]);
      const personaValida = persona ? (JSON.parse(persona) as PersonaSesion) : null;
      set({
        token: token && personaValida ? token : null,
        persona: token && personaValida ? personaValida : null,
        correo,
        cargada: true,
      });
    } catch {
      set({ cargada: true });
    }
  },

  iniciar: async (token, persona, correo) => {
    set({ token, persona, correo });
    try {
      await AsyncStorage.multiSet([
        [CLAVE_TOKEN, token],
        [CLAVE_PERSONA, JSON.stringify(persona)],
        [CLAVE_CORREO, correo],
      ]);
    } catch {
      // si no persiste, se pedirá el código de nuevo al reabrir la app
    }
  },

  cerrar: async () => {
    set({ token: null, persona: null });
    try {
      await AsyncStorage.multiRemove([CLAVE_TOKEN, CLAVE_PERSONA]);
    } catch {
      // idem
    }
  },
}));
