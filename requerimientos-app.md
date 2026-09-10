# requerimientos-app

> **Proyecto hermano de la web `Requerimientos`** (`E:\DESCARGAS\PROYECTOS VS\✅ Requerimientos`, repo `AndreDiaz11/pedidos-panel`, dominio `reqdiseno.com`). Comparten **solo el backend**: esta app es un cliente de la API del Worker. No tiene base de datos propia.

## Qué es
App Android (React Native) para el equipo de diseño de Tecsup. Muestra el mismo tablero de requerimientos que `reqdiseno.com`, en el celular, y **avisa por notificación push** cuando alguien registra un requerimiento nuevo. Es **solo lectura**: ver el tablero y el detalle. Registrar, editar y cambiar estado se siguen haciendo en la web.

## Cómo se ve y funciona
- **Tablero** (pantalla inicial): lista de requerimientos agrupada por mes de registro (los 2 meses más recientes abiertos, el resto colapsado). Cada fila: pill de estado, descripción, chips (unidad azul · tipo gris), avatar del solicitante, conteo de enlaces/adjunto, y fecha de entrega con color por urgencia + texto relativo ("en 3 días", "venció ayer"). Barra de filtros arriba: buscador (descripción/unidad/solicitante/tipo/comentario) + chips de estado. Deslizar hacia abajo para refrescar.
- **Detalle**: se abre al tocar una fila (o al tocar la notificación push). Todos los campos del requerimiento: estado, descripción, unidad, tipo, solicitante, fecha de entrega con urgencia, fecha de registro, comentario, enlaces de apoyo (referencia/recursos/carpeta/descarga) que abren en el navegador, y el archivo adjunto (abre `reqdiseno.com/api/adjuntos/...`).
- **Ajustes** (ícono de engranaje en la cabecera): interruptor de avisos push (registra/da de baja el token FCM en el backend), botón "Buscar actualización", enlace a `reqdiseno.com`, número de versión.
- **Notificación push**: al registrarse un requerimiento, el Worker manda un FCM a todos los dispositivos. Título "Nuevo requerimiento · <solicitante>", cuerpo con descripción + entrega. Tocarla abre el detalle de ese requerimiento (usa `data.url` = id).
- **Actualización**: al abrir, la app consulta el último GitHub Release; si hay versión nueva, popup "Ahora no / Actualizar" que descarga el APK y lanza el instalador nativo. Tras actualizar, popup "Novedades" (una sola vez) con la lista de cambios en lenguaje simple.

Diseño: adaptación móvil del lenguaje visual de la web (azul `#0073ea`, fondo `#f6f7fb`, mismas pills de estado y chips), con patrones nativos de Android (SectionList, RefreshControl, cabecera azul). Fechas en horario de Perú (UTC-5 fijo, sin DST). Solo español neutral.

## Stack
- **React Native 0.81.4** (TypeScript, New Architecture/Fabric, Hermes) — solo Android. Versiones idénticas a **Pulse** (Gradle 8.14.3, `compileSdk`/`targetSdk` 36, `minSdk` 24, `com.google.gms:google-services:4.4.4`) — stack ya probado en esta PC y en CI.
- **@react-native-firebase/app + /messaging** (v23) — recepción del push FCM. Excepción justificada a la tabla del protocolo: FCM es la única vía de push a Android nativo (igual que en Pulse y en el proyecto web).
- **@notifee/react-native** (v9) — mostrar la notificación en primer plano y manejar el toque; canal `requerimientos` (mismo `channel_id` que envía el Worker).
- **@react-navigation/native + native-stack** (v7) — navegación (3 pantallas).
- **zustand** + **@react-native-async-storage/async-storage** — preferencia de push + última versión de "Novedades" vista (local por dispositivo).
- **react-native-blob-util** — descarga del APK de actualización.
- **react-native-vector-icons** (MaterialIcons) — iconografía.
- **Sin backend propio, sin Supabase, sin base de datos.** La API es la del Worker de `reqdiseno.com`. Excepción justificada a las reglas 19 y 22 del protocolo (registro de errores y revisión diaria): las tiene el proyecto web, no esta app.

## Estructura
```
requerimientos-app/                 (repo: AndreDiaz11/requerimientos-app, privado)
├── requerimientos-app.apk          compilado más reciente (lo baja el usuario del Release; gitignored)
├── requerimientos-app.md           esta doc (copia idéntica en #Documentations/)
├── .github/workflows/
│   ├── release.yml                 tag v* → APK firmado → GitHub Release
│   └── warm-cache.yml              precalienta cache de Gradle/npm en cada push a main
├── secretos/                       (gitignored) keystore + su contraseña + copia de google-services.json
└── project/
    ├── App.tsx                     arranque: carga ajustes, init push, chequeo de update, popup Novedades
    ├── index.js                    setBackgroundMessageHandler + onBackgroundEvent + registro del componente
    ├── app.json · package.json (versión = fuente única) · babel/metro/tsconfig
    ├── src/
    │   ├── lib/
    │   │   ├── config.ts           API_BASE=https://reqdiseno.com · GITHUB_REPO · CANAL_NOTIFICACIONES
    │   │   ├── constantes.ts       ESTADOS + colores · UNIDADES_NEGOCIO · TIPOS · SOLICITANTES (copiados de la web)
    │   │   ├── tipos.ts            interface Pedido
    │   │   ├── formato.ts          fechas en Perú (offset fijo -5h) · urgencia · relativo · meses · iniciales
    │   │   ├── agrupar.ts          agrupa pedidos por mes de registro (misma lógica que la web)
    │   │   ├── novedades.ts        changelog para el usuario final por versión + novedadesDesde()
    │   │   └── theme.ts            tokens visuales (T) y radios (R)
    │   ├── api/pedidos.ts          GET /api/pedidos · GET /api/pedidos/[id] · urlAdjunto()
    │   ├── services/
    │   │   ├── pushNotifications.ts  permiso, token, registrar, onMessage/onNotificationOpenedApp/getInitialNotification, deep-link
    │   │   ├── fcmRegistro.ts        POST /api/fcm/registrar · POST /api/fcm/baja
    │   │   ├── updateChecker.ts      GET releases/latest de GitHub + comparación de versión
    │   │   └── apkInstaller.ts       descarga el APK y lanza actionViewIntent
    │   ├── store/ajustesStore.ts   pushHabilitado + versionVista (AsyncStorage)
    │   ├── navigation/
    │   │   ├── navigationRef.ts    ref + abrirPedido()/consumirPedidoPendiente() para el deep-link del push
    │   │   └── RootNavigator.tsx   stack: Tablero → Detalle ; Ajustes
    │   ├── screens/  TableroScreen · DetalleScreen · AjustesScreen
    │   ├── components/  EstadoPill · Chip · Avatar · FilaPedido · GrupoMes · FiltrosBar
    │   │                · MensajeEstado · UpdateDialog · NovedadesDialog
    │   └── hooks/usePedidos.ts     carga + refresco del listado
    └── android/  (applicationId com.reqdiseno.app · google-services.json · versionName derivado de package.json)
```

## Archivos clave
- `src/services/pushNotifications.ts` — todo el ciclo del push: pide permiso (Android 13+ vía notifee), crea el canal `requerimientos`, obtiene el token FCM y lo registra en el backend si el usuario tiene los avisos activados, re-registra en `onTokenRefresh`, muestra la notificación en primer plano con notifee, y resuelve el deep-link al detalle desde los 3 orígenes (primer plano, segundo plano, arranque en frío).
- `src/lib/formato.ts` — fechas en horario de Perú con **offset fijo de -5h** (Perú no tiene horario de verano), sin depender de `Intl` (poco fiable en Hermes). Espeja `formato.ts` de la web.
- `android/app/build.gradle` — `versionName` se deriva de `package.json` (fuente única de verdad) para que el chequeo de actualizaciones nunca quede desincronizado del build nativo (mismo patrón que Pulse, que tuvo ese bug en v1.16.6). Config de firma de release por `-PRELEASE_*` (secrets del workflow).
- `src/navigation/navigationRef.ts` — permite navegar al detalle desde el servicio de push aunque el `NavigationContainer` todavía no esté montado (guarda el id pendiente y lo consume en `onReady`).

## Instalar y correr
Dentro de `project/` (requiere Android SDK + emulador/dispositivo, que **no** están en la PC actual — el build real es en CI):
```
npm install
npm run tsc          # chequeo de tipos (pasa limpio)
npm run android      # solo si hay SDK + dispositivo
```
El APK firmado lo produce GitHub Actions al crear un tag `vX.Y.Z`.

## Env vars
Ninguna secreta en el cliente. `API_BASE` (`https://reqdiseno.com`) y `google-services.json` (config de Firebase Android, no secreta) van en el repo.
**GitHub Actions Secrets** (repo `AndreDiaz11/requerimientos-app`): `ANDROID_KEYSTORE_BASE64`, `ANDROID_KEYSTORE_PASSWORD`, `ANDROID_KEY_ALIAS` (`requerimientos`), `ANDROID_KEY_PASSWORD`.

## Auto-actualización
Sí, vía GitHub Releases — repo `AndreDiaz11/requerimientos-app`. `updateChecker.ts` consulta `releases/latest`; si hay versión nueva, `UpdateDialog` descarga el APK (`apkInstaller.ts`, permiso `REQUEST_INSTALL_PACKAGES`) y lanza el instalador nativo. `versionName` de Gradle = `package.json.version` (fuente única). CI con cache de Gradle + npm; `warm-cache.yml` deja el cache bajo el scope de `main` para que el `release.yml` (que solo corre en tags) lo reuse.

## Novedades para el usuario
Sí — popup tipo WhatsApp una sola vez tras cada actualización (`NovedadesDialog`, `src/lib/novedades.ts`). La app se comparte con el equipo de diseño. El texto de cada versión se agrega a `NOVEDADES` en `novedades.ts` (redactado para el usuario final, no el técnico).

## Despliegue
Repo creado y con los 4 secrets cargados. Primer Release (`v1.0.0`) disparado por tag. Distribución: **APK directo** entre el equipo de diseño (no Play Store por ahora — pendiente de decidir en una etapa de despliegue futura). El backend (Worker de `reqdiseno.com`) ya está en producción con las rutas `/api/fcm/{registrar,baja}` y el envío FCM verificado.

## Claves secretas
Ninguna en el cliente. El keystore de firma y su contraseña viven en `secretos/` (gitignored) y en GitHub Actions Secrets; copia cifrada en `#Documentations/Claude Code Backup/env-backups/requerimientos-app.7z` (contraseña entregada al usuario una sola vez, no escrita en ningún archivo del repo). El envío del push (cuenta de servicio de Firebase) es un secret del **Worker web**, no de esta app — la app solo **recibe**.

## Estado
Funcional: por verificar en dispositivo | Beta: sí (v1.0.0) | Última revisión: 2026-09-10 — creación del proyecto (Parte B de Requerimientos). Scaffold RN 0.81.4, package `com.reqdiseno.app`, 3 pantallas, push FCM con deep-link, auto-update + Novedades, repo + CI + keystore. `tsc --noEmit` pasa limpio. **Falta:** verificación visual en un dispositivo Android real (no hay SDK/emulador en la PC — mismo caso que Pulse, lo verifica el usuario).

## Integraciones externas
- **API del Worker de `reqdiseno.com`** — `GET /api/pedidos`, `GET /api/pedidos/[id]`, `POST /api/fcm/registrar`, `POST /api/fcm/baja`, `GET /api/adjuntos/...`. Sin autenticación (la web tampoco tiene). No se escribe nada de la base desde la app.
- **Firebase Cloud Messaging** — proyecto `requerimientos-d1a62`, app Android `com.reqdiseno.app`. La app solo obtiene el token y lo registra; el envío lo hace el Worker.
- **GitHub Releases** — auto-actualización.

## Escalabilidad
- Nueva pantalla: `src/screens/`, registrarla en `RootNavigator.tsx` (+ en `RootStackParams` de `navigationRef.ts`).
- Nueva opción de unidad/tipo/solicitante o nuevo estado: reflejar el cambio de la web en `src/lib/constantes.ts` (deben coincidir con `reqdiseno.com`).
- Nuevo campo del requerimiento: agregarlo a `interface Pedido` (`tipos.ts`) + mostrarlo en `DetalleScreen.tsx` y/o `FilaPedido.tsx`.
- Texto de "Novedades" de una versión: entrada nueva en `NOVEDADES` (`novedades.ts`).
- Si la app pasara a escribir (registrar/editar): agregar funciones a `src/api/pedidos.ts` contra `POST/PUT/PATCH /api/pedidos[/id]` y pantallas de formulario.

## Compatibilidad
Solo Android (`minSdk 24`, `targetSdk 36`). Edge-to-edge activado; los insets se respetan con `react-native-safe-area-context`.

## Datos de prueba
No aplica — opera sobre los datos reales del tablero de `reqdiseno.com` (solo lectura).

## Versión
1.0.0 — primera versión.

## Snapshots
- Ninguno (proyecto nuevo).

## Cambios
- 2026-09-10 — (v1.0.0) **Creación del proyecto (Parte B de Requerimientos).** App Android React Native, solo lectura + push. Scaffold RN 0.81.4 con package `com.reqdiseno.app`; `lib` (config, constantes, tipos, formato, agrupar, novedades, theme) portado/adaptado de la web; `api/pedidos.ts`; servicios de push FCM (con deep-link al detalle desde los 3 orígenes), registro/baja del token, updateChecker y apkInstaller; `ajustesStore` (zustand + AsyncStorage); navegación stack de 3 pantallas (Tablero, Detalle, Ajustes); componentes visuales (EstadoPill, Chip, Avatar, FilaPedido, GrupoMes, FiltrosBar, MensajeEstado, UpdateDialog, NovedadesDialog). Android: plugin google-services, `google-services.json`, permisos POST_NOTIFICATIONS/REQUEST_INSTALL_PACKAGES, `versionName` derivado de `package.json`, firma de release por secrets. Workflows `release.yml` + `warm-cache.yml` (con cache de Gradle/npm). Repo privado `AndreDiaz11/requerimientos-app`, keystore nuevo generado (backup `.7z` en `#Documentations/Claude Code Backup/env-backups/`), 4 secrets cargados, tag `v1.0.0`. `tsc --noEmit` limpio.
