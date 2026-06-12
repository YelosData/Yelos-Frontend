import type { Genre } from "./post";

export type RequestStatus = "OPEN" | "COMPLETED" | "CANCELLED";

export type SubmissionStatus = "PENDING" | "ACCEPTED" | "REJECTED";

export type RequestSortOption =
  | "newest"
  | "oldest"
  | "budgetAsc"
  | "budgetDesc";

export type DatasetRequest = {
  id: number;
  buyerId: number;
  buyerUsername: string;
  genre: Genre;
  specification: string;
  budget: number;
  status: RequestStatus;
  acceptedSubmissionId: number | null;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
};

export type CreateDatasetRequestRequest = {
  buyerId: number;
  genre: Genre;
  specification: string;
  budget: number;
};

export type RequestSubmission = {
  id: number;
  requestId: number;
  sellerId: number;
  sellerUsername: string;
  message: string | null;
  proposedPrice: number;
  status: SubmissionStatus;
  fileName: string;
  fileType: string;
  fileSize: number;
  submittedAt: string;
  acceptedAt: string | null;
  rejectedAt: string | null;
};

export type SubmitRequestSubmissionRequest = {
  sellerId: number;
  message: string;
  proposedPrice: number;
  file: File;
};

export type RequestSubmissionDownloadResponse = {
  downloadUrl: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  expiresInSeconds: number;
};

export type PageResponse<T> = {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
};
