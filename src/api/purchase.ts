import type { PageResponse } from "../types/post";
import { apiClient } from "./client";

export type PurchasePostRequest = {
  buyerId: number;
  postId: number;
};

export type PurchaseResponse = {
  id: number;
  buyerId: number;
  sellerId: number;
  postId: number;
  price: number;
  buyerCredits: number;
  titleSnapshot: string;
  summarySnapshot: string;
  contentSnapshot: string;
  purchasedAt: string;
};

export async function purchasePost(
  data: PurchasePostRequest,
): Promise<PurchaseResponse> {
  const response = await apiClient.post<PurchaseResponse>(
    "/api/purchase",
    data,
  );

  return response.data;
}

export async function getPurchasesByUser(
  userId: number,
): Promise<PurchaseResponse[]> {
  const response = await apiClient.get<PurchaseResponse[]>(
    `/api/purchase/users/${userId}/posts`,
  );

  return response.data;
}

export async function getPurchaseHistoryByUser(
  userId: number,
  page: number = 0,
  size: number = 12,
  genre: string = "ALL",
  sort: string = "newest",
): Promise<PageResponse<PurchaseResponse>> {
  const response = await apiClient.get<PageResponse<PurchaseResponse>>(
    `/api/purchase/users/${userId}/history`,
    {
      params: {
        page,
        size,
        genre,
        sort,
      },
    },
  );

  return response.data;
}
