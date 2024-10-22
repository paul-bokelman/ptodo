import type { GetContextEvent } from "prs-common";

//? rename to updateContextEvent? or requestContext
export const getContext: GetContextEvent = async ({ ws, req }) => {
  return ws.success(["revalidateContext", { ctx: req.context }], { scoped: true });
};
