import { Hono } from "hono";
import { DB } from "sqlite";
import { createTransactionRouter } from "@module/transaction/transaction.router.ts";
import { createTransactionRepositorySQL } from "@module/transaction/repository/transaction-sql.ts";
import { createPayableRepositorySQL } from "@module/transaction/repository/payable-sql.ts";
import { loggerMiddleware } from "@lib/logger.ts";
import { snakeCaseResponseMiddleware } from "@lib/middleware.ts";

const db = new DB("db.sqlite");
const app = new Hono();

const transactionRepository = createTransactionRepositorySQL(db);
const payableRepository = createPayableRepositorySQL(db);

const transaction = createTransactionRouter(
  transactionRepository,
  payableRepository,
);

app.use(loggerMiddleware());
app.use(snakeCaseResponseMiddleware);
app.route("/transactions", transaction);

Deno.serve(app.fetch);
