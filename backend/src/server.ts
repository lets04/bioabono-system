import { node } from "@elysiajs/node";
import { Elysia } from "elysia";
import { app } from "./app.js";
import { env } from "./config/env.js";

new Elysia({ adapter: node() })
  .use(app)
  .listen(env.port);

console.log(`BIOABONO API listening on http://localhost:${env.port}`);
