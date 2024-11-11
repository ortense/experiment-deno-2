import z from "zod";
import {
  boletoTransactionSchema,
  createPayableSchema,
  createTransactionSchema,
  creditCardTransactionSchema,
  debitCardTransactionSchema,
  payableSchema,
  payableStatusSchema,
  paymentCardSchema,
  transactionSchema,
} from "@internal/transaction/transaction.schema.ts";
import type { Result } from "@lib/result.ts";

export type Transaction = z.infer<typeof transactionSchema>;
export type CreditCardTransaction = z.infer<typeof creditCardTransactionSchema>;
export type DebitCardTransaction = z.infer<typeof debitCardTransactionSchema>;
export type BoletoTransaction = z.infer<typeof boletoTransactionSchema>;
export type CreateTransactionPayload = z.input<typeof createTransactionSchema>;
export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
export type PaymentCard = z.infer<typeof paymentCardSchema>;

export type TransactionRepository = {
  list(): Promise<Result<Transaction[]>>;
  save(input: CreateTransactionInput): Promise<Result<Transaction>>;
  getById(id: string): Promise<Result<Transaction | null>>;
};

export type Payable = z.infer<typeof payableSchema>;
export type PayableStatus = z.infer<typeof payableStatusSchema>;
export type CreatePayablePayload = z.infer<typeof createPayableSchema>;

export type PayableRepository = {
  list(): Promise<Result<Payable[]>>;
  save(input: CreatePayablePayload): Promise<Result<Payable>>;
};

export type PayableDataRow = [
  Payable["id"],
  Payable["transactionId"],
  Payable["status"],
  Payable["subtotal"],
  Payable["tax"],
  Payable["total"],
  string, // createdAt: string (stored as ISO string in DB)
];

export type TransactionWithPaymentCard =
  | CreditCardTransaction
  | DebitCardTransaction;

export type TransactionDataRow = [
  Transaction["id"],
  Transaction["value"],
  Transaction["description"],
  Transaction["method"],
  CreditCardTransaction["card"]["number"],
  CreditCardTransaction["card"]["holderName"],
  CreditCardTransaction["card"]["expiration"],
  CreditCardTransaction["card"]["cvv"],
];

const paymentCardMethods = new Set(["debit_card", "credit_card"]);

export function isTransactionWithCard(
  input: unknown,
): input is TransactionWithPaymentCard {
  return paymentCardMethods.has((input as Transaction).method);
}
