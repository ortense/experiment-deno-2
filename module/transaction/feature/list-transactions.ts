import {
  Transaction,
  TransactionRepository,
} from "@module/transaction/transaction.type.ts";
import { failure, Result, success } from "@lib/result.ts";

export function listTransactionFeature(repo: TransactionRepository) {
  return {
    async execute(): Promise<Result<Transaction[]>> {
      const { ok, value } = await repo.list();

      if (!ok) return failure(value);

      return success(value);
    },
  };
}
