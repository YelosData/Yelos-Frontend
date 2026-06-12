import { apiClient } from "./client";
import type { Genre } from "../types/post";
import type {
  CreateDatasetRequestRequest,
  DatasetRequest,
  PageResponse,
  RequestSortOption,
  RequestSubmission,
  RequestSubmissionDownloadResponse,
  SubmitRequestSubmissionRequest,
} from "../types/requestMarketplace";

export async function createDatasetRequest(
  data: CreateDatasetRequestRequest,
): Promise<DatasetRequest> {
  const response = await apiClient.post<DatasetRequest>("/api/requests", data);
  return response.data;
}

export async function getBuyerRequests(
  buyerId: number,
  page = 0,
  size = 12,
  sort: RequestSortOption = "newest",
): Promise<PageResponse<DatasetRequest>> {
  const response = await apiClient.get<PageResponse<DatasetRequest>>(
    `/api/requests/buyer/${buyerId}`,
    {
      params: {
        page,
        size,
        sort,
      },
    },
  );

  return response.data;
}

export async function getOpenRequests(params?: {
  page?: number;
  size?: number;
  genre?: Genre | "ALL";
  sort?: RequestSortOption;
}): Promise<PageResponse<DatasetRequest>> {
  const response = await apiClient.get<PageResponse<DatasetRequest>>(
    "/api/requests/open",
    {
      params: {
        page: params?.page ?? 0,
        size: params?.size ?? 12,
        genre: params?.genre ?? "ALL",
        sort: params?.sort ?? "newest",
      },
    },
  );

  return response.data;
}

export async function submitToRequest(
  requestId: number,
  data: SubmitRequestSubmissionRequest,
): Promise<RequestSubmission> {
  const formData = new FormData();

  formData.append("sellerId", String(data.sellerId));
  formData.append("message", data.message);
  formData.append("proposedPrice", String(data.proposedPrice));
  formData.append("file", data.file);

  const response = await apiClient.post<RequestSubmission>(
    `/api/requests/${requestId}/submissions`,
    formData,
  );

  return response.data;
}

export async function getRequestSubmissions(
  requestId: number,
  buyerId: number,
): Promise<RequestSubmission[]> {
  const response = await apiClient.get<RequestSubmission[]>(
    `/api/requests/${requestId}/submissions`,
    {
      params: {
        buyerId,
      },
    },
  );

  return response.data;
}

export async function getSellerSubmissions(
  sellerId: number,
): Promise<RequestSubmission[]> {
  const response = await apiClient.get<RequestSubmission[]>(
    `/api/requests/seller/${sellerId}/submissions`,
  );

  return response.data;
}

export async function acceptSubmission(
  requestId: number,
  submissionId: number,
  buyerId: number,
): Promise<RequestSubmission> {
  const response = await apiClient.post<RequestSubmission>(
    `/api/requests/${requestId}/submissions/${submissionId}/accept`,
    null,
    {
      params: {
        buyerId,
      },
    },
  );

  return response.data;
}

export async function downloadAcceptedSubmission(
  submissionId: number,
): Promise<RequestSubmissionDownloadResponse> {
  const response = await apiClient.get<RequestSubmissionDownloadResponse>(
    `/api/requests/submissions/${submissionId}/download`,
  );

  return response.data;
}
