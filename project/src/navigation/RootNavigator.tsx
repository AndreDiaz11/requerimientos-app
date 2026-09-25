import React, { useEffect } from 'react';
import { Pressable } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { T } from '../lib/theme';
import { navigationRef, consumirPedidoPendiente, RootStackParams } from './navigationRef';
import { TableroScreen } from '../screens/TableroScreen';
import { DetalleScreen } from '../screens/DetalleScreen';
import { AjustesScreen } from '../screens/AjustesScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { useSesionStore } from '../store/sesionStore';

const Stack = createNativeStackNavigator<RootStackParams>();

const headerOptions = {
  headerStyle: { backgroundColor: T.azul },
  headerTintColor: '#ffffff',
  headerTitleStyle: { fontWeight: '700' as const },
  headerShadowVisible: false,
};

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: T.fondo,
    card: T.azul,
    text: '#ffffff',
    border: 'transparent',
    primary: T.azul,
  },
};

function BotonAjustes({ onPress }: { onPress: () => void }) {
  return (
    <Pressable onPress={onPress} hitSlop={12}>
      <Icon name="settings" size={22} color="#ffffff" />
    </Pressable>
  );
}

export function RootNavigator() {
  const cargada = useSesionStore(s => s.cargada);
  const token = useSesionStore(s => s.token);
  const persona = useSesionStore(s => s.persona);

  // Si se tocó un aviso push antes de ingresar, se abre al terminar el ingreso.
  useEffect(() => {
    if (!token) return;
    const t = setTimeout(consumirPedidoPendiente, 150);
    return () => clearTimeout(t);
  }, [token]);

  if (!cargada) return null;

  return (
    <NavigationContainer ref={navigationRef} theme={navTheme} onReady={consumirPedidoPendiente}>
      <Stack.Navigator screenOptions={headerOptions}>
        {token ? (
          <>
            <Stack.Screen
              name="Tablero"
              component={TableroScreen}
              options={({ navigation }) => ({
                title: persona ? `Requerimientos · ${persona.nombre}` : 'Requerimientos',
                // eslint-disable-next-line react/no-unstable-nested-components
                headerRight: () => <BotonAjustes onPress={() => navigation.navigate('Ajustes')} />,
              })}
            />
            <Stack.Screen
              name="Detalle"
              component={DetalleScreen}
              options={{ title: 'Requerimiento' }}
            />
            <Stack.Screen name="Ajustes" component={AjustesScreen} options={{ title: 'Ajustes' }} />
          </>
        ) : (
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
