import type { Controller, ImportRoutine } from "prs-common";
import fs from "fs";
import path from "path";
import { Day, Prisma, Task } from "@prisma/client";
import { parse } from "csv-parse";
import { StatusCodes } from "http-status-codes";
import { prisma } from "../../../config";
import { formatResponse, handleControllerError } from "../../../lib/utils";

export const importRoutine: Controller<ImportRoutine> = async (req, res) => {
  const { success, error } = formatResponse<ImportRoutine>(res);
  const { id } = req.params;

  try {
    const day = await prisma.day.findUnique({ where: { id }, include: { tasks: true } });
    if (!day) return error(StatusCodes.BAD_REQUEST, "No day associated with given id");

    const routineDataPath = path.resolve(__dirname, "../../../../prisma/data/routine.csv");

    const prevDaysData = fs.readFileSync(routineDataPath, { encoding: "utf-8" });

    const tasks = await new Promise<Array<Prisma.TaskCreateManyInput>>((resolve, reject) => {
      const tasks: Array<Prisma.TaskCreateManyInput> = [];
      parse(prevDaysData, { delimiter: ",", columns: ["description"] }, (e, data: Pick<Task, "description">[]) => {
        if (e) throw reject(e);
        for (let { description } of data) {
          tasks.push({ dayId: day.id, description });
        }
        resolve(tasks);
      });
    });

    // doesn't skip over entries that already exist... should be tweaked
    await prisma.task.createMany({ data: tasks, skipDuplicates: true });

    return success(StatusCodes.OK, day);
  } catch (e) {
    return handleControllerError(e, res);
  }
};
