import type { ClientToServerEvents } from "prs-common";

interface ExtendedWebSocket extends WebSocket {
  dispatch: WebSocketSend;
}

type WebSocketSend = <T extends keyof ClientToServerEvents>(
  message: Parameters<ClientToServerEvents[T]>[1] extends undefined ? [T] : [T, Parameters<ClientToServerEvents[T]>[1]]
) => void;

// needs to be env var
export const ws = new WebSocket(`ws://${import.meta.env.VITE_SERVER_HOST}/ws?client=web`) as ExtendedWebSocket;

const dispatch: WebSocketSend = (message) => {
  return ws.send(JSON.stringify(message));
};

ws.dispatch = dispatch;
