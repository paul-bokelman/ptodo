import type { Controller, UpdateTask } from "ptodo-common";
import { StatusCodes } from "http-status-codes";
import { prisma } from "../../../config";
import { formatResponse, handleControllerError } from "../../../lib/utils";

export const updateTask: Controller<UpdateTask> = async (req, res) => {
  const { success, error } = formatResponse<UpdateTask>(res);

  try {
    const task = await prisma.task.findUnique({ where: { id: req.params.id } });
    if (!task) return error(StatusCodes.BAD_REQUEST, "No task associated with that ID");

    const { time = undefined, ...rest } = req.body;
    let timeStart: string | null = task.timeStart;
    let timeEnd: string | null = task.timeEnd;

    if (time) {
      let [rawTimeStart, rawTimeEnd] = time.split("-");
      timeStart = rawTimeStart;
      timeEnd = rawTimeEnd;
    }

    const updatedTask = await prisma.task.update({
      where: { id: req.params.id },
      data: {
        timeStart: timeStart,
        timeEnd: timeEnd,
        ...rest,
      },
    });

    return success(StatusCodes.OK, updatedTask);
  } catch (e) {
    return handleControllerError(e, res);
  }
};
