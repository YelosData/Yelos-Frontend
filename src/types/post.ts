export type Genre =
  | "EDUCATION"
  | "CUSTOMER_SUPPORT"
  | "FINANCE"
  | "CODING"
  | "HEALTH_WELLNESS"
  | "TRAVEL"
  | "OTHER";

export type SortOption = "newest" | "oldest" | "priceAsc" | "priceDesc";

export type DataPostStatus = "PENDING" | "ACTIVE" | "DELETED";

export type DataPostPreview = {
  id: number;
  userId: number;
  username: string;
  title: string;
  genre: Genre;
  summary: string; // AI summary for marketplace card
  price: number;
  createdAt: string;
  adminReviewed?: boolean;
};

export type DataPostDetail = {
  id: number;
  userId: number;
  username: string;
  title: string;
  summary: string; // AI summary for details page
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

  // Keep optional only if some old frontend/backend code still passes it.
  // Backend ignores it now.
  summary?: string;
};

export type UpdatePostRequest = {
  postId: number;
  userId: number;
  title: string;
  price: number;
  genre: Genre;
  file?: File | null;

  // Update is disabled for now, keep optional for future conversion.
  summary?: string;
};
