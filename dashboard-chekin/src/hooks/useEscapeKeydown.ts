import React from 'react';

function useEscapeKeydown(onKeydown: () => void) {
  const handleKeydown = React.useRef<(event: KeyboardEvent) => void>(() => {});
  handleKeydown.current = (event) => {
    const escapeKeyCode = 27;
    if (event.keyCode === escapeKeyCode) {
      onKeydown();
    }
  };

  React.useEffect(() => {
    document.addEventListener('keydown', handleKeydown.current);
    return () => {
      document.removeEventListener('keydown', handleKeydown.current);
    };
  }, []);
}

export {useEscapeKeydown};
