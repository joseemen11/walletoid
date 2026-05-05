# OID4VCI Wallet PoC

## Descripción

Aplicación móvil de prueba construida con Expo y React Native para validar el
flujo básico de una wallet de credenciales verificables. La app permite
procesar `credential_offer`, escanear QR, recibir credenciales desde flujos
controlados y almacenarlas localmente en `expo-secure-store`.

El proyecto incluye modo mock para pruebas sin backend, modo real para
conectarse a un issuer OID4VCI compatible y un flujo demo LACChain basado en
los endpoints `/new-did` y `/new-vc`.

## Requisitos

- Node.js
- npm
- Expo CLI vía `npx`
- Expo Go o emulador Android/iOS

## Instalación

```bash
npm install
```

## Variables de entorno

```env
EXPO_PUBLIC_ISSUANCE_MODE=mock
EXPO_PUBLIC_OID4VCI_ISSUER_BASE_URL=
EXPO_PUBLIC_LACCHAIN_DEMO_ISSUER_BASE_URL=https://bcc6xd8m-3000.brs.devtunnels.ms
```

- `EXPO_PUBLIC_ISSUANCE_MODE=mock`: usa flujo simulado.
- `EXPO_PUBLIC_ISSUANCE_MODE=real`: usa issuer OID4VCI configurado.
- `EXPO_PUBLIC_OID4VCI_ISSUER_BASE_URL`: base URL del issuer real.
- `EXPO_PUBLIC_LACCHAIN_DEMO_ISSUER_BASE_URL`: backend demo LACChain.

## Ejecución

```bash
npx expo start -c
```

Opcionales:

```bash
npm run android
npm run ios
npm run web
```

## Flujos disponibles

### 1. Flujo mock OID4VCI

1. Configurar `EXPO_PUBLIC_ISSUANCE_MODE=mock`.
2. Abrir la pantalla Demo.
3. Usar el offer de prueba.
4. Procesar offer.
5. Reclamar credencial.
6. Ver credencial en Wallet.

### 2. Flujo con QR

1. Abrir Demo.
2. Tocar `Escanear QR`.
3. Escanear un QR con un `credential_offer`.
4. Procesar y reclamar credencial.
5. Ver credencial en Wallet.

### 3. Flujo con issuer real OID4VCI

1. Configurar `EXPO_PUBLIC_ISSUANCE_MODE=real`.
2. Configurar `EXPO_PUBLIC_OID4VCI_ISSUER_BASE_URL`.
3. Reiniciar Expo.
4. Pegar o escanear un `credential_offer` real.
5. Reclamar credencial.
6. Ver credencial en Wallet.

Requiere un backend compatible con OID4VCI.

### 4. Flujo demo LACChain

1. Configurar `EXPO_PUBLIC_LACCHAIN_DEMO_ISSUER_BASE_URL`.
2. Abrir Demo.
3. Tocar `Emitir VC demo LACChain`.
4. Esperar emisión.
5. Ver credencial en Wallet.

Este flujo usa endpoints propios `/new-did` y `/new-vc`, y no reemplaza el
flujo OID4VCI estándar.

## Endpoints requeridos

| Flujo | Endpoint | Descripción |
|---|---|---|
| OID4VCI real | `/.well-known/openid-credential-issuer` | Metadata del issuer |
| OID4VCI real | `token_endpoint` | Obtención de token |
| OID4VCI real | `credential_endpoint` | Emisión de credencial |
| LACChain demo | `POST /new-did` | Genera DID de holder |
| LACChain demo | `POST /new-vc?targetDid=<did>` | Emite VC para el DID |

## Estructura del proyecto

```txt
app/                    Rutas de Expo Router
src/features/home       Pantalla inicial
src/features/wallet     Wallet, almacenamiento y detalle de credenciales
src/features/issuance   Credential offers, QR, emisión mock/real y flujo demo LACChain
src/shared              Componentes, configuración y utilidades compartidas
```

## Scripts disponibles

- `npm run lint`
- `npm run typecheck`
- `npm run android`
- `npm run ios`
- `npm run web`

## Notas de seguridad

- Las credenciales se guardan localmente con `expo-secure-store`.
- El flujo demo LACChain guarda la `privateKey` del holder en un vault separado
  usando `expo-secure-store` para esta PoC controlada.
- La `privateKey` no se guarda dentro de la credencial ni dentro del `raw`.
- La `privateKey` no se muestra completa en pantalla.
- Para producción, las claves privadas deben generarse y protegerse en el
  dispositivo.
- SecureStore es adecuado para esta PoC; credenciales grandes requerirían una
  estrategia híbrida.

## Troubleshooting

- Si cambias `.env`, reinicia Expo con `npx expo start -c`.
- En dispositivo físico no uses `localhost` para el backend; usa la IP local de
  tu PC.
- Si el celular no conecta, usa `npx expo start --tunnel`.
- Si la cámara no abre, revisa permisos del dispositivo.
- WSL 1 puede generar problemas con Node/Expo; usar PowerShell, CMD o WSL 2.
