import type { DigitalSignatureEvidence } from './digitalSignature.types';

export type TraceabilityLocation = {
  latitude: number;
  longitude: number;
};

export type TraceabilityPayload = {
  lotCode: string;
  eventType: 'coffee_lot_location_evidence';
  location: TraceabilityLocation;
  photoUri: string;
  userName?: string;
  registeredBy?: string;
  createdAt: string;
};

export type TraceabilityEvent = TraceabilityPayload & {
  signatureEvidence?: DigitalSignatureEvidence;
};
