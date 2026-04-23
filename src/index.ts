import { Hono } from "hono";
import propertyRoutes from "@/modules/properties/properties.route";
import userRoutes from "@/modules/users/users.route";

const app = new Hono();

app.route("/listings", propertyRoutes);
app.route("/users", userRoutes);

// Optional: global error handler
app.onError((err, c) => {
  console.error(err);
  return c.json({ error: "Internal Server Error" }, 500);
});

// Optional: health check route
app.get("/health", (c) => c.json({ status: "ok" }));

export default app;
