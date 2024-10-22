import type { ReasonPhrases } from "http-status-codes";
import type { RequestHandler } from "express";
import type { ServerToClientEvents } from "./socket.types";
import * as ws from "ws";
import * as z from "zod";

export interface PRSContext {
  currentDayId: string;
  currentId: string;
  currentIndex: number;
  maxIndex: number;
  mode: "default" | "delete";
}

export interface ServerError {
  code: number;
  reason: ReasonPhrases;
  message?: string;
  errors?: unknown;
}

export type ControllerConfig = {
  params: unknown;
  body: unknown;
  query: unknown;
  payload: unknown;
};

export type Controller<C extends ControllerConfig> = RequestHandler<C["params"], C["payload"], C["body"], C["query"]>;

export type ToControllerConfig<S extends z.AnyZodObject, P = ControllerConfig["payload"]> = {
  params: z.infer<S>["params"];
  body: z.infer<S>["body"];
  query: z.infer<S>["query"];
  payload: P;
};

export interface ExtWebSocket extends ws {
  identifier?: string; // your custom property
  alive: boolean;
  success: ServerToClientSuccessEvent;
  error: ServerToClientErrorEvent;
  broadcast: <T extends keyof ServerToClientEvents>(data: ServerToClientEventArgs<T>) => void;
}

export type WebSocketResponseOptions = {
  scoped?: boolean;
};

export type ServerToClientErrorArgs = string;

export type ServerToClientEventArgs<T extends keyof ServerToClientEvents> =
  | [T, Parameters<ServerToClientEvents[T]>[0]]
  | ServerToClientErrorArgs;

export type ServerToClientSuccessArgs<T extends keyof ServerToClientEvents> = Exclude<
  ServerToClientEventArgs<T>,
  ServerToClientErrorArgs
>;

export type ServerToClientSuccessEvent = <T extends keyof ServerToClientEvents>(
  data: ServerToClientSuccessArgs<T>,
  options?: WebSocketResponseOptions
) => void;

export type ServerToClientErrorEvent = (message: ServerToClientErrorArgs, options?: WebSocketResponseOptions) => void;

export type UnionToIntersection<U> = (U extends unknown ? (k: U) => void : never) extends (k: infer I) => void
  ? I
  : never;
