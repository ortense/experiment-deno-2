import { Hono } from "hono";
import { DB } from "sqlite";
import { createTransactionRouter } from "@internal/transaction/transaction.router.ts";
import { createTransactionRepositorySQL } from "@internal/transaction/repository/transaction-sql.ts";
import { createPayableRepositorySQL } from "@internal/transaction/repository/payable-sql.ts";

const db = new DB("db.sqlite");
const app = new Hono();

const transactionRepository = createTransactionRepositorySQL(db);
const payableRepository = createPayableRepositorySQL(db);

const transaction = createTransactionRouter(
  transactionRepository,
  payableRepository,
);

app.route("/transactions", transaction);

Deno.serve(app.fetch);
