import { Router } from "express";
import { tasks } from "./task";
import { days } from "./day";

export const services = Router();

services.use("/tasks", tasks);
services.use("/days", days);
