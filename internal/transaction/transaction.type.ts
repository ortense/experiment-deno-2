import z from "zod";
import {
  boletoTransactionSchema,
  createPayableSchema,
  createTransactionSchema,
  creditCardTransactionSchema,
  debitCardTransactionSchema,
  payableSchema,
  payableStatusSchema,
  transactionSchema,
} from "@internal/transaction/transaction.schema.ts";
import type { Result } from "@lib/result.ts";

export type Transaction = z.infer<typeof transactionSchema>;
export type CreditCardTransaction = z.infer<typeof creditCardTransactionSchema>;
export type DebitCardTransaction = z.infer<typeof debitCardTransactionSchema>;
export type BoletoTransaction = z.infer<typeof boletoTransactionSchema>;
export type CreateTransactionPayload = z.infer<typeof createTransactionSchema>;

export type TransactionRepository = {
  list(): Promise<Result<Transaction[]>>;
  save(input: CreateTransactionPayload): Promise<Result<Transaction>>;
  getById(id: string): Promise<Result<Transaction | null>>;
};

export type Payable = z.infer<typeof payableSchema>;
export type PayableStatus = z.infer<typeof payableStatusSchema>;
export type CreatePayablePayload = z.infer<typeof createPayableSchema>;

export type PayableRepository = {
  list(): Promise<Result<Payable[]>>;
  save(input: CreatePayablePayload): Promise<Result<Payable>>;
};
