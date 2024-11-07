import { Hono } from "hono";
import { describe, it } from "jsr:@std/testing/bdd";
import { spy } from "jsr:@std/testing/mock";
import { FakeTime } from "jsr:@std/testing/time";
import { expect } from "jsr:@std/expect";
import * as stdlog from "@std/log";
import { configure, humanize, loggerMiddleware, time } from "@lib/logger.ts";

describe("Lib Logger", () => {
  describe("configure", () => {
    it("should set the correct log level", () => {
      configure("WARN");
      expect(stdlog.getLogger().levelName).toBe("WARN");

      configure("INFO");
      expect(stdlog.getLogger().levelName).toBe("INFO");
    });
  });

  describe("humanize", () => {
    it("should format times correctly", () => {
      expect(humanize(["1000"])).toBe("1,000");
      expect(humanize(["1500ms"])).toBe("1,500ms");
      expect(humanize(["1000", "500ms"])).toBe("1,000.500ms");
    });
  });

  describe("time", () => {
    it("should calculate and format time delta correctly", () => {
      const start = Date.now() - 800;
      const formattedTime = time(start);
      expect(formattedTime).toBe("800ms");
    });

    it("should round seconds", () => {
      const start = Date.now() - 2100;
      const formattedTime = time(start);
      expect(formattedTime).toBe("2s");
    });
  });

  describe("middleware", () => {
    it("should log request details", async () => {
      using time = new FakeTime();
      const fakeLogger = { info: spy() };
      const fakeStdlog = {
        getLogger: () => fakeLogger,
      } as unknown as typeof stdlog;

      const app = new Hono();
      app.use("*", loggerMiddleware("DEBUG", fakeStdlog));

      const promise = app.request("/test");
      time.tick(1000);
      await promise;

      expect(fakeLogger.info.calls.length).toBe(2);
      expect(fakeLogger.info.calls[0].args).toEqual([
        "Incoming Request",
        {
          method: "GET",
          url: "http://localhost/test",
        },
      ]);
      expect(fakeLogger.info.calls[1].args).toEqual([
        "Outgoing Response",
        {
          method: "GET",
          status: 404,
          time: "1s",
          url: "http://localhost/test",
        },
      ]);
    });
  });
});
