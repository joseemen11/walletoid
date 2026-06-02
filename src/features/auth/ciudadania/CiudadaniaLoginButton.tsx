import { StyleSheet, Text, View } from 'react-native';

import { AppButton } from '@/src/shared/components/AppButton';
import { AppCard } from '@/src/shared/components/AppCard';
import { spacing } from '@/src/shared/theme/spacing';
import { typography } from '@/src/shared/theme/typography';

import { useState } from 'react';
import { useWira } from '../../wira/useWira';
import { parseDdMmYyyyToDate } from '../../wira/utils';
import { mapCiudadaniaUserForDisplay } from './ciudadaniaAuthService';
import { useCiudadaniaLogin } from './useCiudadaniaLogin';

type UserFieldProps = {
  label: string;
  value: string;
};

function UserField({ label, value }: UserFieldProps) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Text style={styles.fieldValue}>{value}</Text>
    </View>
  );
}

export function CiudadaniaLoginButton() {
  const {
    error,
    loading,
    login,
    logout,
    user,
  } = useCiudadaniaLogin();
  const displayUser = user ? mapCiudadaniaUserForDisplay(user) : null;
  const {
    register,
    getUserData,
  } = useWira();
  const [userData, setUserData] = useState<any>(null);

  const getVC = async () => {
    if (!displayUser) return;

    const birthDate = parseDdMmYyyyToDate(displayUser.fechaNacimiento);
    if (!birthDate) {
      console.log('Invalid birth date format:', displayUser.fechaNacimiento);
      return;
    }

    await register({
      fullName: displayUser.fullName,
      nationalIdNumber: displayUser.document,
      dateOfBirth: birthDate.getTime(),
    });

    console.log('VC obtained and user registered in Wira');
  }

  const getData = async () => {
    const data = await getUserData();
    setUserData(data);
  }

  return (
    <AppCard>
      <Text style={styles.title}>Ciudadania Digital</Text>

      {displayUser ? (
        <View style={styles.userInfo}>
          <UserField label="Nombre" value={displayUser.fullName} />
          <UserField label="Documento" value={displayUser.document} />
          <UserField label="Email" value={displayUser.email} />
          <UserField label="Celular" value={displayUser.celular} />
          <UserField
            label="Fecha de nacimiento"
            value={displayUser.fechaNacimiento}
          />
          <UserField label="Wira Data" value={userData ?? 'No registrado'} />
        </View>
      ) : (
        <AppButton
          disabled={loading}
          onPress={login}
          title={
            loading
              ? 'Iniciando sesion...'
              : 'Iniciar sesion con Ciudadania Digital'
          }
        />
      )}

      {displayUser ? (<>
        <AppButton
          disabled={loading}
          onPress={logout}
          title={loading ? 'Cerrando sesion...' : 'Cerrar sesion local'}
          variant="secondary"
        />
        <AppButton
          disabled={loading}
          onPress={getVC}
          title={loading ? 'Cerrando sesion...' : 'Obtener VC'}
          variant="secondary"
        />
        <AppButton
          disabled={loading}
          onPress={getData}
          title={loading ? 'Cerrando sesion...' : 'Obtener datos de Wira'}
          variant="secondary"
        />
      </>) : null}

      {error ? <Text style={styles.error}>{error}</Text> : null}
    </AppCard>
  );
}

const styles = StyleSheet.create({
  title: {
    color: '#0F1720',
    fontSize: typography.heading,
    fontWeight: '600',
  },
  userInfo: {
    gap: spacing.sm,
  },
  field: {
    gap: 2,
  },
  fieldLabel: {
    color: '#4E6A85',
    fontSize: typography.caption,
    fontWeight: '700',
    letterSpacing: 0,
    textTransform: 'uppercase',
  },
  fieldValue: {
    color: '#0F1720',
    fontSize: typography.body,
    lineHeight: 22,
  },
  error: {
    color: '#B42318',
    fontSize: typography.caption,
    lineHeight: 18,
  },
});
