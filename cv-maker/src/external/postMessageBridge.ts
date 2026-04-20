import type { CVDocument, DispatchResult, Patch } from '../store';
import type { CVMakerExternalAPI } from './api';

export interface PostMessageBridgeConfig {
  allowedOrigins: string[];
  api: Pick<CVMakerExternalAPI, 'dispatch' | 'getSnapshot'>;
}

export interface HostDispatchMessage {
  type: 'cv-maker/dispatch';
  txId?: string;
  patches: Patch | Patch[];
}

export interface HostSnapshotRequestMessage {
  type: 'cv-maker/request-snapshot';
  txId?: string;
}

export type BridgeInboundMessage = HostDispatchMessage | HostSnapshotRequestMessage;

export interface BridgeAckMessage {
  type: 'cv-maker/ack';
  txId?: string;
  result: DispatchResult;
}

export interface BridgeSnapshotMessage {
  type: 'cv-maker/snapshot';
  txId?: string;
  revision: number;
  doc: CVDocument;
}

type BridgeOutboundMessage = BridgeAckMessage | BridgeSnapshotMessage;

function normalizeOrigin(origin: string): string | null {
  try {
    const parsed = new URL(origin);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return null;
    }
    return parsed.origin;
  } catch {
    return null;
  }
}

function createAllowlist(origins: string[]): Set<string> {
  const allowed = new Set<string>();

  origins.forEach((origin) => {
    const normalized = normalizeOrigin(origin);
    if (!normalized) {
      throw new Error(`Invalid postMessage allowed origin: ${origin}`);
    }
    allowed.add(normalized);
  });

  return allowed;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isInboundMessage(data: unknown): data is BridgeInboundMessage {
  if (!isRecord(data) || typeof data.type !== 'string') {
    return false;
  }

  if (data.type === 'cv-maker/dispatch') {
    return 'patches' in data;
  }

  if (data.type === 'cv-maker/request-snapshot') {
    return true;
  }

  return false;
}

function normalizePatches(patches: Patch | Patch[]): Patch[] {
  return Array.isArray(patches) ? patches : [patches];
}

function isMessageTarget(source: MessageEventSource | null): source is WindowProxy {
  return source !== null && typeof (source as WindowProxy).postMessage === 'function';
}

function postResponse(
  event: MessageEvent,
  fallback: Window,
  origin: string,
  payload: BridgeOutboundMessage
): void {
  const target = isMessageTarget(event.source) ? event.source : fallback;
  target.postMessage(payload, origin);
}

export function setupPostMessageBridge(config: PostMessageBridgeConfig): () => void {
  const allowedOrigins = createAllowlist(config.allowedOrigins);

  const onMessage = (event: MessageEvent) => {
    const eventOrigin = normalizeOrigin(event.origin);
    if (!eventOrigin || !allowedOrigins.has(eventOrigin)) {
      return;
    }

    if (!isInboundMessage(event.data)) {
      return;
    }

    if (event.data.type === 'cv-maker/dispatch') {
      const txId = typeof event.data.txId === 'string' ? event.data.txId : undefined;
      const result = config.api.dispatch(normalizePatches(event.data.patches));
      postResponse(event, window.parent, eventOrigin, {
        type: 'cv-maker/ack',
        txId,
        result,
      });
      return;
    }

    if (event.data.type === 'cv-maker/request-snapshot') {
      const txId = typeof event.data.txId === 'string' ? event.data.txId : undefined;
      const doc = config.api.getSnapshot();
      postResponse(event, window.parent, eventOrigin, {
        type: 'cv-maker/snapshot',
        txId,
        revision: doc.revision,
        doc,
      });
    }
  };

  window.addEventListener('message', onMessage);

  return () => {
    window.removeEventListener('message', onMessage);
  };
}
