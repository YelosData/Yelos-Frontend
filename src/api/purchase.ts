import type { Genre, PageResponse } from "../types/post";
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
  genre: Genre;
  titleSnapshot: string;
  summarySnapshot: string;
  fileNameSnapshot: string | null;
  fileTypeSnapshot: string | null;
  fileSizeSnapshot: number | null;
  purchasedAt: string;
};

export type PurchaseDownloadResponse = {
  downloadUrl: string;
  fileName: string | null;
  fileType: string | null;
  fileSize: number | null;
  expiresInSeconds: number;
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

export async function getPurchaseDownloadUrl(
  purchaseId: number,
): Promise<PurchaseDownloadResponse> {
  const response = await apiClient.get<PurchaseDownloadResponse>(
    `/api/purchase/${purchaseId}/download`,
  );

  return response.data;
}
