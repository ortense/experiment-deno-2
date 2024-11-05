// deno-lint-ignore-file require-await
import { DB } from "sqlite";
import {
  CreatePayablePayload,
  Payable,
  PayableDataRow,
  PayableRepository,
} from "@internal/transaction/transaction.type.ts";
import { withAsyncResult } from "@lib/result.ts";

function mapPayableRow(row: PayableDataRow): Payable {
  const [id, transactionId, status, subtotal, tax, total, createdAt] = row;
  return {
    id,
    transactionId,
    status,
    subtotal,
    tax,
    total,
    createdAt: new Date(createdAt),
  };
}

export function createPayableRepositorySQL(db: DB): PayableRepository {
  db.execute(`
    CREATE TABLE IF NOT EXISTS payables (
      id TEXT PRIMARY KEY,
      transactionId TEXT,
      status TEXT,
      subtotal REAL,
      tax REAL,
      total REAL,
      createdAt TEXT
    );
  `);

  return {
    save: withAsyncResult(async (input: CreatePayablePayload) => {
      const id = crypto.randomUUID();
      const createdAt = new Date().toISOString();

      db.query(
        `
        INSERT INTO payables (id, transactionId, status, subtotal, tax, total, createdAt)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
        [
          id,
          input.transactionId,
          input.status,
          input.subtotal,
          input.tax,
          input.total,
          createdAt,
        ],
      );

      return { id, ...input, createdAt: new Date(createdAt) } as Payable;
    }),

    list: withAsyncResult(async () => {
      const rows = db.query<PayableDataRow>(
        "SELECT id, transactionId, status, subtotal, tax, total, createdAt FROM payables",
      );

      return rows.map(mapPayableRow);
    }),
  };
}
