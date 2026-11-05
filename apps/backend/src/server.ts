import app from "./app.js";
import { env } from "./config/env.js";

const server = app.listen(env.PORT, () => {
  console.log(
    `WorkLedger API running at http://localhost:${env.PORT}`
  );
});

const shutdown = (signal: string) => {
  console.log(`${signal} received. Shutting down server...`);

  server.close(() => {
    console.log("Server closed.");
    process.exit(0);
  });
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));