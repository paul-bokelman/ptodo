import { Router } from "express";
import { schemas } from "prs-common";
import * as controllers from "./controllers";
import { validate } from "../../middleware";

export const tasks = Router();

tasks.get("/:id", validate(schemas.task.get), controllers.getTask);
tasks.post("/:id/update", validate(schemas.task.update), controllers.updateTask);
tasks.post("/:id/delete", validate(schemas.task.delete), controllers.deleteTask);
tasks.post("/create", validate(schemas.task.create), controllers.createTask);
