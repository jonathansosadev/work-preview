import React from 'react';

function useSessionStorageState<T>(key: string, initState?: T) {
  const [state, setState] = React.useState<T>(() => {
    const persistedState = sessionStorage.getItem(key);

    if (persistedState) {
      try {
        return JSON.parse(persistedState);
      } catch (e) {
        return initState;
      }
    }

    return initState;
  });

  React.useEffect(() => {
    sessionStorage.setItem(key, JSON.stringify(state));
  }, [key, state]);

  return [state, setState] as const;
}

export {useSessionStorageState};
