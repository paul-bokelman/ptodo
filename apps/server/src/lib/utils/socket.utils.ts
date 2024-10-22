import * as ws from "ws";
import type {
  ServerToClientEvents,
  WebSocketResponseOptions,
  ServerToClientEventArgs,
  ServerToClientSuccessEvent,
  ServerToClientErrorEvent,
} from "prs-common";
import { instance } from "../../main";

const broadcast = <T extends keyof ServerToClientEvents>(data: ServerToClientEventArgs<T>) =>
  instance.getWss().clients.forEach((client) => client.send(typeof data === "string" ? data : JSON.stringify(data)));

const success = <T extends keyof ServerToClientEvents>(
  client: ws,
  data: ServerToClientEventArgs<T>,
  options?: WebSocketResponseOptions
) => {
  if (typeof options !== "undefined" && options.scoped) {
    return client.send(typeof data === "string" ? data : JSON.stringify(data));
  }
  return broadcast(data);
};

const error = (client: ws, message: Parameters<ServerToClientErrorEvent>[0], options?: WebSocketResponseOptions) => {
  const errorString = JSON.stringify({ error: true, message });
  if (typeof options !== "undefined" && options.scoped) {
    return client.send(errorString);
  }
  return broadcast(errorString);
};

export const wsUtils = (client: ws) => {
  return {
    error: ((message, options) => error(client, message, options)) as ServerToClientErrorEvent,
    success: ((data, options) => success(client, data, options)) as ServerToClientSuccessEvent,
    broadcast,
  };
};
