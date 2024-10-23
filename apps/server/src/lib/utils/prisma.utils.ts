import type { Day, Task } from "@prisma/client";
import fs from "fs";
import path from "path";
import { load as loadYaml } from "js-yaml";
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
      // load routine file
      const routineFile = fs.readFileSync(path.resolve(__dirname, "../../../prisma/data/routine.yaml"), {
        encoding: "utf-8",
      });

      const parsedRoutine = loadYaml(routineFile) as Record<string, string[]>;

      // create day with routine tasks
      day = await prisma.day.create({
        data: {
          date: date.toDate(),
          tasks: {
            createMany: {
              data: parsedRoutine[date.format("dddd").toLowerCase()].map((task) => ({ description: task })),
            },
          },
        },
        include: { tasks: true },
      });
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
