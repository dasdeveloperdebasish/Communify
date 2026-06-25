export interface Post {
  id: string;
  communityId: string;
  title: string;
  body: string;
  authorId: string;
  authorName: string;
  likeCount: number;
  commentCount: number;
  isLiked: boolean;
  createdAt: string;
}

export interface PostListResponse {
  data: Post[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface CreatePostPayload {
  communityId: string;
  title: string;
  body: string;
}
