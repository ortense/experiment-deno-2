import { Context } from "hono";
import { describe, it } from "jsr:@std/testing/bdd";
import { expect } from "jsr:@std/expect";
import { spy } from "jsr:@std/testing/mock";
import { snakeCaseResponseMiddleware } from "@lib/middleware.ts";

describe("snakeCaseResponseMiddleware", () => {
  function createMockContext(body: unknown, contentType = "application/json") {
    const jsonSpy = spy(() => body);

    let res = {
      headers: new Headers({ "Content-Type": contentType }),
      json: jsonSpy,
      status: 200,
      statusText: "OK",
    } as unknown as Response;

    const c = {
      set res(response: Response) {
        res = response;
      },
      get res() {
        return res;
      },
    } as unknown as Context;

    return { c, jsonSpy };
  }

  it("should transform response body keys to snake_case", async () => {
    const originalBody = { camelCaseKey: "value" };
    const { c, jsonSpy } = createMockContext(originalBody);
    const next = spy(async () => {});

    await snakeCaseResponseMiddleware(c, next);

    const transformedResponse = await c.res.json();
    expect(jsonSpy.calls.length).toBe(1);
    expect(transformedResponse).toEqual({ camel_case_key: "value" });
  });

  it("should not modify non-JSON responses", async () => {
    const { c, jsonSpy } = createMockContext("Non-JSON content", "text/plain");
    const next = spy(async () => {});

    await snakeCaseResponseMiddleware(c, next);

    expect(jsonSpy.calls.length).toBe(0);
    expect(c.res).toBeDefined();
  });
});

