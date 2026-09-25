import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { T } from '../lib/theme';
import { pedirCodigo, verificarCodigo } from '../api/acceso';
import { useSesionStore } from '../store/sesionStore';

const LARGO_CODIGO = 6;
const ESPERA_REENVIO_S = 60;

function correoPlausible(correo: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(correo);
}

export function LoginScreen() {
  const iniciar = useSesionStore(s => s.iniciar);
  const correoGuardado = useSesionStore(s => s.correo);

  const [paso, setPaso] = useState<'correo' | 'codigo'>('correo');
  const [correo, setCorreo] = useState(correoGuardado ?? '');
  const [codigo, setCodigo] = useState('');
  const [ocupado, setOcupado] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [espera, setEspera] = useState(0);
  const inputCodigo = useRef<TextInput>(null);

  useEffect(() => {
    if (espera <= 0) return;
    const t = setTimeout(() => setEspera(e => e - 1), 1000);
    return () => clearTimeout(t);
  }, [espera]);

  async function enviarCodigo() {
    const limpio = correo.trim().toLowerCase();
    if (!correoPlausible(limpio)) {
      setError('Escribe un correo válido.');
      return;
    }
    setOcupado(true);
    setError(null);
    try {
      await pedirCodigo(limpio);
      setCorreo(limpio);
      setCodigo('');
      setPaso('codigo');
      setEspera(ESPERA_REENVIO_S);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo enviar el código.');
    } finally {
      setOcupado(false);
    }
  }

  async function confirmar(valor: string) {
    if (ocupado) return;
    setOcupado(true);
    setError(null);
    try {
      const { token, persona } = await verificarCodigo(correo, valor);
      await iniciar(token, persona, correo);
    } catch (e) {
      setCodigo('');
      setError(e instanceof Error ? e.message : 'No se pudo verificar el código.');
      inputCodigo.current?.focus();
    } finally {
      setOcupado(false);
    }
  }

  function cambiarCodigo(texto: string) {
    const limpio = texto.replace(/\D/g, '').slice(0, LARGO_CODIGO);
    setCodigo(limpio);
    setError(null);
    if (limpio.length === LARGO_CODIGO) {
      confirmar(limpio);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.contenedor}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.contenido} keyboardShouldPersistTaps="handled">
        <View style={styles.logo}>
          <Icon name="assignment-turned-in" size={40} color="#ffffff" />
        </View>
        <Text style={styles.titulo}>Requerimientos</Text>

        {paso === 'correo' ? (
          <View style={styles.tarjeta}>
            <Text style={styles.etiqueta}>Ingresa tu correo</Text>
            <Text style={styles.ayuda}>
              Te enviaremos un código de 6 dígitos para verificar que eres tú.
            </Text>
            <TextInput
              style={styles.input}
              value={correo}
              onChangeText={t => {
                setCorreo(t);
                setError(null);
              }}
              placeholder="correo@ejemplo.com"
              placeholderTextColor={T.texto3}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
              editable={!ocupado}
              onSubmitEditing={enviarCodigo}
            />
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <TouchableOpacity
              style={[styles.boton, ocupado && styles.botonInactivo]}
              onPress={enviarCodigo}
              disabled={ocupado}>
              {ocupado ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.botonTexto}>Enviar código</Text>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.tarjeta}>
            <Text style={styles.etiqueta}>Escribe el código</Text>
            <Text style={styles.ayuda}>
              Si {correo} está registrado, te llegó un código de 6 dígitos. Vence en 15 minutos.
            </Text>

            <View style={styles.cajas}>
              {Array.from({ length: LARGO_CODIGO }).map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.caja,
                    i === codigo.length && !ocupado && styles.cajaActiva,
                    error ? styles.cajaError : null,
                  ]}>
                  <Text style={styles.cajaTexto}>{codigo[i] ?? ''}</Text>
                </View>
              ))}
              <TextInput
                ref={inputCodigo}
                style={styles.inputOculto}
                value={codigo}
                onChangeText={cambiarCodigo}
                keyboardType="number-pad"
                maxLength={LARGO_CODIGO}
                autoFocus
                caretHidden
                editable={!ocupado}
                accessibilityLabel="Código de 6 dígitos"
              />
            </View>

            {ocupado ? <ActivityIndicator style={styles.espacio} color={T.azul} /> : null}
            {error ? <Text style={styles.error}>{error}</Text> : null}

            <TouchableOpacity
              style={styles.enlace}
              onPress={enviarCodigo}
              disabled={ocupado || espera > 0}>
              <Text style={[styles.enlaceTexto, espera > 0 && styles.enlaceInactivo]}>
                {espera > 0 ? `Reenviar código en ${espera} s` : 'Reenviar código'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.enlace}
              onPress={() => {
                setPaso('correo');
                setCodigo('');
                setError(null);
              }}
              disabled={ocupado}>
              <Text style={styles.enlaceTexto}>Cambiar correo</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: T.fondo },
  contenido: { flexGrow: 1, justifyContent: 'center', padding: 24, gap: 16 },
  logo: {
    alignSelf: 'center',
    width: 72,
    height: 72,
    borderRadius: 18,
    backgroundColor: T.azul,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titulo: { color: T.texto, fontSize: 24, fontWeight: '800', textAlign: 'center' },
  tarjeta: {
    backgroundColor: T.superficie,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: T.borde,
    padding: 20,
    gap: 12,
  },
  etiqueta: { color: T.texto, fontSize: 17, fontWeight: '700' },
  ayuda: { color: T.texto2, fontSize: 13, lineHeight: 19 },
  input: {
    borderWidth: 1,
    borderColor: T.borde,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: T.texto,
    backgroundColor: T.fondo,
  },
  boton: {
    backgroundColor: T.azul,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  botonInactivo: { opacity: 0.7 },
  botonTexto: { color: '#ffffff', fontSize: 16, fontWeight: '700' },
  error: { color: T.peligro, fontSize: 13, fontWeight: '600' },
  cajas: { flexDirection: 'row', justifyContent: 'space-between', gap: 8, marginVertical: 6 },
  caja: {
    flex: 1,
    height: 54,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: T.borde,
    backgroundColor: T.fondo,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cajaActiva: { borderColor: T.azul, backgroundColor: '#ffffff' },
  cajaError: { borderColor: T.peligro },
  cajaTexto: { color: T.texto, fontSize: 24, fontWeight: '800' },
  // El input real cubre las casillas (invisible): tocar cualquiera abre el teclado numérico.
  inputOculto: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0,
    color: 'transparent',
  },
  espacio: { marginTop: 4 },
  enlace: { alignItems: 'center', paddingVertical: 8 },
  enlaceTexto: { color: T.azul, fontSize: 14, fontWeight: '600' },
  enlaceInactivo: { color: T.texto3 },
});
