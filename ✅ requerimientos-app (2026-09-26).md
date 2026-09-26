# requerimientos-app

> **Proyecto hermano de la web `Requerimientos`** (`E:\DESCARGAS\PROYECTOS VS\✅ Requerimientos\web`, repo `AndreDiaz11/pedidos-panel`, dominio `reqdiseno.com`). Comparten **solo el backend**: esta app es un cliente de la API del Worker. No tiene base de datos propia.
>
> **Carpeta local:** desde el 2026-09-11 vive en `E:\DESCARGAS\PROYECTOS VS\✅ Requerimientos\app` — se unificó con la web hermana bajo una sola carpeta padre `✅ Requerimientos` (antes eran dos carpetas top-level separadas que se veían duplicadas). Solo reorganización local del disco; el repo, el remoto (`AndreDiaz11/requerimientos-app`) y las Releases no cambiaron.

## Qué es
App Android (React Native) para el equipo de diseño de Tecsup. Muestra el mismo tablero de requerimientos que `reqdiseno.com`, en el celular, y **avisa por notificación push** cuando alguien registra un requerimiento nuevo. Es **solo lectura**: ver el tablero y el detalle. Registrar, editar y cambiar estado se siguen haciendo en la web. **Desde la v1.1.0 se ingresa con el correo + un código de 6 dígitos** y cada persona ve **solo los requerimientos asignados a ella**.

## Cómo se ve y funciona
- **Ingreso (desde v1.1.0):** al abrir sin sesión sale `LoginScreen`: se escribe el correo → el servidor envía un código de 6 dígitos (vence en 15 min) → se escribe en 6 casillas (auto-envía al completar; reenvío tras 60 s; "Cambiar correo"). Si el correo no está registrado la app no lo revela. La sesión (token de 64 hex, 180 días en el servidor) se guarda en AsyncStorage; si el servidor responde 401 se vuelve al ingreso. Personas y correos se gestionan en el `/admin` de la web.
- **Tablero** (pantalla inicial): lista de requerimientos agrupada por mes de registro (los 2 meses más recientes abiertos, el resto colapsado). Cada fila: pill de estado, descripción, chips (unidad azul · tipo gris), avatar del solicitante, conteo de enlaces/adjunto, y fecha de entrega con color por urgencia + texto relativo ("en 3 días", "venció ayer"). Barra de filtros arriba: buscador (descripción/unidad/solicitante/tipo/comentario) + chips de estado. Deslizar hacia abajo para refrescar.
- **Detalle**: se abre al tocar una fila (o al tocar la notificación push). Todos los campos del requerimiento: estado, descripción, unidad, tipo, solicitante, fecha de entrega con urgencia, fecha de registro, comentario, enlaces de apoyo (referencia/recursos/carpeta/descarga) que abren en el navegador, y el archivo adjunto (abre `reqdiseno.com/api/adjuntos/...`).
- **Ajustes** (ícono de engranaje en la cabecera): sesión iniciada (nombre + correo) con **Cerrar sesión** (da de baja el teléfono del push, revoca el token en el servidor y vuelve al ingreso), interruptor de avisos push (registra/da de baja el token FCM en el backend), botón "Buscar actualización", enlace a `reqdiseno.com`, número de versión.
- **Notificación push**: al registrarse un requerimiento, el Worker manda un FCM **solo a los teléfonos de la persona asignada** (cada teléfono se liga a la persona al ingresar). Título "Nuevo requerimiento · <solicitante>", cuerpo con descripción + entrega. Tocarla abre el detalle de ese requerimiento (usa `data.url` = id).
- **Actualización**: al abrir, la app consulta el último GitHub Release; si hay versión nueva, popup "Ahora no / Actualizar" que descarga el APK y lanza el instalador nativo. Tras actualizar, popup "Novedades" (una sola vez) con la lista de cambios en lenguaje simple.

Diseño: adaptación móvil del lenguaje visual de la web (azul `#0073ea`, fondo `#f6f7fb`, mismas pills de estado y chips), con patrones nativos de Android (SectionList, RefreshControl, cabecera azul). Icono propio (portapapeles + check sobre azul de marca, mismo estilo que Z Fondo / Z Tempo). En el cajón de apps de Android aparece como **"Z Requerimientos"** (prefijo "Z" para que quede al final de la lista, convención del usuario). Fechas en horario de Perú (UTC-5 fijo, sin DST). Solo español neutral.

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
✅ Requerimientos/app/             (repo: AndreDiaz11/requerimientos-app, PÚBLICO — ver Auto-actualización)
├── requerimientos-app.apk          compilado más reciente (lo baja el usuario del Release; gitignored)
├── ✅ requerimientos-app (2026-09-26).md   esta doc (copia idéntica en #Documentations/)
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
    │   │   ├── constantes.ts       ESTADOS + colores (copiados de la web)
    │   │   ├── tipos.ts            interface Pedido
    │   │   ├── formato.ts          fechas en Perú (offset fijo -5h) · urgencia · relativo · meses · iniciales
    │   │   ├── agrupar.ts          agrupa pedidos por mes de registro (misma lógica que la web)
    │   │   ├── novedades.ts        changelog para el usuario final por versión + novedadesDesde()
    │   │   └── theme.ts            tokens visuales (T) y radios (R)
    │   ├── api/acceso.ts (pedirCodigo · verificarCodigo · cerrarSesionServidor) · api/pedidos.ts          GET /api/pedidos · GET /api/pedidos/[id] · urlAdjunto()
    │   ├── services/
    │   │   ├── pushNotifications.ts  permiso, token, registrar, onMessage/onNotificationOpenedApp/getInitialNotification, deep-link
    │   │   ├── sesion.ts             cerrarSesionCompleta() (baja del push + revoca token + limpia sesión)
    │   │   ├── fcmRegistro.ts        POST /api/fcm/registrar · POST /api/fcm/baja
    │   │   ├── updateChecker.ts      GET releases/latest de GitHub + comparación de versión
    │   │   └── apkInstaller.ts       descarga el APK y lanza actionViewIntent
    │   ├── store/ajustesStore.ts   pushHabilitado + versionVista (AsyncStorage)
    │   ├── store/sesionStore.ts    token + persona + correo de la sesión (AsyncStorage)
    │   ├── navigation/
    │   │   ├── navigationRef.ts    ref + abrirPedido()/consumirPedidoPendiente() para el deep-link del push
    │   │   └── RootNavigator.tsx   sin sesión: Login ; con sesión: Tablero → Detalle ; Ajustes
    │   ├── screens/  LoginScreen · TableroScreen · DetalleScreen · AjustesScreen
    │   ├── components/  EstadoPill · Chip · Avatar · FilaPedido · GrupoMes · FiltrosBar
    │   │                · MensajeEstado · UpdateDialog · NovedadesDialog
    │   └── hooks/usePedidos.ts     carga + refresco del listado
    └── android/  (applicationId com.reqdiseno.app · google-services.json · versionName derivado de package.json
                   · strings.xml app_name = "Z Requerimientos" · mipmaps ic_launcher/ic_launcher_round propios)
```

## Archivos clave
- `src/services/pushNotifications.ts` — todo el ciclo del push: pide permiso (Android 13+ vía notifee), crea el canal `requerimientos`, obtiene el token FCM y lo registra en el backend si el usuario tiene los avisos activados, re-registra en `onTokenRefresh`, muestra la notificación en primer plano con notifee, y resuelve el deep-link al detalle desde los 3 orígenes (primer plano, segundo plano, arranque en frío).
- `src/lib/formato.ts` — fechas en horario de Perú con **offset fijo de -5h** (Perú no tiene horario de verano), sin depender de `Intl` (poco fiable en Hermes). Espeja `formato.ts` de la web.
- `android/app/build.gradle` — `versionName` se deriva de `package.json` (fuente única de verdad) para que el chequeo de actualizaciones nunca quede desincronizado del build nativo (mismo patrón que Pulse, que tuvo ese bug en v1.16.6). Config de firma de release por `-PRELEASE_*` (secrets del workflow).
- `src/navigation/navigationRef.ts` — permite navegar al detalle desde el servicio de push aunque el `NavigationContainer` todavía no esté montado (guarda el id pendiente y lo consume en `onReady`).

## Instalar y correr
Dentro de `✅ Requerimientosppproject` (requiere Android SDK + emulador/dispositivo, que **no** están en la PC actual — el build real es en CI):
```
npm install
npm run tsc          # chequeo de tipos (pasa limpio)
npm run android      # solo si hay SDK + dispositivo
```
El APK firmado lo produce GitHub Actions al crear un tag `vX.Y.Z`.

## Env vars
Ninguna secreta en el cliente. `API_BASE` (`https://reqdiseno.com`) y `google-services.json` (config de Firebase Android, no secreta) van en el repo.
La sesión del usuario (token) vive en AsyncStorage del teléfono; nunca en el repo.
**GitHub Actions Secrets** (repo `AndreDiaz11/requerimientos-app`): `ANDROID_KEYSTORE_BASE64`, `ANDROID_KEYSTORE_PASSWORD`, `ANDROID_KEY_ALIAS` (`requerimientos`), `ANDROID_KEY_PASSWORD`.

## Auto-actualización
Sí, vía GitHub Releases — repo `AndreDiaz11/requerimientos-app`. `updateChecker.ts` consulta `releases/latest`; si hay versión nueva, `UpdateDialog` descarga el APK (`apkInstaller.ts`, permiso `REQUEST_INSTALL_PACKAGES`) y lanza el instalador nativo. `versionName` de Gradle = `package.json.version` (fuente única). CI con cache de Gradle + npm; `warm-cache.yml` deja el cache bajo el scope de `main` para que el `release.yml` (que solo corre en tags) lo reuse.

**El repo es PÚBLICO a propósito** — excepción justificada a la regla 20 (repos privados por defecto): la app hace `fetch` sin autenticación a `api.github.com/repos/.../releases/latest` y a `browser_download_url` del APK, y ambos dan 404 en un repo privado. Mismo caso que Pulse y Fondo (públicos). El repo no tiene nada sensible: sin claves ni keystore de release (gitignored + GitHub Secrets), `google-services.json` es config de cliente de Firebase (no secreta), la API es pública. El `debug.keystore` rastreado es el estándar de todo scaffold de React Native (clave conocida, no sirve para firmar releases).

## Novedades para el usuario
Sí — popup tipo WhatsApp una sola vez tras cada actualización (`NovedadesDialog`, `src/lib/novedades.ts`). La app se comparte con el equipo de diseño. El texto de cada versión se agrega a `NOVEDADES` en `novedades.ts` (redactado para el usuario final, no el técnico).

## Despliegue
Repo **público** con los 4 secrets de firma cargados. Releases `v1.0.0`, `v1.0.1`, `v1.0.2` y `v1.1.0` publicados por tag. **La v1.0.x ya no carga datos** (el listado exige sesión): hay que actualizar a 1.1.0. Distribución: **APK directo** entre el equipo de diseño (no Play Store por ahora — pendiente de decidir en una etapa de despliegue futura); de la v1.0.0 en adelante las actualizaciones llegan solas por el chequeo de Releases. El backend (Worker de `reqdiseno.com`) ya está en producción con las rutas `/api/app/{codigo,verificar,salir}`, `/api/fcm/{registrar,baja}` y el envío FCM por persona.

## Claves secretas
Ninguna en el cliente. El keystore de firma y su contraseña viven en `secretos/` (gitignored) y en GitHub Actions Secrets; copia cifrada en `#Documentations/Claude Code Backup/env-backups/requerimientos-app.7z` (contraseña entregada al usuario una sola vez, no escrita en ningún archivo del repo). El envío del push (cuenta de servicio de Firebase) es un secret del **Worker web**, no de esta app — la app solo **recibe**.

## Estado
**PROYECTO CERRADO AL 100% (2026-09-10).** Funcional: sí | En producción: sí (APK directo al equipo) | Verificado en dispositivo real por el usuario, incluida la **auto-actualización** (v1.0.0 → v1.0.1 llegó sola tras hacer el repo público). Sin pendientes.
`v1.0.2` publicada y verificada (2026-09-11): ícono recoloreado a `#003AC1`. **`v1.1.0` publicada y verificada por el usuario (2026-09-26):** ingreso por código, lista por persona y push por persona. `tsc --noEmit` y `eslint` limpios. Pendiente menor: el correo de Claudett en el `/admin` de la web (sin él no puede ingresar).

## Integraciones externas
- **API del Worker de `reqdiseno.com`** — `POST /api/app/{codigo,verificar,salir}` (ingreso), `GET /api/pedidos` y `GET /api/pedidos/[id]` (Bearer, solo lo de la persona), `POST /api/fcm/registrar` (Bearer) y `/baja`, `GET /api/adjuntos/...` (público, la clave del objeto es el secreto). No se escribe nada de la base desde la app (el ingreso solo crea códigos/sesiones en el servidor).
- **Firebase Cloud Messaging** — proyecto `requerimientos-d1a62`, app Android `com.reqdiseno.app`. La app solo obtiene el token y lo registra; el envío lo hace el Worker.
- **GitHub Releases** — auto-actualización.

## Escalabilidad
- Nueva pantalla: `src/screens/`, registrarla en `RootNavigator.tsx` (+ en `RootStackParams` de `navigationRef.ts`).
- Nueva opción de unidad/tipo/solicitante: no requiere nada aquí — la app solo muestra el texto guardado en cada pedido (esas listas se editan en el `/admin` de la web y la app no las usa).
- Nuevo estado: reflejar el cambio de la web en `src/lib/constantes.ts` (deben coincidir con `reqdiseno.com`).
- Nuevo campo del requerimiento: agregarlo a `interface Pedido` (`tipos.ts`) + mostrarlo en `DetalleScreen.tsx` y/o `FilaPedido.tsx`.
- Texto de "Novedades" de una versión: entrada nueva en `NOVEDADES` (`novedades.ts`).
- Si la app pasara a escribir (registrar/editar): agregar funciones a `src/api/pedidos.ts` contra `POST/PUT/PATCH /api/pedidos[/id]` y pantallas de formulario.

## Compatibilidad
Solo Android (`minSdk 24`, `targetSdk 36`). Edge-to-edge activado; los insets se respetan con `react-native-safe-area-context`.

## Datos de prueba
No aplica — opera sobre los datos reales del tablero de `reqdiseno.com` (solo lectura).

## Versión
1.1.0 — ingreso con código de 6 dígitos por correo, lista y avisos por persona, cerrar sesión. 1.0.2 — ícono recoloreado a `#003AC1` para combinar con Fondo/Tempo/VaultSync.

## Snapshots
- Ninguno (proyecto nuevo, cerrado en su primera semana).

## Cómo retomar
Carpeta: `E:\DESCARGAS\PROYECTOS VS\✅ Requerimientos\app`. Para tocar código: `cd project && npm install && npm run tsc && npm run lint` (borrar `node_modules` al terminar si no se necesita). Para publicar una versión: subir `version` en `project/package.json`, `npm install --package-lock-only`, agregar la entrada a `src/lib/novedades.ts`, commit + `git tag vX.Y.Z` + `git push origin main --tags` → CI compila el APK firmado y lo publica en Releases; los celulares con la app se actualizan solos al abrirla. El keystore vive en `secretos/` (gitignored) y en GitHub Secrets; backup en `#Documentations/Claude Code Backup/env-backups/requerimientos-app.7z`. No hay dev server que matar (build solo en CI).

## Cambios
- 2026-09-26 — **(v1.1.0) Ingreso por código y lista por persona.** Nuevo `LoginScreen` (correo → código de 6 dígitos en 6 casillas), `sesionStore`, `api/acceso.ts`, `services/sesion.ts`; `api/pedidos.ts` y `fcmRegistro.ts` mandan `Authorization: Bearer`; 401 → se limpia la sesión y vuelve al ingreso; `RootNavigator` muestra `Login` o el stack normal, y el deep-link del push espera a que haya sesión; Ajustes con "Cerrar sesión"; el título del tablero incluye el nombre de la persona. `Pedido` gana `asignadoA`. Entrada nueva en `NOVEDADES`. Backend en la web (personas, `/api/app/*`, filtro por persona). Tag `v1.1.0`, CI compiló el APK y publicó el Release. La app sigue siendo solo lectura. `tsc` y `eslint` limpios (no se puede ejecutar en la PC: sin Android SDK; verificada en el teléfono del usuario).
- 2026-09-23 — **Papelera de 24 h en la web (sin cambios en la app).** Los requerimientos eliminados en la web pasan 24 h en una papelera y `GET /api/pedidos[/id]` ya no los devuelve, así que desaparecen del tablero de la app solos; si se restauran, vuelven a aparecer. No requiere release.
- 2026-09-23 — **Auditoría de cierre.** Eliminado código muerto: `UNIDADES_NEGOCIO`/`TIPOS`/`SOLICITANTES` (sin uso y ya obsoletos, esas listas ahora se editan en el `/admin` de la web), `recortar` (`formato.ts`) y `R` (`theme.ts`). `tsc --noEmit` y `eslint` limpios. Sin cambio funcional ni versión nueva (no requiere release; los cambios entran en el próximo build).
- 2026-09-23 — **Backup cifrado regenerado.** La contraseña del `.7z` anterior en `env-backups/` se perdió (auditoría general de contraseñas de backups); se generó una contraseña nueva al azar y se volvió a comprimir `secretos/` (keystore + su contraseña + `google-services.json`) con ella. Sin cambios de código ni de claves del keystore en sí — solo se rotó la contraseña de acceso al backup.
- 2026-09-11 — **Carpeta unificada.** Esta carpeta y la de la web hermana (`✅ Requerimientos`) eran dos carpetas top-level separadas y se veían como duplicadas; se movieron bajo `✅ Requerimientos\` con subcarpetas `web\` y `app\` (esta). Solo mueve de carpeta local — repo, remoto y Releases sin cambios.
- 2026-09-11 — **(v1.0.2) Ícono recoloreado.** Fondo del ícono de `#0073ea` (celeste del panel web) a `#003AC1` (el azul de marca que ya usan Fondo/Tempo/VaultSync), en las 5 densidades y variantes normal/round. Recolor directo sobre los PNG existentes (interpolación entre azul viejo y blanco), sin regenerar desde el logo. Entrada nueva en `NOVEDADES`. Tag `v1.0.2` publicado, Release con APK firmado, verificado que el workflow terminó en éxito. Sin cambios funcionales.
- 2026-09-10 — **Proyecto cerrado al 100%.** Verificado en dispositivo (app + auto-actualización). Limpieza de cierre en `main`: `eslint` sin warnings (import sin usar en `GrupoMes`, hash sin bitwise en `Avatar`, separador de lista y botón de header hoisteados), quitado `project/.bundle` (config de CocoaPods, solo iOS). Carpeta renombrada a `✅ requerimientos-app`, doc con fecha en el nombre.
- 2026-09-10 — **Repo cambiado a PÚBLICO.** La auto-actualización no funcionaba con el repo privado (la API de Releases y la descarga del APK dan 404 sin token). Ahora `api.github.com/.../releases/latest` y el `browser_download_url` responden 200 sin auth → la v1.0.0 instalada ya ve la v1.0.1. Excepción justificada a la regla 20, igual que Pulse/Fondo. Verificado que el repo no expone nada sensible.
- 2026-09-10 — (v1.0.1) Icono propio (portapapeles + check sobre azul `#0073ea`, generado con `sharp` a partir del logo de la web, mismo estilo que Z Fondo / Z Tempo) en todas las densidades (`ic_launcher` + `ic_launcher_round`). `strings.xml` `app_name` → **"Z Requerimientos"** para que la app quede al final del cajón de apps. Entrada nueva en `NOVEDADES`. Sin cambios funcionales.
- 2026-09-10 — (v1.0.0) **Creación del proyecto (Parte B de Requerimientos).** App Android React Native, solo lectura + push. Scaffold RN 0.81.4 con package `com.reqdiseno.app`; `lib` (config, constantes, tipos, formato, agrupar, novedades, theme) portado/adaptado de la web; `api/pedidos.ts`; servicios de push FCM (con deep-link al detalle desde los 3 orígenes), registro/baja del token, updateChecker y apkInstaller; `ajustesStore` (zustand + AsyncStorage); navegación stack de 3 pantallas (Tablero, Detalle, Ajustes); componentes visuales (EstadoPill, Chip, Avatar, FilaPedido, GrupoMes, FiltrosBar, MensajeEstado, UpdateDialog, NovedadesDialog). Android: plugin google-services, `google-services.json`, permisos POST_NOTIFICATIONS/REQUEST_INSTALL_PACKAGES, `versionName` derivado de `package.json`, firma de release por secrets. Workflows `release.yml` + `warm-cache.yml` (con cache de Gradle/npm). Repo `AndreDiaz11/requerimientos-app` (creado privado, luego cambiado a público — ver cambio del mismo día), keystore nuevo generado (backup `.7z` en `#Documentations/Claude Code Backup/env-backups/`), 4 secrets cargados, tag `v1.0.0`. `tsc --noEmit` limpio.
