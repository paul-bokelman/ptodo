import type { Day, Task } from "@prisma/client";
import type { ToControllerConfig } from "./utils.types";
import * as z from "zod";

/* ---------------------------------- DAYS ---------------------------------- */

export type GetDay = ToControllerConfig<
  typeof getDaySchema,
  Day & {
    tasks: Array<Task>;
    stats: { streak: number; totalCompleted: number; ratio: { incline: boolean; value: string } };
  }
>;

const getDaySchema = z.object({ query: z.object({ date: z.string() }) });

/* ---------------------------------- TASKS --------------------------------- */

export type GetTask = ToControllerConfig<typeof getTaskSchema, Task & { day: Day }>;
const getTaskSchema = z.object({ params: z.object({ id: z.string() }) });

export type UpdateTask = ToControllerConfig<typeof updateTaskSchema, Task>;
const updateTaskSchema = z.object({
  params: z.object({ id: z.string() }),
  body: z
    .object({
      description: z.string().max(50, "Cannot exceed 50 characters").min(3, "Cannot be less than 3 characters"),
      time: z
        .string()
        .max(11, "Time cannot exceed 11 characters")
        .refine(
          (time) => {
            if (time.length == 0) {
              return true;
            }

            if (!time.includes("-") || !time.includes(":") || time.split(":").length != 3) {
              return false;
            }

            return true;
          },
          { message: "Time must be in format hh:mm-hh:mm" }
        ),
      complete: z.boolean(),
      dayId: z.string(),
    })
    .partial()
    .refine(
      ({ description, complete, dayId, time }) =>
        description !== undefined || complete !== undefined || dayId !== undefined || time !== undefined,
      { message: "One of the fields must be defined" }
    ),
});

export type DeleteTask = ToControllerConfig<typeof deleteTaskSchema, Task & { day: Day }>;
const deleteTaskSchema = z.object({ params: z.object({ id: z.string() }) });

export type CreateTask = ToControllerConfig<typeof createTaskSchema, Task & { day: Day }>;
const createTaskSchema = z.object({
  body: z.object({
    description: z.string().max(50, "Cannot exceed 50 characters").min(3, "Cannot be less than 3 characters"),
    complete: z.boolean().default(false),
    day: z.object({ id: z.string() }).or(z.string()),
  }),
});

/* --------------------------------- SCHEMAS -------------------------------- */

export const schemas = {
  day: { get: getDaySchema },
  task: {
    get: getTaskSchema,
    update: updateTaskSchema,
    delete: deleteTaskSchema,
    create: createTaskSchema,
  },
};
