import * as fs from "fs";
import * as path from "path";
import { PrismaClient, Day, Task, Prisma } from "@prisma/client";
import dayjs from "dayjs";
import { parse } from "csv-parse";
import { context } from "../src/lib";

const prisma = new PrismaClient();

(async () => {
  try {
    await prisma.task.deleteMany();
    await prisma.day.deleteMany();

    const prevDaysDataPath = path.resolve(__dirname, "./data/prev-prs-days.csv");
    const prevTasksDataPath = path.resolve(__dirname, "./data/prev-prs-tasks.csv");

    const prevDaysData = fs.readFileSync(prevDaysDataPath, { encoding: "utf-8" });
    const prevTasksData = fs.readFileSync(prevTasksDataPath, { encoding: "utf-8" });

    const days = await new Promise<Array<Prisma.DayCreateManyInput>>((resolve, reject) => {
      const days: Array<Prisma.DayCreateManyInput> = [];
      parse(prevDaysData, { delimiter: ",", columns: ["id", "date", "createdAt", "updatedAt"] }, (e, data: Day[]) => {
        if (e) throw reject(e);
        for (let { id, date, createdAt, updatedAt } of data) {
          days.push({
            id,
            date: dayjs(date).toDate(),
            createdAt: dayjs(createdAt).toDate(),
            updatedAt: dayjs(updatedAt).toDate(),
          });
        }
        resolve(days);
      });
    });

    const tasks = await new Promise<Array<Prisma.TaskCreateManyInput>>((resolve, reject) => {
      const tasks: Array<Prisma.TaskCreateManyInput> = [];
      parse(
        prevTasksData,
        {
          delimiter: ",",
          columns: ["id", "description", "complete", "reoccurring", "dayId", "createdAt", "updatedAt"],
        },
        (
          e,
          // stupid hack due to postgres exporting boolean as t/f... WHY ???
          data: (Omit<Task, "day" | "complete" | "reoccurring"> & {
            complete: string;
            reoccurring: string;
          })[]
        ) => {
          if (e) throw reject(e);
          for (let { complete, reoccurring, createdAt, updatedAt, ...task } of data) {
            tasks.push({
              complete: complete === "t" ? true : false,
              createdAt: dayjs(createdAt).toDate(),
              updatedAt: dayjs(updatedAt).toDate(),
              ...task,
            });
          }
          resolve(tasks);
        }
      );
    });

    await prisma.day.createMany({ data: days });
    await prisma.task.createMany({ data: tasks });

    // await context.destroy();
    await prisma.$disconnect();
  } catch (e) {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  }
})();
