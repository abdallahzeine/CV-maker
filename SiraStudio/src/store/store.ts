import type {
  CVDocument,
  DispatchOptions,
  DispatchResult,
  Patch,
  StoreAPI,
} from './types';
import { createDispatcher } from './dispatch';
import { createHistory } from './history';
import { saveCVData } from '../utils/settings';

function toPatchArray(patch: Patch | Patch[]): Patch[] {
  return Array.isArray(patch) ? patch : [patch];
}

export function createCVStore(initial: CVDocument): StoreAPI {
  const state = { document: initial };
  const listeners = new Set<(nextDoc: CVDocument) => void>();
  const history = createHistory();
  let saveTimeout: ReturnType<typeof setTimeout> | null = null;

  const schedulePersist = (doc: CVDocument) => {
    if (saveTimeout !== null) {
      clearTimeout(saveTimeout);
    }

    saveTimeout = setTimeout(() => {
      saveCVData(doc);
      saveTimeout = null;
    }, 300);
  };

  const notify = () => {
    listeners.forEach((listener) => listener(state.document));
  };

  const getSnapshot = () => state.document;

  const subscribe = (cb: (nextDoc: CVDocument) => void) => {
    listeners.add(cb);
    return () => {
      listeners.delete(cb);
    };
  };

  const baseDispatch = createDispatcher(state);

  const dispatch = (patch: Patch | Patch[], opts?: DispatchOptions): DispatchResult => {
    const patches = toPatchArray(patch);
    const origin: DispatchOptions['origin'] = opts?.origin ?? 'editor';
    const result = baseDispatch(patches, opts);

    if (result.success) {
      if (
        origin !== 'undo' &&
        origin !== 'redo' &&
        typeof result.revision === 'number' &&
        (result.appliedPatches?.length ?? 0) > 0 &&
        (result.inversePatches?.length ?? 0) > 0
      ) {
        history.push({
          revision: result.revision,
          patches: result.appliedPatches ?? [],
          inverse: result.inversePatches ?? [],
          label: opts?.label ?? '',
          at: Date.now(),
          origin,
        });
      }

      schedulePersist(state.document);
      notify();
    }

    return result;
  };

  return {
    getSnapshot,
    subscribe,
    dispatch,
    history,
  };
}
