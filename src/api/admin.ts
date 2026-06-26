import { apiClient } from "./client";
import type { PageResponse } from "../types/post";
import type {
  AdminDataPost,
  AdminDownloadResponse,
  GetUnreviewedPostsParams,
  ReviewPostRequest,
} from "../types/admin";

export async function getUnreviewedActivePosts({
  page = 0,
  size = 12,
  sort = "newest",
}: GetUnreviewedPostsParams = {}): Promise<PageResponse<AdminDataPost>> {
  const response = await apiClient.get<PageResponse<AdminDataPost>>(
    "/api/datapost/admin/posts/unreviewed",
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

export async function reviewPost({
  postId,
  adminId,
  status,
  note,
}: ReviewPostRequest): Promise<AdminDataPost> {
  const response = await apiClient.patch<AdminDataPost>(
    `/api/datapost/admin/posts/${postId}/review`,
    null,
    {
      params: {
        adminId,
        status,
        note,
      },
    },
  );

  return response.data;
}

export async function downloadAdminPostFile(
  postId: number,
  adminId: number,
): Promise<AdminDownloadResponse> {
  const response = await apiClient.get<AdminDownloadResponse>(
    `/api/datapost/admin/posts/${postId}/download`,
    {
      params: {
        adminId,
      },
    },
  );

  return response.data;
}
