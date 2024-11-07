import * as stdlog from "@std/log";
import { MiddlewareHandler } from "hono";

export function configure(level: stdlog.LevelName) {
  stdlog.setup({
    handlers: {
      default: new stdlog.ConsoleHandler(level, {
        formatter: stdlog.formatters.jsonFormatter,
        useColors: false,
      }),
    },
    loggers: {
      default: { level },
    },
  });

  return stdlog;
}

export const humanize = (times: string[]) => {
  const [delimiter, separator] = [",", "."];

  const orderTimes = times.map((v) =>
    v.replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1" + delimiter)
  );

  return orderTimes.join(separator);
};

export const time = (start: number) => {
  const delta = Date.now() - start;
  return humanize([
    delta < 1000 ? delta + "ms" : Math.round(delta / 1000) + "s",
  ]);
};

export function loggerMiddleware(
  level: stdlog.LevelName = "DEBUG",
  mod = stdlog,
): MiddlewareHandler {
  configure(level);

  return async (c, next) => {
    const logger = mod.getLogger();
    const { method, url } = c.req;
    const start = Date.now();

    logger.info("Incoming Request", { method, url });

    await next();

    logger.info("Outgoing Response", {
      method,
      url,
      status: c.res.status,
      time: time(start),
    });
  };
}
