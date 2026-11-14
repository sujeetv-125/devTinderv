const express = require("express");
const cookieParser = require("cookie-parser");

const authRouter = require("./routes/auth");
const profileRouter = require("./routes/profile");
const requestRouter = require("./routes/requests");
const userRouter = require("./routes/users");

function createApp() {
  const app = express();
  app.disable("x-powered-by");
  app.use(express.json({ limit: "20kb" }));
  app.use(cookieParser());

  app.get("/health", (_req, res) => {
    res.status(200).json({ status: "ok", service: "devbridge-api" });
  });

  // Versioned API plus root-level aliases for backward compatibility.
  for (const router of [authRouter, profileRouter, requestRouter, userRouter]) {
    app.use("/api/v1", router);
    app.use(router);
  }

  app.use((_req, res) => res.status(404).json({ message: "Route not found." }));
  app.use((error, _req, res, _next) => {
    if (res.headersSent) return;
    const status = error.statusCode || error.status || 500;
    res.status(status).json({
      message: status >= 500 ? "Something went wrong." : error.message,
    });
  });

  return app;
}

const app = createApp();

async function startServer() {
  const connectDB = require("./config/database");
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    throw new Error("JWT_SECRET must be a random value of at least 32 characters.");
  }
  await connectDB();
  const port = Number(process.env.PORT) || 7777;
  return app.listen(port, () => console.log("DevBridge API listening on port " + port));
}

if (require.main === module) {
  startServer().catch((error) => {
    console.error("Unable to start DevBridge API:", error.message);
    process.exitCode = 1;
  });
}

module.exports = { app, createApp, startServer };
