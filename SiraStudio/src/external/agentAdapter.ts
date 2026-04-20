import type { DispatchResult, Patch, StoreAPI } from '../store';
import type { CVItem, CVSection } from '../types';

interface AgentToolBase {
  tool: string;
}

export interface SetFieldToolCall extends AgentToolBase {
  tool: 'set_field';
  path: string;
  value: unknown;
}

export interface DeleteAtToolCall extends AgentToolBase {
  tool: 'delete_at';
  path: string;
}

export interface AppendItemToolCall extends AgentToolBase {
  tool: 'append_item';
  path: string;
  item: CVItem;
}

export interface AddSectionToolCall extends AgentToolBase {
  tool: 'add_section';
  section: CVSection;
}

export interface DeleteSectionToolCall extends AgentToolBase {
  tool: 'delete_section';
  index: number;
}

export type AgentToolCall =
  | SetFieldToolCall
  | DeleteAtToolCall
  | AppendItemToolCall
  | AddSectionToolCall
  | DeleteSectionToolCall;

function assertValidSectionIndex(index: number): void {
  if (!Number.isInteger(index) || index < 0) {
    throw new Error(`Invalid delete_section index: ${index}`);
  }
}

function assertPath(path: string, tool: AgentToolCall['tool']): void {
  if (typeof path !== 'string' || path.trim().length === 0) {
    throw new Error(`Invalid ${tool} path`);
  }
}

export function agentToolsToPatches(toolCalls: AgentToolCall[]): Patch[] {
  return toolCalls.map((call) => {
    switch (call.tool) {
      case 'set_field':
        assertPath(call.path, call.tool);
        return { op: 'set', path: call.path, value: call.value };

      case 'delete_at':
        assertPath(call.path, call.tool);
        return { op: 'delete', path: call.path };

      case 'append_item':
        assertPath(call.path, call.tool);
        return { op: 'insert', path: `${call.path}[-1]`, value: call.item };

      case 'add_section':
        return { op: 'insert', path: 'sections[-1]', value: call.section };

      case 'delete_section':
        assertValidSectionIndex(call.index);
        return { op: 'delete', path: `sections[${call.index}]` };

      default: {
        const unknown = call satisfies never;
        throw new Error(`Unknown tool call: ${JSON.stringify(unknown)}`);
      }
    }
  });
}

function createAgentTxId(): string {
  return `agent-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function dispatchAgentToolCalls(
  dispatch: StoreAPI['dispatch'],
  toolCalls: AgentToolCall[],
  txId?: string
): DispatchResult {
  const patches = agentToolsToPatches(toolCalls);

  if (patches.length === 0) {
    return {
      success: false,
      error: {
        code: 'INVALID_PATCH',
        message: 'At least one tool call is required',
      },
    };
  }

  return dispatch(patches, {
    origin: 'agent',
    txId: txId && txId.trim().length > 0 ? txId : createAgentTxId(),
    label: 'agent-tool-calls',
  });
}
