import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';

export type AsyncState<T> =
  | { status: 'loading' }
  | { status: 'error'; error: unknown }
  | { status: 'success'; data: T };

type Options = {
  /** Re-run `load` silently (keeping current data on screen) whenever the screen regains focus. */
  refetchOnFocus?: boolean;
};

/** Runs `load` on mount and whenever it changes identity, so callers must memoize it (e.g. with `useCallback`). */
export function useAsyncData<T>(load: () => Promise<T>, { refetchOnFocus = false }: Options = {}) {
  const [state, setState] = useState<AsyncState<T>>({ status: 'loading' });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    load().then(
      (data) => {
        if (!cancelled) setState({ status: 'success', data });
      },
      (error: unknown) => {
        if (!cancelled) setState({ status: 'error', error });
      }
    );
    return () => {
      cancelled = true;
    };
  }, [load, attempt]);

  // The mount effect above already covers the first focus, so skip it here to avoid a duplicate fetch.
  const hasFocusedOnce = useRef(false);
  useFocusEffect(
    useCallback(() => {
      if (!hasFocusedOnce.current) {
        hasFocusedOnce.current = true;
        return;
      }
      if (refetchOnFocus) setAttempt((n) => n + 1);
    }, [refetchOnFocus])
  );

  const reload = useCallback(() => {
    setState({ status: 'loading' });
    setAttempt((n) => n + 1);
  }, []);

  return { state, reload };
}
