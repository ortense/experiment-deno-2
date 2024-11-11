import { MiddlewareHandler } from "hono";
import { convertKeysToSnakeCase } from "@lib/to-snake-case.ts";

export const snakeCaseResponseMiddleware: MiddlewareHandler = async (
  c,
  next,
) => {
  await next();
  if (c.res.headers.get("Content-Type")?.includes("application/json")) {
    const body = await c.res.json();
    const parsed = convertKeysToSnakeCase(body);
    const res = new Response(JSON.stringify(parsed), {
      status: c.res.status,
      statusText: c.res.statusText,
      headers: c.res.headers,
    });

    c.res = res;
  }
};
