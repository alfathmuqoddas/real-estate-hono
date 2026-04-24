import { Hono } from "hono";
import propertyRoutes from "@/modules/properties/properties.route";
import userRoutes from "@/modules/users/users.route";
import { AppError } from "./errors/app-error";
import { cors } from "hono/cors";

const app = new Hono();

app.use(
  "*",
  cors({
    origin: "http://localhost:4321",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    credentials: true,
  }),
);

app.route("/listings", propertyRoutes);
app.route("/users", userRoutes);

app.onError((err, c) => {
  console.error("GLOBAL ERROR:", err);
  if (err instanceof AppError) {
    return c.json({ message: err.message }, err.status);
  }
  return c.json({ message: "Internal Server Error" }, 500);
});

app.get("/health", (c) => c.json({ status: "ok" }));

export default app;
