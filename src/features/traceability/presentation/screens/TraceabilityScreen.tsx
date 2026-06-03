import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { mapCiudadaniaUserForDisplay } from '@/src/features/auth/ciudadania/ciudadaniaAuthService';
import { loadCiudadaniaSession } from '@/src/features/auth/ciudadania/ciudadaniaSessionStorage';
import { addTrace } from '@/src/features/wira/calls';
import { useWira } from '@/src/features/wira/useWira';
import { AppButton } from '@/src/shared/components/AppButton';
import { ConfirmModal } from '@/src/shared/components/ConfirmModal';
import { Screen } from '@/src/shared/components/Screen';
import { colors } from '@/src/shared/theme/colors';
import { spacing } from '@/src/shared/theme/spacing';
import { typography } from '@/src/shared/theme/typography';
import {
  getLoadedPocCertificate,
  loadPocSoftokenCertificate,
} from '../../application/digitalCertificatePocStore';
import { signTraceabilityPayloadPoc } from '../../application/DigitalSignaturePocService';
import { validatePocSignature } from '../../application/SignatureValidationPocService';
import { saveTraceabilityEventDraft } from '../../application/traceabilityDraftStore';
import {
  canonicalizePayload,
  createDocumentHash,
} from '../../application/traceabilityPayloadService';
import type {
  TraceabilityLocation,
  TraceabilityPayload,
} from '../../domain/traceability.types';
import type { SignerIdentity } from '../../domain/digitalSignature.types';
import { ChecklistItem } from '../components/ChecklistItem';
import { LocationPreviewCard } from '../components/LocationPreviewCard';
import { PhotoPreviewCard } from '../components/PhotoPreviewCard';
import { TraceabilityStepCard } from '../components/TraceabilityStepCard';

const DEFAULT_LOT_CODE = 'CAF-001';
const POC_LOCATION: TraceabilityLocation = {
  latitude: -16.5,
  longitude: -68.15,
};

async function prepareTraceabilityRecord(input: {
  lotCode: string;
  location: TraceabilityLocation;
  photoUri: string;
}): Promise<TraceabilityPayload> {
  const session = await loadCiudadaniaSession();
  const displayUser = session
    ? mapCiudadaniaUserForDisplay(session.user)
    : null;

  const eventPayload = {
    lotCode: input.lotCode.trim(),
    eventType: 'coffee_lot_location_evidence' as const,
    location: input.location,
    photoUri: input.photoUri,
    createdAt: new Date().toISOString(),
    registeredBy: displayUser?.document ?? displayUser?.fullName,
    userName: displayUser?.fullName,
  };

  return eventPayload;
}

function createSignerIdentity(
  eventPayload: TraceabilityPayload,
): SignerIdentity {
  return {
    userId: eventPayload.registeredBy,
    name: eventPayload.userName,
    document: eventPayload.registeredBy,
    source: eventPayload.registeredBy ? 'CIUDADANIA_DIGITAL' : 'LOCAL_DEMO',
  };
}

export function TraceabilityScreen() {
  const router = useRouter();
  const cameraRef = useRef<CameraView | null>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [lotCode, setLotCode] = useState(DEFAULT_LOT_CODE);
  const [location, setLocation] = useState<TraceabilityLocation | null>(null);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [isTakingPhoto, setIsTakingPhoto] = useState(false);
  const [isConfirmingSignature, setIsConfirmingSignature] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isSignModalVisible, setIsSignModalVisible] = useState(false);
  const [softokenPassword, setSoftokenPassword] = useState('');
  const { sendTransaction } = useWira();

  const hasLotCode = lotCode.trim().length > 0;
  const hasPhoto = Boolean(photoUri);
  const hasLocation = Boolean(location);
  const canSubmit = hasLotCode && hasPhoto && hasLocation;

  const openCamera = async () => {
    setMessage(null);

    if (permission?.status === 'granted') {
      setCameraOpen(true);
      return;
    }

    const nextPermission = await requestPermission();

    if (nextPermission.status !== 'granted') {
      setMessage('Necesitamos acceso a la cámara para tomar la foto.');
      return;
    }

    setCameraOpen(true);
  };

  const takePhoto = async () => {
    if (!cameraRef.current || isTakingPhoto) {
      return;
    }

    setIsTakingPhoto(true);
    setMessage(null);

    try {
      const picture = await cameraRef.current.takePictureAsync({
        quality: 0.8,
      });

      if (picture?.uri) {
        setPhotoUri(picture.uri);
        setCameraOpen(false);
      }
    } catch {
      setMessage('Necesitamos acceso a la cámara para tomar la foto.');
    } finally {
      setIsTakingPhoto(false);
    }
  };

  const captureLocation = () => {
    // TODO POC: reemplazar esta ubicacion PoC por ubicacion real del dispositivo.
    setLocation(POC_LOCATION);
    setMessage(null);
  };

  const requestSubmit = () => {
    if (!canSubmit) {
      return;
    }

    setSoftokenPassword('');
    setIsSignModalVisible(true);
  };

  const closeSignModal = () => {
    if (isConfirmingSignature) {
      return;
    }

    setSoftokenPassword('');
    setIsSignModalVisible(false);
  };

  const confirmSignature = async () => {
    if (!location || !photoUri || !hasLotCode) {
      setIsSignModalVisible(false);
      return;
    }

    if (isConfirmingSignature) {
      return;
    }

    setIsConfirmingSignature(true);
    setMessage(null);

    try {
      if (!softokenPassword.trim()) {
        throw new Error('Ingresa el PIN o contraseña del softoken.');
      }

      const eventPayload = await prepareTraceabilityRecord({
        lotCode,
        location,
        photoUri,
      });
      const payloadCanonical = canonicalizePayload(eventPayload);
      const documentHash = await createDocumentHash(payloadCanonical);
      const signerIdentity = createSignerIdentity(eventPayload);
      const certificate =
        getLoadedPocCertificate() ??
        loadPocSoftokenCertificate(signerIdentity);

      const evidence = await signTraceabilityPayloadPoc({
        payloadOriginal: eventPayload,
        payloadCanonical,
        documentHash,
        signerIdentity,
        certificate,
        password: softokenPassword,
      });
      const validation = validatePocSignature(evidence);

      if (validation.status !== 'POC_VALID') {
        throw new Error('No se pudo validar la evidencia de firma.');
      }

      const validatedEvidence = {
        ...evidence,
        validationStatus: validation.status,
        validatedAt: validation.validatedAt,
      };

      const blockchainResult = await sendTransaction(addTrace(
        documentHash,
        validatedEvidence.signatureHash
      ));

      const finalizedEvidence = {
        ...validatedEvidence,
        blockchainTxHash: blockchainResult?.txHash,
        receiptStatus: String(blockchainResult?.receipt?.status ?? ''),
        registeredAt: new Date().toISOString(),
      };

      saveTraceabilityEventDraft({
        ...eventPayload,
        signatureEvidence: finalizedEvidence,
      });
      setSoftokenPassword('');
      setIsSignModalVisible(false);
      router.replace('/traceability/confirmation');
    } catch(error: any) {
      console.error(error);
      setMessage('No se pudo completar el registro. Intenta nuevamente.');
    } finally {
      setIsConfirmingSignature(false);
    }
  };

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.title}>Registrar trazabilidad</Text>
        <Text style={styles.description}>
          Registra una ubicación y una foto como evidencia del lote.
        </Text>
      </View>

      <TraceabilityStepCard step="Paso 1" title="Datos del lote">
        <Text style={styles.inputLabel}>Código de lote</Text>
        <TextInput
          autoCapitalize="characters"
          onChangeText={setLotCode}
          style={styles.input}
          value={lotCode}
        />
      </TraceabilityStepCard>

      <TraceabilityStepCard
        step="Paso 2"
        title="Foto del lote"
        description="Toma una foto para respaldar el registro."
      >
        {photoUri ? <PhotoPreviewCard photoUri={photoUri} /> : null}

        {cameraOpen ? (
          <View style={styles.cameraGroup}>
            <CameraView ref={cameraRef} style={styles.camera} facing="back" />
            <View style={styles.inlineActions}>
              <AppButton
                title="Capturar foto"
                onPress={() => void takePhoto()}
                loading={isTakingPhoto}
              />
              <AppButton
                title="Cancelar"
                onPress={() => setCameraOpen(false)}
                variant="secondary"
              />
            </View>
          </View>
        ) : (
          <AppButton
            title={photoUri ? 'Tomar otra foto' : 'Tomar foto'}
            onPress={() => void openCamera()}
            variant={photoUri ? 'secondary' : 'primary'}
          />
        )}
      </TraceabilityStepCard>

      <TraceabilityStepCard
        step="Paso 3"
        title="Ubicación"
        description="Captura la ubicación donde se realiza el registro."
      >
        {location ? <LocationPreviewCard location={location} /> : null}
        <AppButton
          title="Capturar ubicación"
          onPress={captureLocation}
          variant={location ? 'secondary' : 'primary'}
        />
      </TraceabilityStepCard>

      <TraceabilityStepCard
        step="Paso 4"
        title="Confirmación"
        description="Revisa la información y firma el registro."
      >
        <View style={styles.checklist}>
          <ChecklistItem label="Código de lote" complete={hasLotCode} />
          <ChecklistItem label="Foto adjunta" complete={hasPhoto} />
          <ChecklistItem label="Ubicación capturada" complete={hasLocation} />
        </View>
        <AppButton
          title="Firmar y registrar"
          onPress={requestSubmit}
          disabled={!canSubmit}
        />
      </TraceabilityStepCard>

      {message ? <Text style={styles.message}>{message}</Text> : null}

      <ConfirmModal
        visible={isSignModalVisible}
        title="Firmar registro"
        description="Ingresa el PIN o contraseña del softoken para firmar el evento."
        supportingText="Softoken cargado"
        cancelLabel="Cancelar"
        confirmLabel="Confirmar registro"
        confirmVariant="primary"
        confirmDisabled={!softokenPassword.trim()}
        loading={isConfirmingSignature}
        onCancel={closeSignModal}
        onConfirm={() => void confirmSignature()}
      >
        <View style={styles.pinGroup}>
          <Text style={styles.inputLabel}>PIN/contraseña del softoken</Text>
          <TextInput
            autoCapitalize="none"
            autoCorrect={false}
            onChangeText={setSoftokenPassword}
            placeholder="Ingresa el PIN o contraseña"
            placeholderTextColor={colors.textMuted}
            secureTextEntry
            style={styles.input}
            value={softokenPassword}
          />
          {softokenPassword.trim() ? (
            <Text style={styles.pinHint}>
              PIN/contraseña ingresado. Firma generada y validación PoC listas para registrar.
            </Text>
          ) : null}
        </View>
      </ConfirmModal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: spacing.md,
  },
  title: {
    color: colors.text,
    fontSize: typography.title,
    fontWeight: '700',
  },
  description: {
    color: colors.textMuted,
    fontSize: typography.body,
    lineHeight: 24,
  },
  inputLabel: {
    color: colors.text,
    fontSize: typography.body,
    fontWeight: '700',
  },
  input: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 12,
    borderWidth: 1,
    color: colors.text,
    fontSize: typography.body,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  cameraGroup: {
    gap: spacing.md,
  },
  camera: {
    aspectRatio: 4 / 3,
    borderRadius: 16,
    overflow: 'hidden',
    width: '100%',
  },
  inlineActions: {
    gap: spacing.md,
  },
  checklist: {
    gap: spacing.sm,
  },
  pinGroup: {
    gap: spacing.sm,
  },
  pinHint: {
    color: colors.success,
    fontSize: typography.caption,
    fontWeight: '700',
    lineHeight: 18,
  },
  message: {
    color: colors.danger,
    fontSize: typography.body,
    lineHeight: 24,
  },
});
