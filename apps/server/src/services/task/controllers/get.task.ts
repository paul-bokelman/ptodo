import type { Controller, GetTask } from "prs-common";
import { StatusCodes } from "http-status-codes";
import { prisma } from "../../../config";
import { formatResponse, handleControllerError } from "../../../lib/utils";

export const getTask: Controller<GetTask> = async (req, res) => {
  const { success, error } = formatResponse<GetTask>(res);
  try {
    const task = await prisma.task.findUnique({ where: { id: req.params.id }, include: { day: true } });
    if (!task) return error(StatusCodes.BAD_REQUEST, "No task associated with that ID");
    return success(StatusCodes.OK, task); // casting because task.day is never null
  } catch (e) {
    return handleControllerError(e, res);
  }
};
