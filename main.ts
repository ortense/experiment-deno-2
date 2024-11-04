import { Hono } from "hono";
import { createTransactionRouter } from "@internal/transaction/transaction.router.ts";
import { createPayableRepositoryInMemory } from "@internal/transaction/repository/payable-in-memory.ts";
import { createTransactionRepositoryInMemory } from "@internal/transaction/repository/transaction-in-memory.ts";

const app = new Hono();

const transactionRepository = createTransactionRepositoryInMemory();
const payableRepository = createPayableRepositoryInMemory();

const transaction = createTransactionRouter(
  transactionRepository,
  payableRepository,
);

app.route("/transactions", transaction);

Deno.serve(app.fetch);
