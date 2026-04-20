import type { AgentRequest, AgentResponse } from './types/agent';
import type { RealtimeEvent } from './types/realtime';
import { getSession, type SessionContext } from './types/session';
import type { StorageProvider } from './types/storage';

export interface BackendConfig {
  apiUrl?: string;
  wsUrl?: string;
  token?: string;
  sessionId?: string;
}

export interface BackendConnection {
  connected: boolean;
  ready: boolean;
  authenticated: boolean;
}

export interface BackendAdapter {
  connect(config: BackendConfig): Promise<BackendConnection>;
  processAgentRequest(req: AgentRequest): Promise<AgentResponse>;
  subscribeToPushEvents(cb: (event: RealtimeEvent) => void): () => void;
  getStorageProvider(): StorageProvider;
  getSession(): SessionContext;
}

// Session/auth stubbed for future; configure agent, realtime, storage now.
export const stubBackendAdapter: BackendAdapter = {
  connect: async () => ({ connected: false, ready: false, authenticated: false }),
  processAgentRequest: async () => {
    throw new Error('Backend not configured');
  },
  subscribeToPushEvents: () => {
    return () => {};
  },
  getStorageProvider: () => ({
    save: async () => {
      throw new Error('Storage not configured');
    },
    load: async () => {
      throw new Error('Storage not configured');
    },
    listVersions: async () => [],
    delete: async () => {},
  }),
  getSession: () => getSession(),
};
