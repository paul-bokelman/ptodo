import type { Controller, GetDay } from "prs-common";
import { StatusCodes } from "http-status-codes";
import dayjs from "dayjs";
import { prisma } from "../../../config";
import { formatResponse, handleControllerError } from "../../../lib/utils";

export const getDay: Controller<GetDay> = async (req, res) => {
  const { success, error } = formatResponse<GetDay>(res);

  try {
    const day = await prisma.utils.getDay(req.query.date);

    const totalCompleted = await prisma.task.count({
      where: { complete: { equals: true } },
    });

    let streak = 0;

    const days = await prisma.day.findMany({
      where: { date: { lte: dayjs().add(-1, "day").endOf("day").toDate() } },
      select: { tasks: { select: { complete: true } }, date: true },
      orderBy: { date: "asc" },
    });

    for (const day of days) {
      if (day.tasks.find((task) => task.complete === false) !== undefined) {
        streak = 0;
        continue;
      }
      streak = streak + 1;
    }

    const ratioCalculation = ((totalCompleted / (await prisma.task.count())) * 100).toPrecision(4);
    let ratio: GetDay["payload"]["stats"]["ratio"] = { incline: false, value: "" };
    ratio.value = `${ratioCalculation}%`;
    ratio.incline = parseFloat(ratioCalculation) > 50 ? true : false;

    const stats: GetDay["payload"]["stats"] = { streak, totalCompleted, ratio };

    if (!day) return error(StatusCodes.BAD_REQUEST, "No day associated with date");
    return success(StatusCodes.OK, { stats, ...day });
  } catch (e) {
    return handleControllerError(e, res);
  }
};
