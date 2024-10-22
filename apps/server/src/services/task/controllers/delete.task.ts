import type { Controller, DeleteTask } from "prs-common";
import { StatusCodes } from "http-status-codes";
import { prisma } from "../../../config";
import { formatResponse, handleControllerError } from "../../../lib/utils";
import { context } from "../../../lib";

export const deleteTask: Controller<DeleteTask> = async (req, res) => {
  const { success, error } = formatResponse<DeleteTask>(res);
  try {
    const task = await prisma.task.findUnique({
      where: { id: req.params.id },
      select: { day: { select: { tasks: true } } },
    });
    if (!task) return error(StatusCodes.BAD_REQUEST, "No task associated with that ID");

    const deletedTask = await prisma.task.delete({
      where: { id: req.params.id },
      include: { day: { include: { tasks: true } } },
    });

    // if this task was the last one reset context
    if (task.day.tasks.length === 1) {
      await context.set("reset");
      return success(StatusCodes.OK, deletedTask);
    }

    await context.update((ctx) => {
      ctx.maxIndex = ctx.maxIndex - 1; // should be ok... right?
      if (ctx.currentIndex > ctx.maxIndex) {
        ctx.currentIndex = ctx.currentIndex - 1;
        ctx.currentId = deletedTask.day.tasks[ctx.currentIndex - 1].id;
      }
      return ctx;
    });

    return success(StatusCodes.OK, deletedTask);
  } catch (e) {
    return handleControllerError(e, res);
  }
};
