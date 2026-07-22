export type TransactionType = "PURCHASE_DEBIT" | "SALE_CREDIT" | "ADD_CREDIT";

export interface TransactionResponse {
  id: number;
  userId: number;
  purchaseId: number | null;
  type: TransactionType;
  amount: number;
  balanceAfter: number;
  createdAt: string;
}
