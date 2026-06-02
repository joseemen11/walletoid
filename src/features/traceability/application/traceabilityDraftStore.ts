import type { TraceabilityEvent } from '../domain/traceability.types';

let lastConfirmedTraceabilityEvent: TraceabilityEvent | null = null;

export function saveTraceabilityEventDraft(event: TraceabilityEvent): void {
  lastConfirmedTraceabilityEvent = event;
}

export function getTraceabilityEventDraft(): TraceabilityEvent | null {
  return lastConfirmedTraceabilityEvent;
}

export function clearTraceabilityEventDraft(): void {
  lastConfirmedTraceabilityEvent = null;
}
