import React from 'react';
import { Pressable } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { T } from '../lib/theme';
import { navigationRef, consumirPedidoPendiente, RootStackParams } from './navigationRef';
import { TableroScreen } from '../screens/TableroScreen';
import { DetalleScreen } from '../screens/DetalleScreen';
import { AjustesScreen } from '../screens/AjustesScreen';

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

export function RootNavigator() {
  return (
    <NavigationContainer ref={navigationRef} theme={navTheme} onReady={consumirPedidoPendiente}>
      <Stack.Navigator screenOptions={headerOptions}>
        <Stack.Screen
          name="Tablero"
          component={TableroScreen}
          options={({ navigation }) => ({
            title: 'Requerimientos',
            headerRight: () => (
              <Pressable onPress={() => navigation.navigate('Ajustes')} hitSlop={12}>
                <Icon name="settings" size={22} color="#ffffff" />
              </Pressable>
            ),
          })}
        />
        <Stack.Screen name="Detalle" component={DetalleScreen} options={{ title: 'Requerimiento' }} />
        <Stack.Screen name="Ajustes" component={AjustesScreen} options={{ title: 'Ajustes' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
