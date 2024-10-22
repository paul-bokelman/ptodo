import type { Controller, CreateTask } from "prs-common";
import { StatusCodes } from "http-status-codes";
import dayjs from "dayjs";
import { prisma } from "../../../config";
import { context } from "../../../lib";
import { formatResponse, handleControllerError } from "../../../lib/utils";

export const createTask: Controller<CreateTask> = async (req, res) => {
  const { success, error } = formatResponse<CreateTask>(res);

  try {
    const { day, ...taskData } = req.body;

    // use day id to connect to day
    if (typeof day === "object" && "id" in day) {
      const dayId = day.id;
      const existingDay = await prisma.day.findUnique({ where: { id: dayId } });
      if (!existingDay) return error(StatusCodes.NOT_FOUND, "Day not found");

      const task = await prisma.task.create({
        data: { day: { connect: { id: dayId } }, ...taskData },
        include: { day: true },
      });

      await context.update((ctx) => ({ maxIndex: ctx.maxIndex + 1 }));
      return success(StatusCodes.OK, task);
    }

    // use day date to connect or create day
    const date = dayjs(day);
    const existingDay = await prisma.day.findFirst({
      where: { date: { lte: date.endOf("day").toDate(), gte: date.startOf("day").toDate() } },
    });

    // the lines below can be condensed...
    if (!existingDay) {
      const newDay = await prisma.day.create({ data: { date: date.toDate() } });
      const task = await prisma.task.create({
        data: { day: { connect: { id: newDay.id } }, ...taskData },
        include: { day: true },
      });

      await context.update((ctx) => ({ maxIndex: ctx.maxIndex + 1 }));
      return success(StatusCodes.OK, task);
    }

    const task = await prisma.task.create({
      data: { day: { connect: { id: existingDay.id } }, ...taskData },
      include: { day: true },
    });

    await context.update((ctx) => ({ maxIndex: ctx.maxIndex + 1 }));
    return success(StatusCodes.OK, task);
  } catch (e) {
    return handleControllerError(e, res);
  }
};
