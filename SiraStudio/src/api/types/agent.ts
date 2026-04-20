import type { Patch } from '../../store';

export type AgentMode = 'edit' | 'plan';

export interface AgentRequest {
  patches: Patch[];
  sessionId: string;
  txId?: string;
  context?: {
    task?: string;
    mode?: AgentMode;
  };
  config?: {
    model?: string;
    temperature?: number;
  };
}

export interface AgentResponse {
  patches: Patch[];
  reasoning?: string;
  confidence?: number;
  txId?: string;
  error?: AgentError;
}

export type AgentToolName =
  | 'set_field'
  | 'delete_at'
  | 'append_item'
  | 'add_section'
  | 'delete_section';

export interface AgentToolCall {
  tool: AgentToolName;
  params: Record<string, unknown>;
}

/**
 * Generic backend-facing error shape.
 *
 * Backend contract notes:
 * - Agent operations must be idempotent when a txId is retried.
 * - Agent operations must apply atomically (all-or-nothing).
 * - Conflict handling must be explicit (report conflicts, do not silently merge).
 * - Merge behavior is expected to follow deterministic three-way semantics.
 */
export interface AgentError {
  code: string;
  message: string;
  details?: unknown;
}

export type ValidationError = AgentError & { code: 'VALIDATION_ERROR' };
export type ConflictError = AgentError & { code: 'CONFLICT_ERROR' };
