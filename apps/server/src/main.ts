import type { UnionToIntersection, ClientToServerEvents, ExtWebSocket, PRSContext } from "prs-common";
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import WebSocket, { Instance } from "express-ws";
import { services } from "./services/router";
import { socketEvents } from "./services/socket/socket-events";
import { env, preflightENV } from "./lib/env";
import { wsUtils } from "./lib/utils";
import { context } from "./lib/context";

declare global {
  namespace Express {
    interface Request {
      context: PRSContext;
    }
  }
}

preflightENV();

(async () => await context.revalidate())();

export const instance: Instance = WebSocket(express());
const app = instance.app;

app.use(bodyParser.json());
app.use(cors({ origin: true, credentials: true }));

app.use("/api", services);

instance.getWss().on("connection", async (ws: ExtWebSocket, req) => {
  const { success, error, broadcast } = wsUtils(ws);
  (ws.success = success), (ws.error = error), (ws.broadcast = broadcast);

  if (req.url?.includes("?client=")) {
    const identifier = req.url.split("?client=")[1];
    ws.identifier = identifier;
  }

  if (ws.identifier === "physical") {
    ws.success(["prsOnline", true]);
  }

  if (ws.identifier === "web") {
    const ctx = await context.get();
    ws.success(["revalidateContext", { ctx }], { scoped: true });
    for (const client of instance.getWss().clients as Set<ExtWebSocket>) {
      if (client.identifier === "physical" && client.alive) {
        ws.success(["prsOnline", true]);
      }
    }
  }

  ws.on("pong", () => (ws.alive = true));

  ws.on("close", (e) => {
    if (ws.identifier === "physical") {
      broadcast(["prsOnline", false]);
    }
  });
});

const heartbeat = setInterval(function ping() {
  (instance.getWss().clients as Set<ExtWebSocket>).forEach((client) => {
    if (client.alive === false) return client.terminate();
    client.alive = false;
    client.ping();
  });
}, 1000); // change time depending on desired response time

instance.getWss().on("close", () => clearInterval(heartbeat));

app.ws("/ws", (websocket, req) => {
  let ws: ExtWebSocket = websocket as ExtWebSocket; // why can't I cast websocket directly to ExtWebSocket??
  const { success, error, broadcast } = wsUtils(ws);
  (ws.success = success), (ws.error = error), (ws.broadcast = broadcast);
  ws.on("message", async (msg, isBinary) => {
    const revalidatedContext = await context.revalidate();
    if (!revalidatedContext) throw new Error("Failed to revalidate context");
    req.context = revalidatedContext;
    if (isBinary) return ws.error("Binary messages are not supported");
    const [event, data] = JSON.parse(msg.toString()) as [
      keyof ClientToServerEvents,
      UnionToIntersection<Parameters<ClientToServerEvents[keyof ClientToServerEvents]>[number]>
    ];
    if (!Object.keys(socketEvents).includes(event)) return ws.error("Invalid event");
    await socketEvents[event]({ ws, req }, data);
  });
});

const port = env("PORT") || 8000;

app.listen(port, () => console.log(`Listening at http://localhost:${port}`));
