import React from 'react';
import * as Sentry from '@sentry/react';
import {getTokenFromLocalStorage} from '../api';
import {useAuth} from './auth';

const BASE_DOMAIN = process.env.REACT_APP_DOMAIN;
const IS_DEV_MODE = process.env.NODE_ENV === 'development';
const PING_INTERVAL_S = 10;
const RECONNECT_TIMEOUT_S = 2;

export type ContextProps = {
  send: (message: any) => void;
  message: any;
  clearMessage: () => void;
};

const WebsocketContext = React.createContext<ContextProps>({
  send: (message: any) => {},
  clearMessage: () => {},
  message: {event_type: null},
});

function WebsocketProvider(props: any) {
  const ws = React.useRef<WebSocket>();
  const {isTokenValid} = useAuth();
  const [message, setMessage] = React.useState('');
  const pingRef = React.useRef(0);
  const reconnectRef = React.useRef<any>(0);
  const shouldReconnectRef = React.useRef(true);
  const token = getTokenFromLocalStorage();

  const clearMessage = React.useCallback(() => {
    setMessage('');
  }, []);

  const cleanup = React.useCallback(() => {
    shouldReconnectRef.current = false;
    clearInterval(pingRef.current);
    clearTimeout(reconnectRef.current);
    ws?.current?.close();
  }, []);

  const setupPingInterval = React.useCallback((event: any) => {
    pingRef.current = setInterval(() => {
      const readyState = event?.currentTarget?.readyState || event?.target?.readyState;
      const isWebSocketClosed = readyState && readyState !== WebSocket.OPEN;

      if (isWebSocketClosed) {
        return;
      }

      ws.current?.send(JSON.stringify({ping: +new Date()}));
    }, [PING_INTERVAL_S * 1000]);
  }, []);

  const handleWebSocketOpen = React.useCallback(
    (event: any) => {
      setupPingInterval(event);
      clearTimeout(reconnectRef.current);

      if (IS_DEV_MODE) {
        console.log('%c [WS opened]', 'color: #35E5BC');
      }
    },
    [setupPingInterval],
  );

  const handleWebSocketError = React.useCallback(
    (error: Event) => {
      const isWebSocketClosed = ws?.current?.readyState !== WebSocket.OPEN;

      if (isTokenValid) {
        try {
          const stringifiedError = JSON.stringify(error);
          Sentry.captureMessage(`Websocket Error: ${stringifiedError}`);
        } catch {}
      }

      if (isWebSocketClosed) {
        return;
      }

      ws.current?.close();
    },
    [isTokenValid],
  );

  const handleWebSocketMessage = React.useCallback((event: WebSocketMessageEvent) => {
    const message = JSON.parse(event.data);
    setMessage(message);
  }, []);

  const handleWebSocketClose = React.useCallback(
    (event: CloseEvent, reconnectionCallback: () => void) => {
      const canReconnect = shouldReconnectRef.current && isTokenValid;

      if (canReconnect) {
        reconnectRef.current = setTimeout(() => {
          reconnectionCallback();
        }, RECONNECT_TIMEOUT_S * 1000);

        if (IS_DEV_MODE) {
          console.log(
            `%c [WS closed] Reconnecting in ${RECONNECT_TIMEOUT_S} seconds.`,
            'color: #FF2467',
          );
        }
        return;
      }

      Sentry.captureMessage(
        `Websocket closed. Code: ${event?.code}, reason: ${event?.reason}, wasClean: ${event?.wasClean}`,
      );
      if (IS_DEV_MODE) {
        console.log(`%c [WS closed]`, 'color: #FF2467');
      }
    },
    [isTokenValid],
  );

  const connect = React.useCallback(() => {
    const connectionURL = `wss://${BASE_DOMAIN}/ws/?token=${token}`;
    shouldReconnectRef.current = true;

    ws.current = new WebSocket(connectionURL);

    ws.current.onopen = handleWebSocketOpen;
    ws.current.onerror = handleWebSocketError;
    ws.current.onmessage = handleWebSocketMessage;
    ws.current.onclose = event => {
      handleWebSocketClose(event, connect);
    };
  }, [
    handleWebSocketClose,
    handleWebSocketError,
    handleWebSocketMessage,
    handleWebSocketOpen,
    token,
  ]);

  React.useEffect(
    function setupConnection() {
      const unauthed = !token || !isTokenValid;
      const reconnect = () => {
        const isWebSocketClosed = ws?.current?.readyState !== WebSocket.OPEN;
        if (isWebSocketClosed) {
          cleanup();
          connect();
        }
      };

      if (unauthed) {
        cleanup();
      } else {
        connect();
        window.addEventListener('focus', reconnect);
      }

      return () => {
        cleanup();
        window.removeEventListener('focus', reconnect);
      };
    },
    [cleanup, connect, isTokenValid, token],
  );

  return (
    <WebsocketContext.Provider
      value={{
        message,
        clearMessage,
        send: ws?.current?.send,
      }}
      {...props}
    />
  );
}

function useWebsocket() {
  const context = React.useContext(WebsocketContext);

  if (context === undefined) {
    throw new Error(`useWebsocket must be used within a WebsocketProvider`);
  }
  return context;
}

export {WebsocketContext, WebsocketProvider, useWebsocket};
