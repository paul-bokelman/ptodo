import type { Day, Task } from "@prisma/client";
import dayjs from "dayjs";
import { prisma } from "../../config";

export const getDay = async (incomingDate: Date | string = new Date()): Promise<(Day & { tasks: Task[] }) | null> => {
  const date = dayjs(incomingDate);
  const startOfDay = date.startOf("day").toDate();
  const endOfDay = date.endOf("day").toDate();

  try {
    let day = await prisma.day.findFirst({
      where: { date: { gte: startOfDay, lte: endOfDay } },
      include: { tasks: true },
    });

    if (!day) {
      day = await prisma.day.create({ data: { date: date.toDate() }, include: { tasks: true } });
    }

    day.tasks.sort((t1, t2) => {
      // should this be in controller?
      if (t1.complete) return 1;
      if (t2.complete) return -1;
      return 0;
    });

    return day;
  } catch (e) {
    throw new Error("Failed to get current day.");
  }
};

export const prismaUtils = { getDay };
