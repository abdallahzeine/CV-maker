export type PermissionSet = 'read' | 'write' | 'admin' | 'export';

export interface SessionContext {
  userId?: string;
  sessionId: string;
  permissions: PermissionSet;
  timestamp: number;
}

// Types only placeholder. Real auth exchange is deferred.
export type AuthRequest = Record<string, never>;

// Types only placeholder. Real auth response will expand in a later phase.
export interface AuthResponse {
  token?: string;
  user?: { id: string; email?: string };
  permissions?: PermissionSet;
}

export type AuthError = { code: 'AUTH_ERROR'; message: string };
export type ExpiredError = { code: 'EXPIRED'; message: string };
export type ForbiddenError = { code: 'FORBIDDEN'; message: string };

// Session/auth integration point placeholder:
// Future backend middleware should populate/verify SessionContext here.
export function getSession(): SessionContext {
  const sessionId =
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : `session-${Date.now()}`;

  return {
    sessionId,
    permissions: 'write',
    timestamp: Date.now(),
  };
}
