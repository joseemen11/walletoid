import { useCallback, useMemo, useState } from 'react';
import {
  type BarcodeScanningResult,
  useCameraPermissions,
} from 'expo-camera';

type PermissionStatus = 'undetermined' | 'granted' | 'denied';

type UseQrCredentialOfferScannerParams = {
  onScanned: (value: string) => void;
};

type UseQrCredentialOfferScannerResult = {
  isScannerOpen: boolean;
  hasScanned: boolean;
  scannedValue: string | null;
  error: string | null;
  permissionStatus: PermissionStatus;
  openScanner: () => Promise<void>;
  closeScanner: () => void;
  resetScanner: () => void;
  handleBarcodeScanned: (event: BarcodeScanningResult) => void;
};

function getPermissionStatus(status: string | undefined): PermissionStatus {
  if (status === 'granted' || status === 'denied') {
    return status;
  }

  return 'undetermined';
}

export function useQrCredentialOfferScanner({
  onScanned,
}: UseQrCredentialOfferScannerParams): UseQrCredentialOfferScannerResult {
  const [permission, requestPermission] = useCameraPermissions();
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [hasScanned, setHasScanned] = useState(false);
  const [scannedValue, setScannedValue] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const permissionStatus = useMemo(
    () => getPermissionStatus(permission?.status),
    [permission?.status],
  );

  const openScanner = useCallback(async () => {
    setError(null);

    if (permissionStatus === 'granted') {
      setIsScannerOpen(true);
      return;
    }

    const permissionResponse = await requestPermission();
    const nextStatus = getPermissionStatus(permissionResponse.status);

    if (nextStatus !== 'granted') {
      setIsScannerOpen(false);
      setError(
        'No se concedio permiso de camara. Habilitalo desde la configuracion del dispositivo para escanear QR.',
      );
      return;
    }

    setIsScannerOpen(true);
  }, [permissionStatus, requestPermission]);

  const closeScanner = useCallback(() => {
    setIsScannerOpen(false);
    setHasScanned(false);
    setScannedValue(null);
    setError(null);
  }, []);

  const resetScanner = useCallback(() => {
    setHasScanned(false);
    setScannedValue(null);
    setError(null);
  }, []);

  const handleBarcodeScanned = useCallback(
    (event: BarcodeScanningResult) => {
      if (hasScanned) {
        return;
      }

      setHasScanned(true);
      setScannedValue(event.data);
      setError(null);
      onScanned(event.data);
    },
    [hasScanned, onScanned],
  );

  return {
    isScannerOpen,
    hasScanned,
    scannedValue,
    error,
    permissionStatus,
    openScanner,
    closeScanner,
    resetScanner,
    handleBarcodeScanned,
  };
}
