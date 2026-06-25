export interface Community {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  postCount: number;
  isJoined: boolean;
  category: string;
  createdAt: string;
  rules?: string[];
}

export interface CommunityListResponse {
  data: Community[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface CommunityFilters {
  search?: string;
  category?: string;
  sortBy?: 'name' | 'memberCount' | 'postCount';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}
