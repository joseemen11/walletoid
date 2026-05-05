import { CameraView, type BarcodeScanningResult } from 'expo-camera';
import { StyleSheet, Text, View } from 'react-native';

import { AppButton } from '@/src/shared/components/AppButton';
import { AppCard } from '@/src/shared/components/AppCard';
import { spacing } from '@/src/shared/theme/spacing';
import { typography } from '@/src/shared/theme/typography';

type PermissionStatus = 'undetermined' | 'granted' | 'denied';

type CredentialOfferQrScannerProps = {
  isOpen: boolean;
  hasScanned: boolean;
  error: string | null;
  permissionStatus: PermissionStatus;
  onBarcodeScanned: (event: BarcodeScanningResult) => void;
  onRequestOpen: () => void;
  onClose: () => void;
  onReset: () => void;
};

export function CredentialOfferQrScanner({
  isOpen,
  hasScanned,
  error,
  permissionStatus,
  onBarcodeScanned,
  onRequestOpen,
  onClose,
  onReset,
}: CredentialOfferQrScannerProps) {
  return (
    <AppCard>
      <Text style={styles.title}>Escaneo QR</Text>

      {!isOpen ? (
        <>
          <Text style={styles.description}>
            Escanea un QR con `credential_offer` para reutilizar el mismo parser
            del flujo manual.
          </Text>
          <AppButton title="Escanear QR" onPress={onRequestOpen} />
        </>
      ) : null}

      {isOpen && permissionStatus === 'granted' ? (
        <>
          <CameraView
            style={styles.camera}
            facing="back"
            onBarcodeScanned={hasScanned ? undefined : onBarcodeScanned}
            barcodeScannerSettings={{
              barcodeTypes: ['qr'],
            }}
          />
          <Text style={styles.helperText}>
            {hasScanned
              ? 'QR detectado. Usa "Escanear otro QR" para volver a activar la lectura.'
              : 'Apunta la camara a un QR que contenga un credential_offer.'}
          </Text>
        </>
      ) : null}

      {isOpen && permissionStatus === 'denied' ? (
        <Text style={styles.errorText}>
          No se concedio permiso de camara. Habilitalo desde la configuracion
          del dispositivo para escanear QR.
        </Text>
      ) : null}

      {isOpen && permissionStatus === 'undetermined' ? (
        <Text style={styles.helperText}>
          Solicitando permiso de camara para habilitar el scanner.
        </Text>
      ) : null}

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      {isOpen ? (
        <View style={styles.actions}>
          <AppButton
            title="Escanear otro QR"
            onPress={onReset}
            variant="secondary"
          />
          <AppButton
            title="Cerrar scanner"
            onPress={onClose}
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
