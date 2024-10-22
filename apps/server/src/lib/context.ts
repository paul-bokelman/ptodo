import type { PRSContext } from "prs-common";
import fs from "fs";
import { prisma } from "../config";

const CONTEXT_FILE = "./context.json";

const defaultContext = async (): Promise<PRSContext> => {
  const day = await prisma.utils.getDay();
  return { currentDayId: day ? day.id : "", currentId: "", currentIndex: 0, maxIndex: 0, mode: "default" };
};

export const setContext = async (context: PRSContext | "reset") => {
  await fs.promises.writeFile(CONTEXT_FILE, JSON.stringify(context === "reset" ? await defaultContext() : context));
};

export const getContext = async (): Promise<PRSContext> => {
  if (!fs.existsSync(CONTEXT_FILE)) {
    await fs.promises.writeFile(CONTEXT_FILE, JSON.stringify(await defaultContext()));
  }
  const context = await fs.promises.readFile(CONTEXT_FILE, "utf-8");
  return JSON.parse(context) as PRSContext;
};

export const updateContext = async (update: (ctx: PRSContext) => Partial<PRSContext>) => {
  const ctx = await getContext();
  const updatedContext = update(ctx);
  await setContext({ ...ctx, ...updatedContext });
  return { ...ctx, ...updatedContext };
};

export const destroyContext = async () => {
  if (!fs.existsSync(CONTEXT_FILE)) return;
  await fs.promises.unlink(CONTEXT_FILE);
};

export const revalidateContext = async () => {
  let ctx = await getContext();
  const day = await prisma.utils.getDay();
  if (day) {
    ctx.currentDayId = day.id;
    if (day.tasks.length > 0) {
      ctx.maxIndex = day.tasks.length - 1;
      ctx.currentIndex = ctx.currentIndex > ctx.maxIndex ? 0 : ctx.currentIndex;
      ctx.currentId = day.tasks[ctx.currentIndex].id;
    }
  }
  try {
    await fs.promises.writeFile(CONTEXT_FILE, JSON.stringify(ctx));
    return ctx;
  } catch (error) {
    console.log("Failed to create context file: ", error);
    throw new Error("Failed to create context file");
  }
};

export const context = {
  revalidate: revalidateContext,
  set: setContext,
  get: getContext,
  update: updateContext,
  destroy: destroyContext,
};
