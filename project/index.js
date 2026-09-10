/**
 * @format
 */

import { AppRegistry } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import notifee from '@notifee/react-native';
import App from './App';
import { name as appName } from './app.json';

messaging().setBackgroundMessageHandler(async () => {
  // El payload trae 'notification', así que Android muestra el aviso solo
  // cuando la app está en segundo plano. Nada que hacer aquí.
});

notifee.onBackgroundEvent(async () => {
  // El toque en segundo plano lo resuelve messaging().onNotificationOpenedApp
  // / getInitialNotification al abrir la app.
});

AppRegistry.registerComponent(appName, () => App);
