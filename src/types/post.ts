export type Genre =
  | "EDUCATION"
  | "CUSTOMER_SUPPORT"
  | "FINANCE"
  | "CODING"
  | "HEALTH_WELLNESS"
  | "TRAVEL"
  | "OTHER";

export type SortOption = "newest" | "oldest" | "priceAsc" | "priceDesc";

export type DataPostStatus =
  | "PENDING"
  | "AI_PROCESSING"
  | "ACTIVE"
  | "AI_FAILED"
  | "DELETED";

export type DataQualityRating = {
  completeness: number | null;
  consistency: number | null;
  uniqueness: number | null;
  validity: number | null;
  richness: number | null;
  total: number | null;
};

export type DataPostPreview = {
  id: number;
  userId: number;
  username: string;
  title: string;
  genre: Genre;
  summary: string;
  price: number;
  createdAt: string;
  adminReviewed?: boolean;

  qualityRating?: DataQualityRating | null;
};

export type DataPostDetail = {
  id: number;
  userId: number;
  username: string;
  title: string;
  summary: string;
  genre: Genre;
  price: number;

  status?: DataPostStatus;
  version?: number;

  fileName?: string;
  fileType?: string;
  fileSize?: number;

  createdAt: string;
  updatedAt?: string;

  previewCsv?: string | null;
  aiFlagged?: boolean | null;
  aiFlagDetails?: string | null;

  qualityRating?: DataQualityRating | null;

  adminReviewed?: boolean;
  reviewedAt?: string | null;
  reviewedByAdminId?: number | null;
  adminNote?: string | null;
};

export type PageResponse<T> = {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
};

export type GetMarketplacePostsParams = {
  page?: number;
  size?: number;
  genre?: Genre;
  sort?: SortOption;
};

export type CreatePostRequest = {
  userId: number;
  genre: Genre;
  title: string;
  price: number;
  file: File;

  // Retained for compatibility with older frontend/backend code.
  // The backend currently uses the AI-generated summary.
  summary?: string;
};

export type UpdatePostRequest = {
  postId: number;
  userId: number;
  title: string;
  price: number;
  genre: Genre;
  file?: File | null;

  // Retained for future update functionality.
  summary?: string;
};
