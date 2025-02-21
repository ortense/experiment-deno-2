import { z } from "zod";
import { currencyValueSchema, idSchema, withId } from "@lib/schema.ts";

const baseTransactionSchema = z.object({
  value: currencyValueSchema,
  description: z.string().max(255).nullable().optional().default(null),
});

export const paymentCardSchema = z.object({
  number: z.string().min(12).max(19),
  holder_name: z.string().max(255),
  expiration: z.string().length(5),
  cvv: z.string().length(3),
}).transform(({ holder_name, ...rest }) => ({
  holderName: holder_name,
  ...rest,
}));

export const payableStatusSchema = z.union([
  z.literal("paid"),
  z.literal("waiting_funds"),
]);

const basePayableSchema = z.object({
  transactionId: idSchema,
  status: payableStatusSchema,
  subtotal: currencyValueSchema,
  tax: currencyValueSchema,
  total: currencyValueSchema,
});

export const payableSchema = z.object({
  id: idSchema,
  createdAt: z.date(),
}).merge(basePayableSchema);

export const createPayableSchema = basePayableSchema;

export const creditCardTransactionSchema = baseTransactionSchema.merge(
  z.object({
    method: z.literal("credit_card"),
    card: paymentCardSchema,
  }),
);

export const debitCardTransactionSchema = baseTransactionSchema.merge(z.object({
  method: z.literal("debit_card"),
  card: paymentCardSchema,
}));

export const boletoTransactionSchema = baseTransactionSchema.merge(z.object({
  method: z.literal("boleto"),
}));

export const createTransactionSchema = z.union([
  creditCardTransactionSchema,
  debitCardTransactionSchema,
  boletoTransactionSchema,
]);

export const getTransactionSchema = withId;

export const transactionSchema = z.union([
  creditCardTransactionSchema.merge(withId),
  debitCardTransactionSchema.merge(withId),
  boletoTransactionSchema.merge(withId),
]);

export const transactionWithPayableSchema = transactionSchema.and(
  z.object({ payable: payableSchema.omit({ transactionId: true }) }),
);
