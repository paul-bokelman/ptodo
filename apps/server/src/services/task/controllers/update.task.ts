import type { Controller, UpdateTask } from "prs-common";
import { StatusCodes } from "http-status-codes";
import { prisma } from "../../../config";
import { formatResponse, handleControllerError } from "../../../lib/utils";

export const updateTask: Controller<UpdateTask> = async (req, res) => {
  const { success, error } = formatResponse<UpdateTask>(res);

  try {
    const task = await prisma.task.findUnique({ where: { id: req.params.id } });
    if (!task) return error(StatusCodes.BAD_REQUEST, "No task associated with that ID");

    const updatedTask = await prisma.task.update({ where: { id: req.params.id }, data: req.body });

    return success(StatusCodes.OK, updatedTask);
  } catch (e) {
    return handleControllerError(e, res);
  }
};
