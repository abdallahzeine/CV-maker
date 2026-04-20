import { useCallback, useContext, useMemo, useState } from 'react';
import { dispatchImportedCVData } from '../external/import';
import { CVStoreContext, useCVStore, useDispatch, useHistory } from '../store';
import type { DispatchResult, Patch } from '../store';
import type { CVData } from '../types';

type ImportFormat = 'cv-maker' | 'json-resume';

interface CVInspectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isCVDataLike(value: unknown): value is CVData {
  if (!isRecord(value)) return false;
  if (!isRecord(value.header)) return false;
  if (!Array.isArray(value.sections)) return false;
  if (!isRecord(value.template)) return false;

  const header = value.header;
  if (
    typeof header.name !== 'string' ||
    typeof header.location !== 'string' ||
    typeof header.phone !== 'string' ||
    typeof header.email !== 'string' ||
    !Array.isArray(header.socialLinks)
  ) {
    return false;
  }

  return true;
}

function parseCVMakerPayload(raw: unknown): CVData | null {
  if (isCVDataLike(raw)) {
    return raw;
  }

  if (isRecord(raw) && isCVDataLike(raw.data)) {
    return raw.data;
  }

  return null;
}

function summarizePatches(patches: Patch[]): string {
  return patches
    .map((patch) => `${patch.op} ${patch.path === '' ? '<root>' : patch.path}`)
    .join(', ');
}

function summarizeDispatch(result: DispatchResult): string {
  if (result.success) {
    const revision = typeof result.revision === 'number' ? result.revision : 'unchanged';
    const patchCount = result.appliedPatches?.length ?? 0;
    return `Import applied (revision: ${revision}, patches: ${patchCount}).`;
  }

  const code = result.error?.code ?? 'UNKNOWN_ERROR';
  const message = result.error?.message ?? 'Import failed.';
  return `${code}: ${message}`;
}

export function CVInspector({ open, onOpenChange }: CVInspectorProps) {
  const store = useContext(CVStoreContext);
  const doc = useCVStore();
  const dispatch = useDispatch();
  const history = useHistory();

  if (!store) {
    throw new Error('CVInspector requires CVStoreProvider');
  }

  const queryParamEnabled = useMemo(() => {
    if (typeof window === 'undefined') {
      return false;
    }

    return new URLSearchParams(window.location.search).get('debug') === '1';
  }, []);

  const visible = open || queryParamEnabled;

  const [importFormat, setImportFormat] = useState<ImportFormat>('cv-maker');
  const [importPayload, setImportPayload] = useState('');
  const [importStatus, setImportStatus] = useState<string>('');
  const [copyStatus, setCopyStatus] = useState<string>('');

  const snapshotJSON = useMemo(() => JSON.stringify(doc, null, 2), [doc]);
  const entries = history.entries;
  const sliderMax = history.length;
  const sliderValue = history.cursor + 1;

  const jumpTo = useCallback(
    (targetValue: number) => {
      const targetCursor = Math.max(-1, Math.min(targetValue - 1, history.length - 1));

      let safety = history.length + 5;

      while (history.cursor > targetCursor && safety > 0) {
        const entry = history.undo();
        if (!entry) break;

        const result = dispatch(entry.inverse, {
          origin: 'undo',
          label: 'history:jump-undo',
        });

        if (!result.success) {
          history.redo();
          setImportStatus(`History jump failed while undoing: ${result.error?.message ?? 'unknown error'}`);
          break;
        }

        safety -= 1;
      }

      while (history.cursor < targetCursor && safety > 0) {
        const entry = history.redo();
        if (!entry) break;

        const result = dispatch(entry.patches, {
          origin: 'redo',
          label: 'history:jump-redo',
        });

        if (!result.success) {
          history.undo();
          setImportStatus(`History jump failed while redoing: ${result.error?.message ?? 'unknown error'}`);
          break;
        }

        safety -= 1;
      }
    },
    [dispatch, history]
  );

  const onImport = useCallback(() => {
    const trimmed = importPayload.trim();
    if (!trimmed) {
      setImportStatus('Paste JSON payload before importing.');
      return;
    }

    if (window.cvMaker?.importJSON) {
      const result = window.cvMaker.importJSON(trimmed, importFormat);
      setImportStatus(summarizeDispatch(result));
      return;
    }

    if (importFormat !== 'cv-maker') {
      setImportStatus('json-resume import requires VITE_ENABLE_EXTERNAL_API to expose window.cvMaker.');
      return;
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(trimmed);
    } catch {
      setImportStatus('INVALID_JSON: Failed to parse input JSON');
      return;
    }

    const cvData = parseCVMakerPayload(parsed);
    if (!cvData) {
      setImportStatus('INVALID_IMPORT: Unsupported payload for format "cv-maker"');
      return;
    }

    const result = dispatchImportedCVData(store, cvData, 'cv-maker');
    setImportStatus(summarizeDispatch(result));
  }, [importFormat, importPayload, store]);

  const onCopySnapshot = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(snapshotJSON);
      setCopyStatus('Snapshot copied');
    } catch {
      setCopyStatus('Copy failed');
    }
  }, [snapshotJSON]);

  if (!visible) {
    return null;
  }

  return (
    <aside className="no-print fixed right-3 top-3 z-[70] w-[min(95vw,440px)] max-h-[calc(100vh-1.5rem)] overflow-hidden rounded-xl border border-gray-300 bg-white/95 shadow-2xl backdrop-blur print:hidden">
      <header className="flex items-center justify-between border-b border-gray-200 px-3 py-2">
        <div>
          <h2 className="text-sm font-semibold text-gray-900">CV Inspector</h2>
          <p className="text-xs text-gray-500">Revision {doc.revision}</p>
        </div>
        <button
          type="button"
          onClick={() => onOpenChange(false)}
          className="rounded border border-gray-300 px-2 py-1 text-xs text-gray-700 hover:bg-gray-100"
        >
          Close
        </button>
      </header>

      <div className="space-y-3 overflow-y-auto p-3 text-xs">
        {queryParamEnabled && (
          <div className="rounded border border-amber-200 bg-amber-50 px-2 py-1 text-amber-800">
            Inspector forced on by <code>?debug=1</code>.
          </div>
        )}

        <section className="space-y-1">
          <h3 className="font-semibold text-gray-800">History Jump</h3>
          <input
            type="range"
            min={0}
            max={sliderMax}
            value={sliderValue}
            onChange={(event) => jumpTo(Number.parseInt(event.target.value, 10))}
            disabled={history.length === 0}
            className="w-full"
          />
          <div className="text-gray-600">
            Cursor {history.cursor + 1} / {history.length}
          </div>
        </section>

        <section className="space-y-1">
          <h3 className="font-semibold text-gray-800">Patch Log</h3>
          <div className="max-h-40 overflow-auto rounded border border-gray-200">
            <table className="w-full border-collapse text-left">
              <thead className="bg-gray-50 text-[11px] text-gray-600">
                <tr>
                  <th className="px-2 py-1">Rev</th>
                  <th className="px-2 py-1">Origin</th>
                  <th className="px-2 py-1">Patches</th>
                </tr>
              </thead>
              <tbody>
                {entries.length === 0 && (
                  <tr>
                    <td className="px-2 py-2 text-gray-500" colSpan={3}>
                      No history entries yet.
                    </td>
                  </tr>
                )}
                {entries
                  .slice()
                  .reverse()
                  .map((entry) => (
                    <tr key={`${entry.revision}-${entry.at}`} className="border-t border-gray-100 align-top">
                      <td className="px-2 py-1 font-mono text-[11px]">{entry.revision}</td>
                      <td className="px-2 py-1">{entry.origin}</td>
                      <td className="px-2 py-1 text-[11px] text-gray-700">{summarizePatches(entry.patches)}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="space-y-1">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-800">Snapshot</h3>
            <button
              type="button"
              onClick={onCopySnapshot}
              className="rounded border border-gray-300 px-2 py-1 text-[11px] text-gray-700 hover:bg-gray-100"
            >
              Copy JSON
            </button>
          </div>
          {copyStatus && <p className="text-[11px] text-gray-500">{copyStatus}</p>}
          <pre className="max-h-44 overflow-auto rounded border border-gray-200 bg-gray-50 p-2 font-mono text-[11px] leading-relaxed text-gray-800">
            {snapshotJSON}
          </pre>
        </section>

        <section className="space-y-1">
          <h3 className="font-semibold text-gray-800">Import JSON</h3>
          <div className="flex items-center gap-2">
            <label className="text-gray-700" htmlFor="cv-inspector-format">Format</label>
            <select
              id="cv-inspector-format"
              value={importFormat}
              onChange={(event) => setImportFormat(event.target.value as ImportFormat)}
              className="rounded border border-gray-300 px-2 py-1"
            >
              <option value="cv-maker">cv-maker</option>
              <option value="json-resume">json-resume</option>
            </select>
          </div>
          <textarea
            value={importPayload}
            onChange={(event) => setImportPayload(event.target.value)}
            placeholder="Paste JSON payload"
            className="h-24 w-full rounded border border-gray-300 p-2 font-mono text-[11px]"
          />
          <button
            type="button"
            onClick={onImport}
            className="rounded border border-gray-300 bg-gray-50 px-3 py-1.5 text-xs text-gray-800 hover:bg-gray-100"
          >
            Import
          </button>
          {importStatus && <p className="text-[11px] text-gray-700">{importStatus}</p>}
        </section>
      </div>
    </aside>
  );
}
