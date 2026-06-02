import { Buffer } from 'buffer';
import { polyfillWebCrypto } from 'expo-standard-web-crypto';

polyfillWebCrypto();
global.Buffer = Buffer;

import 'expo-router/entry';
