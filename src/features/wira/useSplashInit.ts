import { CIRCUITS_URL, GATEWAY_BASE } from '@/src/shared/config/env';
import { useCallback, useState } from 'react';
import { DeviceEventEmitter, EmitterSubscription } from 'react-native';
import wira, { config } from 'wira-sdk';

const CIRCUIT_DOWNLOAD_STATUS = config.CircuitDownloadStatus

export const useSplashInit = () => {
  const [downloadMessage, setDownloadMessage] = useState('');

  const waitForCircuitDownloadCompletion = useCallback(() => {
    let subscription: EmitterSubscription;
    const promise = new Promise((resolve, reject) => {
      DeviceEventEmitter.removeAllListeners('downloadInfo');
      subscription = DeviceEventEmitter.addListener('downloadInfo', (data) => {
        const {status, info} = JSON.parse(data);
        const safeInfo = String(info ?? '');

        switch (status) {
          case CIRCUIT_DOWNLOAD_STATUS.DOWNLOADING:
            if (safeInfo.startsWith('-')) {
              setDownloadMessage('Descargando datos ' + '-');
            } else {
              setDownloadMessage('Descargando datos ' + safeInfo);
            }
            break;

          case CIRCUIT_DOWNLOAD_STATUS.DONE:
            setDownloadMessage('Inicializando aplicación');
            subscription?.remove();
            resolve(true);
            break;

          case CIRCUIT_DOWNLOAD_STATUS.ERROR:
            console.error('Circuit download error:', info);
            setDownloadMessage('Error al descargar los datos');
            subscription?.remove();
            resolve(false);
            break;

          default:
            console.log('Unknown circuit download status:', status, info);
            subscription?.remove();
            setDownloadMessage('Error al descargar los datos');
            resolve(false);
            break;
        }
      });
    });

    const cancel = () => subscription?.remove();
    return {promise, cancel};
  }, []);

  const isDownloadAlreadyInProgress = useCallback(() => {
    return new Promise((resolve) => {
      const probeSubscription = DeviceEventEmitter.addListener('downloadInfo', (data) => {
        const {status} = JSON.parse(data);
        if (status === CIRCUIT_DOWNLOAD_STATUS.DOWNLOADING ||
            status === CIRCUIT_DOWNLOAD_STATUS.DONE) {
          probeSubscription.remove();
          resolve(true);
        }
      });
      setTimeout(() => {
        probeSubscription.remove();
        resolve(false);
      }, 1500);
    });
  }, []);

  const initializeApp = useCallback(async () => {
    setDownloadMessage('');

    try {
      try {
        await wira.provision.ensureProvisioned({mock: true, gatewayBase: GATEWAY_BASE});
      } catch (_provisionError) {}

      const alreadyDownloading = await isDownloadAlreadyInProgress();
      const {promise: downloadComplete} = waitForCircuitDownloadCompletion();

      if (!alreadyDownloading) {
        await config.initDownloadCircuits({
          bucketUrl: CIRCUITS_URL,
          zipFileName: 'circuits',
          circuitsWithChecksum: [
            {
              fileName: 'authV2.dat',
              circuitId: 'authV2',
              checksum: null,
            },{
              fileName: 'credentialAtomicQuerySigV2.dat',
              circuitId: 'credentialAtomicQuerySigV2',
              checksum: null,
            },
          ],
        });
      }
      const downloadOk = await downloadComplete;
      if (!downloadOk) {
        console.error('Circuit download did not complete successfully');
      }
    } catch (_error) {
      setDownloadMessage('Error al descargar los datos');
    }

    DeviceEventEmitter.removeAllListeners('downloadInfo');
  }, [waitForCircuitDownloadCompletion, isDownloadAlreadyInProgress]);


  return {
    downloadMessage,
    initializeApp
  };
};
