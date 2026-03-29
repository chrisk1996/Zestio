'use client';
import { useState, useCallback, useRef } from 'react';

interface UndoRedoState<T> {
  past: T[];
  present: T;
  future: T[];
}

export function useUndoRedo<T>(initialState: T, maxHistory: number = 50) {
  const [state, setState] = useState<UndoRedoState<T>>({
    past: [],
    present: initialState,
    future: [],
  });

  const canUndo = state.past.length > 0;
  const canRedo = state.future.length > 0;

  const set = useCallback((newPresent: T) => {
    setState((prevState) => {
      const { past, present } = prevState;
      
      // Don't add to history if value hasn't changed
      if (JSON.stringify(present) === JSON.stringify(newPresent)) {
        return prevState;
      }

      const newPast = [...past, present];
      
      // Limit history size
      if (newPast.length > maxHistory) {
        newPast.shift();
      }

      return {
        past: newPast,
        present: newPresent,
        future: [], // Clear future on new action
      };
    });
  }, [maxHistory]);

  const undo = useCallback(() => {
    setState((prevState) => {
      const { past, present, future } = prevState;

      if (past.length === 0) return prevState;

      const previous = past[past.length - 1];
      const newPast = past.slice(0, -1);

      return {
        past: newPast,
        present: previous,
        future: [present, ...future],
      };
    });
  }, []);

  const redo = useCallback(() => {
    setState((prevState) => {
      const { past, present, future } = prevState;

      if (future.length === 0) return prevState;

      const next = future[0];
      const newFuture = future.slice(1);

      return {
        past: [...past, present],
        present: next,
        future: newFuture,
      };
    });
  }, []);

  const reset = useCallback((newPresent: T) => {
    setState({
      past: [],
      present: newPresent,
      future: [],
    });
  }, []);

  return {
    state: state.present,
    set,
    undo,
    redo,
    canUndo,
    canRedo,
    reset,
  };
}

// Keyboard shortcut handler for undo/redo
export function useUndoRedoKeyboard(undo: () => void, redo: () => void, enabled: boolean = true) {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!enabled) return;
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    const ctrlKey = isMac ? e.metaKey : e.ctrlKey;

    if (ctrlKey && e.key === 'z' && !e.shiftKey) {
      e.preventDefault();
      undo();
    }

    if (ctrlKey && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
      e.preventDefault();
      redo();
    }
  }, [enabled, undo, redo]);

  // Note: caller should useEffect to attach/detach event listener
  return handleKeyDown;
}
