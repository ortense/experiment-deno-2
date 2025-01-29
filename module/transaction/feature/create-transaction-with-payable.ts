import type {
  CreateTransactionInput,
  Payable,
  PayableRepository,
  Transaction,
  TransactionRepository,
} from "@module/transaction/transaction.type.ts";
import { isFailure, type Result } from "@lib/result.ts";

type TaxCalc = (value: number) => Pick<Payable, "status" | "tax" | "total">;

const taxRule: Record<Transaction["method"], TaxCalc> = {
  "boleto": (value) => ({
    status: "waiting_funds",
    tax: 1,
    total: Math.floor(value * 0.99),
  }),
  "debit_card": (value) => ({
    status: "paid",
    tax: 2,
    total: Math.floor(value * 0.98),
  }),
  "credit_card": (value) => ({
    status: "waiting_funds",
    tax: 5,
    total: Math.floor(value * 0.95),
  }),
};

const applyCardNumberMask = (
  input: CreateTransactionInput,
): CreateTransactionInput => {
  if (input.method === "boleto") return input;

  const { card } = input;

  return {
    ...input,
    card: {
      ...card,
      number: card.number.substring(10).padStart(card.number.length, "*"),
    },
  };
};

export function createTransactinWithPayableFeature(
  transactionRepo: TransactionRepository,
  payableRepo: PayableRepository,
) {
  return {
    async execute(
      input: CreateTransactionInput,
    ): Promise<Result<Transaction>> {
      const transactionResult = await transactionRepo.save(
        applyCardNumberMask(input),
      );

      if (isFailure(transactionResult)) return transactionResult;

      const transaction = transactionResult.value;
      const calculateTax = taxRule[transaction.method];

      const payableResult = await payableRepo.save({
        transactionId: transaction.id,
        subtotal: transaction.value,
        ...calculateTax(transaction.value),
      });

      if (isFailure(payableResult)) return payableResult;

      return transactionResult;
    },
  };
}
