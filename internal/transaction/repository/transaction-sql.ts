// deno-lint-ignore-file require-await
import { DB } from "sqlite";
import {
  CreateTransactionPayload,
  CreditCardTransaction,
  isTransactionWithCard,
  PaymentCard,
  Transaction,
  TransactionDataRow,
  TransactionRepository,
} from "@internal/transaction/transaction.type.ts";
import { withAsyncResult } from "@lib/result.ts";

function mapTransactionRow(row: TransactionDataRow): Transaction {
  const [
    id,
    value,
    description,
    method,
    card_number,
    card_holder_name,
    card_expiration,
    card_cvv,
  ] = row;

  const transaction = { id, value, description, method };

  if (isTransactionWithCard(transaction)) {
    transaction.card = {
      number: card_number,
      holderName: card_holder_name,
      expiration: card_expiration,
      cvv: card_cvv,
    };
  }

  return transaction as Transaction;
}

export function createTransactionRepositorySQL(
  db: DB,
): TransactionRepository {
  db.execute(`
    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      value REAL,
      description TEXT,
      method TEXT,
      card_number TEXT NULL,
      card_holder_name TEXT NULL,
      card_expiration TEXT NULL,
      card_cvv TEXT NULL
    );
  `);

  return {
    save: withAsyncResult(async (input: CreateTransactionPayload) => {
      const id = crypto.randomUUID();
      const card: PaymentCard | undefined =
        (input as CreditCardTransaction).card;
      db.query(
        `
          INSERT INTO transactions (id, value, description, method, card_number, card_holder_name, card_expiration, card_cvv)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          id,
          input.value,
          input.description,
          input.method,
          card?.number || null,
          card?.holderName || null,
          card?.expiration || null,
          card?.cvv || null,
        ],
      );

      const transaction: Transaction = { id, ...input };
      return transaction;
    }),
    list: withAsyncResult(async () => {
      const rows = db.query<TransactionDataRow>(`
        SELECT id, value, description, method, card_number, card_holder_name, card_expiration, card_cvv FROM transactions
      `);

      return rows.map(mapTransactionRow);
    }),
    getById: withAsyncResult(async (input: string) => {
      const rows = db.query<TransactionDataRow>(
        `
          SELECT id, value, description, method, card_number, card_holder_name, card_expiration, card_cvv FROM transactions WHERE id = ?
        `,
        [input],
      );

      if (rows.length === 0) return null;

      return mapTransactionRow(rows[0]);
    }),
  };
}
