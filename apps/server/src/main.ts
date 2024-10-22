import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { services } from "./services/router";
import { env, preflightENV } from "./lib/env";

preflightENV();

const app = express();

app.use(bodyParser.json());
app.use(cors({ origin: true, credentials: true }));

app.use("/api", services);

const port = env("PORT") || 8000;

app.listen(port, () => console.log(`Listening at http://localhost:${port}`));
