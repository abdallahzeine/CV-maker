import type { Patch } from '../../store';

export interface PatchPushEvent {
  type: 'patch-push';
  txId: string;
  patches: Patch[];
  origin: 'server' | 'peer';
  timestamp: number;
}

export interface ConflictEvent {
  type: 'conflict';
  txId: string;
  localPatch: Patch;
  remotePatch: Patch;
  resolution: 'keep-local' | 'apply-remote' | 'manual';
  timestamp: number;
}

export interface SyncAckEvent {
  type: 'sync-ack';
  txId: string;
  revision: number;
  timestamp: number;
}

export interface SubscribeMessage {
  type: 'subscribe';
  sessionId: string;
  documentId: string;
  txId?: string;
  timestamp: number;
}

export interface UnsubscribeMessage {
  type: 'unsubscribe';
  sessionId: string;
  documentId: string;
  txId?: string;
  timestamp: number;
}

export type SubscriptionMessage = SubscribeMessage | UnsubscribeMessage;

export type RealtimeEvent =
  | PatchPushEvent
  | ConflictEvent
  | SyncAckEvent
  | SubscriptionMessage;

/**
 * Sort helper for deterministic event processing.
 *
 * Contract notes:
 * - Events are processed in ascending timestamp order.
 * - Duplicate txIds should be treated as idempotent retries.
 */
export function compareRealtimeEventsByTimestamp(a: RealtimeEvent, b: RealtimeEvent): number {
  return a.timestamp - b.timestamp;
}
