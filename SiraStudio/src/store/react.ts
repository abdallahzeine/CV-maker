import { useContext, useRef, useSyncExternalStore } from 'react';
import { CVStoreContext } from './storeContext';
import { shallowEqual } from './shallowEqual';
import type {
  CVDocument,
  CVSelector,
  StoreAPI,
} from './types';

type SelectorCache<T> =
  | { hasValue: false }
  | { hasValue: true; value: T };

export function useCVStore(): CVDocument {
  const store = useContext(CVStoreContext);

  if (!store) {
    throw new Error('useCVStore outside CVStoreProvider');
  }

  return useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);
}

export function useCVSelector<T>(selector: CVSelector<T>): T {
  const store = useContext(CVStoreContext);
  const cacheRef = useRef<SelectorCache<T>>({ hasValue: false });

  if (!store) {
    throw new Error('useCVSelector outside CVStoreProvider');
  }

  const getSelectedSnapshot = () => {
    const next = selector(store.getSnapshot());
    const previous = cacheRef.current;

    if (previous.hasValue && shallowEqual(previous.value, next)) {
      return previous.value;
    }

    cacheRef.current = { hasValue: true, value: next };
    return next;
  };

  return useSyncExternalStore(
    store.subscribe,
    getSelectedSnapshot,
    getSelectedSnapshot
  );
}

export function useDispatch(): StoreAPI['dispatch'] {
  const store = useContext(CVStoreContext);

  if (!store) {
    throw new Error('useDispatch outside CVStoreProvider');
  }

  return store.dispatch;
}

export function useHistory(): StoreAPI['history'] {
  const store = useContext(CVStoreContext);

  if (!store) {
    throw new Error('useHistory outside CVStoreProvider');
  }

  return store.history;
}
