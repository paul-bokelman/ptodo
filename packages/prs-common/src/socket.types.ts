import type { Request } from "express";
import type { ExtWebSocket, PRSContext } from "./utils.types";

export type Event<D, R = void> = (methods: { ws: ExtWebSocket; req: Request }, data: D) => Promise<R>;
export type ClientEvent<D, R = void> = (data: D) => Promise<R> | R;

export type ConfirmEvent = Event<undefined>;
export type MoveIndexEvent = Event<{ direction: "left" | "right" }>;
export type GetContextEvent = Event<undefined>;

export interface ClientToServerEvents {
  confirm: ConfirmEvent;
  moveIndex: MoveIndexEvent;
  getContext: GetContextEvent;
}

export type PRSOnlineEvent = ClientEvent<boolean>;
export type RevalidateContextEvent = ClientEvent<{
  ctx: PRSContext;
  trigger?: "confirm-default" | "confirm-delete" | "moveIndex";
}>;

export interface ServerToClientEvents {
  prsOnline: PRSOnlineEvent;
  revalidateContext: RevalidateContextEvent;
}
