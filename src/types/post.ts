export type Genre =
  | "EDUCATION"
  | "CUSTOMER_SUPPORT"
  | "FINANCE"
  | "CODING"
  | "HEALTH_WELLNESS"
  | "TRAVEL"
  | "OTHER";

export type SortOption = "newest" | "oldest" | "priceAsc" | "priceDesc";

export type DataPostStatus = "ACTIVE" | "DELETED";

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
  title: string;
  summary: string;
  genre: Genre;
  price: number;
  status?: string;
  version?: number;
  fileName?: string;
  fileType?: string;
  fileSize?: number;
  createdAt: string;
  updatedAt?: string;
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

export type UpdatePostRequest = {
  postId: number;
  userId: number;
  title: string;
  summary: string;
  price: number;
  genre: Genre;
  file?: File | null;
};
