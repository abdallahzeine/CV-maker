import type { CVDocument } from '../../store';

export interface SaveMetadata {
  author?: string;
}

export interface SaveResult {
  id: string;
  version: number;
  timestamp: number;
  checksum: string;
}

export interface Version {
  id: string;
  version: number;
  timestamp: number;
  author?: string;
  label?: string;
}

export interface StorageProvider {
  save(cv: CVDocument, metadata?: SaveMetadata): Promise<SaveResult>;
  load(id: string, version?: number): Promise<CVDocument>;
  listVersions(id: string): Promise<Version[]>;
  delete(id: string): Promise<void>;
}

export interface StorageError {
  code: string;
  message: string;
}

export type NotFoundError = StorageError & { code: 'NOT_FOUND' };
export type ConflictError = StorageError & { code: 'CONFLICT' };
export type PermissionError = StorageError & { code: 'PERMISSION_DENIED' };

/**
 * Storage contract notes:
 * - Save should be idempotent for identical input (stable checksum).
 * - Saved versions are immutable.
 * - Version numbers should be monotonic.
 */
