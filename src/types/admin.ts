import type { DataPostDetail, DataPostStatus, SortOption } from "./post";

export type AdminReviewStatus = Extract<DataPostStatus, "ACTIVE" | "DELETED">;

export type GetUnreviewedPostsParams = {
  page?: number;
  size?: number;
  sort?: SortOption;
};

export type ReviewPostRequest = {
  postId: number;
  adminId: number;
  status: AdminReviewStatus;
  note?: string;
};

export type AdminDataPost = DataPostDetail;

export type AdminDownloadResponse = {
  fileName: string;
  fileType: string;
  fileSize: number;
  downloadUrl: string;
};
