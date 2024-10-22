import { Router } from "express";
import { schemas } from "prs-common";
import * as controllers from "./controllers";
import { validate } from "../../middleware";

export const days = Router();

days.post("/:id/routine", validate(schemas.day.routine), controllers.importRoutine);
days.get("/", validate(schemas.day.get), controllers.getDay);
