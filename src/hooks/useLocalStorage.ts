import { useCallback } from 'react';

type UseLocalStorage<T> = {
  getItem: () => T | null;
  setItem: (value: T) => void;
  removeItem: () => void;
};

const useLocalStorage = <T>(key: string): UseLocalStorage<T> => {
  const isClient = typeof window !== 'undefined';

  const getItem = useCallback((): T | null => {
    if (!isClient) return null;
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return null;
    }
  }, [isClient, key]);

  const setItem = useCallback((value: T): void => {
    if (!isClient) return;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, [isClient, key]);

  const removeItem = useCallback((): void => {
    if (!isClient) return;
    try {
      window.localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  }, [isClient, key]);

  return { getItem, setItem, removeItem };
};

export default useLocalStorage;
