import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import type {
  PayableRepository,
  TransactionRepository,
} from "@internal/transaction/transaction.type.ts";
import {
  createTransactionSchema,
  getTransactionSchema,
} from "@internal/transaction/transaction.schema.ts";
import { getTransactionFeature } from "@internal/transaction/feature/get-transaction.ts";
import { listTransactionFeature } from "@internal/transaction/feature/list-transactions.ts";
import { createTransactinWithPayableFeature } from "@internal/transaction/feature/create-transaction-with-payable.ts";
import { isFailure } from "@lib/result.ts";

export function createTransactionRouter(
  transactionRepo: TransactionRepository,
  payableRepo: PayableRepository,
) {
  const router = new Hono();
  const createTransactionWithPayable = createTransactinWithPayableFeature(
    transactionRepo,
    payableRepo,
  );
  const listTransactions = listTransactionFeature(transactionRepo);
  const getTransaction = getTransactionFeature(transactionRepo);

  router.get("/", async (c) => {
    const { ok, value } = await listTransactions.execute();

    if (!ok) {
      c.status(500);
      return c.json({ ok, error: value.message });
    }

    return c.json(value);
  });

  router.get("/:id", zValidator("param", getTransactionSchema), async (c) => {
    const id = c.req.param("id");
    const result = await getTransaction.execute(id);

    if (isFailure(result)) {
      c.status(500);
      return c.json({ ok: false, error: result.value.message });
    }

    if (result.value === null) {
      c.status(404);
      return c.json({ message: "transaction not found" });
    }

    return c.json(result.value);
  });

  router.post("/", zValidator("json", createTransactionSchema), async (c) => {
    const input = c.req.valid("json");

    const result = await createTransactionWithPayable.execute(input);

    if (isFailure(result)) {
      c.status(500);
      return c.json({ ok: false, error: result.value.message });
    }

    c.status(201);
    return c.json(result.value);
  });

  return router;
}
