import type { Response } from "express";
import type { ControllerConfig, ServerError } from "prs-common";
import { Prisma } from "@prisma/client";
import { StatusCodes, getReasonPhrase } from "http-status-codes";

export const handleControllerError = (e: unknown, res: Response) => {
  const { error } = formatResponse(res as Response<ServerError>);

  if (e instanceof Prisma.PrismaClientKnownRequestError || e instanceof Error) {
    return error(StatusCodes.INTERNAL_SERVER_ERROR, `Unhandled Exception: ${e.message}`);
  }

  return error(StatusCodes.INTERNAL_SERVER_ERROR);
};

export const formatResponse = <C extends ControllerConfig>(res: Response) => {
  return {
    success: (status: number, payload?: C["payload"]) => {
      if (!payload) return res.status(status);
      return res.status(status).json(payload);
    },
    error: (status: number, message?: string, errors?: unknown): Response<ServerError> => {
      return res.status(status).json({
        code: status,
        reason: getReasonPhrase(status),
        message: message ?? undefined,
        errors,
      });
    },
  };
};
