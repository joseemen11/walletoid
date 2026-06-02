export type TraceabilityLocation = {
  latitude: number;
  longitude: number;
};

export type TraceabilityEvent = {
  lotCode: string;
  eventType: 'coffee_lot_location_evidence';
  location: TraceabilityLocation;
  photoUri: string;
  userName?: string;
  registeredBy?: string;
  createdAt: string;
  signedForDemo: true;
  demoSignature: string;
};
