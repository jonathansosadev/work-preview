import React from 'react';
import {getTokenFromLocalStorage} from '../api';
import {useAuth} from './auth';
import {WS_TEST_URL} from '../utils/constants';

const BASE_DOMAIN = process.env.REACT_APP_DOMAIN;
const DEV_MODE = process.env.NODE_ENV === 'development';
const TEST_MODE = process.env.NODE_ENV === 'test';

const PING_INTERVAL_S = 5;
const RECONNECT_INTERVAL_S = 2;

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
  const pingRef = React.useRef<ReturnType<typeof setInterval>>();
  const reconnectRef = React.useRef<ReturnType<typeof setTimeout>>();
  const shouldReconnectRef = React.useRef<boolean>(true);
  const {isTokenValid} = useAuth();
  const token = getTokenFromLocalStorage();

  const [message, setMessage] = React.useState('');

  const clearMessage = React.useCallback(() => {
    setMessage('');
  }, []);

  const cleanup = React.useCallback(() => {
    shouldReconnectRef.current = false;

    if (pingRef.current) {
      clearInterval(pingRef.current);
    }

    if (reconnectRef.current) {
      clearTimeout(reconnectRef.current);
    }

    ws?.current?.close();
  }, []);

  const connect = React.useCallback(() => {
    if (TEST_MODE) {
      ws.current = new WebSocket(WS_TEST_URL);
    } else {
      ws.current = new WebSocket(`wss://${BASE_DOMAIN}/ws/?token=${token}`);
    }

    shouldReconnectRef.current = true;

    ws.current.onopen = (e: any) => {
      pingRef.current = setInterval(() => {
        const readyState = e?.currentTarget?.readyState || e?.target?.readyState;
        const isWebSocketClosed = readyState && readyState !== WebSocket.OPEN;

        if (isWebSocketClosed) {
          return;
        }

        ws?.current?.send(JSON.stringify({ping: +new Date()}));
      }, PING_INTERVAL_S * 1000);

      if (reconnectRef.current) {
        clearTimeout(reconnectRef.current);
      }

      if (DEV_MODE) {
        console.log('%c [WS opened]', 'color: #35E5BC');
      }
    };

    ws.current.onclose = () => {
      if (shouldReconnectRef.current) {
        reconnectRef.current = setTimeout(() => {
          connect();
        }, RECONNECT_INTERVAL_S * 1000);

        if (DEV_MODE) {
          console.log(
            `%c [WS closed] Reconnecting in ${RECONNECT_INTERVAL_S} seconds.`,
            'color: #FF2467',
          );
        }
        return;
      }

      if (DEV_MODE) {
        console.log(`%c [WS closed]`, 'color: #FF2467');
      }
    };

    ws.current.onerror = (error) => {
      const isWebSocketClosed = ws?.current?.readyState !== WebSocket.OPEN;

      console.error(error);

      if (isWebSocketClosed) {
        return;
      }

      ws?.current?.close();
    };

    ws.current.onmessage = (event) => {
      const message = JSON.parse(event.data);
      setMessage(message);
    };
  }, [token]);

  React.useEffect(() => {
    if ((!token || !isTokenValid) && !TEST_MODE) {
      cleanup();
    } else {
      connect();
    }

    return () => {
      cleanup();
    };
  }, [cleanup, connect, isTokenValid, token]);

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
