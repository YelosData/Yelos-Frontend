import { apiClient } from "./client";
import type { PageResponse } from "../types/post";
import type { TransactionResponse } from "../types/transaction";

export async function getTransactionsByUser(
  userId: number,
  page: number = 0,
  size: number = 20,
): Promise<PageResponse<TransactionResponse>> {
  const response = await apiClient.get<PageResponse<TransactionResponse>>(
    `/api/transactions/user/${userId}`,
    {
      params: {
        page,
        size,
      },
    },
  );

  return response.data;
}
