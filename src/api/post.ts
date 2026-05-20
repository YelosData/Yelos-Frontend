import { apiClient } from "./client";
import type {
  CreatePostRequest,
  DataPostDetail,
  DataPostPreview,
  GetMarketplacePostsParams,
  PageResponse,
} from "../types/post";

export async function getMarketplacePosts(
  params: GetMarketplacePostsParams = {},
): Promise<PageResponse<DataPostPreview>> {
  const response = await apiClient.get<PageResponse<DataPostPreview>>(
    "/api/datapost/marketplace",
    {
      params: {
        page: params.page ?? 0,
        size: params.size ?? 12,
        genre: params.genre,
        sort: params.sort ?? "newest",
      },
    },
  );

  return response.data;
}

export async function getDataPostById(id: number): Promise<DataPostDetail> {
  const response = await apiClient.get<DataPostDetail>(
    `/api/datapost/posts/${id}`,
  );

  return response.data;
}

export async function createPost(
  data: CreatePostRequest,
): Promise<DataPostDetail> {
  const response = await apiClient.post<DataPostDetail>("/api/datapost", data);

  return response.data;
}

export async function getPostsByUserId(
  userId: number,
  page: number,
  size: number,
): Promise<PageResponse<DataPostDetail>> {
  const res = await apiClient.get<PageResponse<DataPostDetail>>(
    `/api/datapost/user/${userId}`,
    {
      params: {
        page,
        size,
      },
    },
  );

  return res.data;
}
