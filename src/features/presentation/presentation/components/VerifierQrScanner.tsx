import {
  CameraView,
  type BarcodeScanningResult,
  useCameraPermissions,
} from 'expo-camera';
import { useCallback, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AppButton } from '@/src/shared/components/AppButton';
import { AppCard } from '@/src/shared/components/AppCard';
import { spacing } from '@/src/shared/theme/spacing';
import { typography } from '@/src/shared/theme/typography';

type PermissionStatus = 'undetermined' | 'granted' | 'denied';

type VerifierQrScannerProps = {
  onScanned: (value: string) => void;
};

function getPermissionStatus(status: string | undefined): PermissionStatus {
  if (status === 'granted' || status === 'denied') {
    return status;
  }

  return 'undetermined';
}

export function VerifierQrScanner({ onScanned }: VerifierQrScannerProps) {
  const [permission, requestPermission] = useCameraPermissions();
  const [isOpen, setIsOpen] = useState(false);
  const [hasScanned, setHasScanned] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const permissionStatus = useMemo(
    () => getPermissionStatus(permission?.status),
    [permission?.status],
  );

  const openScanner = useCallback(async () => {
    setError(null);

    if (permissionStatus === 'granted') {
      setIsOpen(true);
      return;
    }

    const permissionResponse = await requestPermission();
    const nextStatus = getPermissionStatus(permissionResponse.status);

    if (nextStatus !== 'granted') {
      setIsOpen(false);
      setError(
        'No se concedio permiso de camara. Habilitalo desde la configuracion del dispositivo para escanear QR.',
      );
      return;
    }

    setIsOpen(true);
  }, [permissionStatus, requestPermission]);

  const resetScanner = useCallback(() => {
    setHasScanned(false);
    setError(null);
  }, []);

  const closeScanner = useCallback(() => {
    setIsOpen(false);
    setHasScanned(false);
    setError(null);
  }, []);

  const handleBarcodeScanned = useCallback(
    (event: BarcodeScanningResult) => {
      if (hasScanned) {
        return;
      }

      setHasScanned(true);
      setError(null);
      onScanned(event.data);
    },
    [hasScanned, onScanned],
  );

  return (
    <AppCard>
      <Text style={styles.title}>Escanear solicitud</Text>

      {!isOpen ? (
        <>
          <Text style={styles.description}>
            Escanea el código QR mostrado por el verificador para iniciar la
            presentación.
          </Text>
          <AppButton title="Abrir camara" onPress={() => void openScanner()} />
        </>
      ) : null}

      {isOpen && permissionStatus === 'granted' ? (
        <>
          <CameraView
            style={styles.camera}
            facing="back"
            onBarcodeScanned={hasScanned ? undefined : handleBarcodeScanned}
            barcodeScannerSettings={{
              barcodeTypes: ['qr'],
            }}
          />
          <Text style={styles.helperText}>
            {hasScanned
              ? 'Código detectado. Puedes escanear otro si la solicitud no era correcta.'
              : 'Apunta la cámara al código de solicitud.'}
          </Text>
        </>
      ) : null}

      {isOpen && permissionStatus === 'denied' ? (
        <Text style={styles.errorText}>
          No se concedio permiso de camara. Habilitalo desde la configuracion
          del dispositivo para escanear el código.
        </Text>
      ) : null}

      {isOpen && permissionStatus === 'undetermined' ? (
        <Text style={styles.helperText}>
          Solicitando permiso de cámara.
        </Text>
      ) : null}

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      {isOpen ? (
        <View style={styles.actions}>
          <AppButton
            title="Escanear otro código"
            onPress={resetScanner}
            variant="secondary"
          />
          <AppButton
            title="Cerrar cámara"
            onPress={closeScanner}
            variant="secondary"
          />
        </View>
      ) : null}
    </AppCard>
  );
}

const styles = StyleSheet.create({
  title: {
    color: '#0F1720',
    fontSize: typography.heading,
    fontWeight: '600',
  },
  description: {
    color: '#425466',
    fontSize: typography.body,
    lineHeight: 24,
  },
  camera: {
    borderRadius: 16,
    height: 280,
    overflow: 'hidden',
  },
  helperText: {
    color: '#425466',
    fontSize: typography.body,
    lineHeight: 24,
  },
  errorText: {
    color: '#8B1E1E',
    fontSize: typography.body,
    lineHeight: 24,
  },
  actions: {
    gap: spacing.md,
  },
});
