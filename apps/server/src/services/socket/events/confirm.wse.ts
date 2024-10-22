import type { ConfirmEvent } from "prs-common";
import { prisma } from "../../../config";
import { context } from "../../../lib/context";

export const confirmEvent: ConfirmEvent = async ({ ws, req }) => {
  const { currentId, mode } = req.context;

  if (!currentId) return ws.error("No task id present");
  if (!mode) return ws.error("No mode present");
  if (!["default", "delete"].includes(mode)) return ws.error("Invalid mode");

  const task = await prisma.task.findUnique({ where: { id: currentId } });
  if (!task) return ws.error("Task not found");
  if (mode === "default") {
    await prisma.task.update({ where: { id: currentId }, data: { complete: { set: !task.complete } } });

    const ctx = await context.revalidate();
    return ws.success(["revalidateContext", { ctx, trigger: "confirm-default" }]);
  }

  await prisma.task.delete({ where: { id: currentId } });
  const ctx = await context.revalidate();
  return ws.success(["revalidateContext", { ctx, trigger: "confirm-delete" }]);
};
