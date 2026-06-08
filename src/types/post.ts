export type Genre =
  | "EDUCATION"
  | "CUSTOMER_SUPPORT"
  | "FINANCE"
  | "CODING"
  | "HEALTH_WELLNESS"
  | "TRAVEL"
  | "OTHER";

export type SortOption = "newest" | "oldest" | "priceAsc" | "priceDesc";

export type DataPostPreview = {
  id: number;
  userId: number;
  username: string;
  title: string;
  genre: Genre;
  summary: string;
  price: number;
  createdAt: string;
};

export type DataPostDetail = {
  id: number;
  userId: number;
  username: string;
  summary: string;
  title: string;
  genre: Genre;
  price: number;
  createdAt: string;
  fileName: string | null;
  fileType: string | null;
  fileSize: number | null;
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
  summary: string;
  price: number;
  file: File;
};
