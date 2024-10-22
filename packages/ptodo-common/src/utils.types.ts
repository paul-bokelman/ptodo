import type { ReasonPhrases } from "http-status-codes";
import type { RequestHandler } from "express";
import * as z from "zod";

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
