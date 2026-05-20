import { apiClient } from "./client";

export type CreditTransactionRequest = {
  userId: number;
  credits: number;
};

export type CreditTransactionResponse = {
  userId: number;
  credits: number;
};

export async function addCredits(
  data: CreditTransactionRequest,
): Promise<CreditTransactionResponse> {
  const response = await apiClient.post<CreditTransactionResponse>(
    "/api/credittransaction/add",
    data,
  );

  return response.data;
}

export async function withdrawCredits(
  data: CreditTransactionRequest,
): Promise<CreditTransactionResponse> {
  const response = await apiClient.post<CreditTransactionResponse>(
    "/api/credittransaction/withdraw",
    data,
  );

  return response.data;
}
