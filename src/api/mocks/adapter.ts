import { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { mockCommunities } from './communities';
import { mockPosts } from './posts';
import { Community, CommunityFilters, CommunityListResponse } from '@/types/community';
import { CreatePostPayload, Post, PostListResponse } from '@/types/post';
import { storageService } from '@/services/storage';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

let communityStore: Community[] = mockCommunities.map((c) => ({ ...c }));
let postStore: Post[] = mockPosts.map((p) => ({ ...p }));
let nextPostId = 100;
let storeInitialized = false;

export async function initMockStore(): Promise<void> {
  if (storeInitialized) return;
  storeInitialized = true;
  communityStore = mockCommunities.map((c) => ({ ...c }));
  postStore = mockPosts.map((p) => ({ ...p }));
  nextPostId = 100;
  const joinedIds = await storageService.getJoinedCommunities();
  joinedIds.forEach((id) => {
    const community = communityStore.find((c) => c.id === id);
    if (community) {
      community.isJoined = true;
    }
  });
}

export function resetMockStore(): void {
  storeInitialized = false;
  communityStore = mockCommunities.map((c) => ({ ...c }));
  postStore = mockPosts.map((p) => ({ ...p }));
  nextPostId = 100;
}

function mockResponse<T>(data: T, status = 200): AxiosResponse<T> {
  return {
    data,
    status,
    statusText: 'OK',
    headers: {},
    config: {} as InternalAxiosRequestConfig,
  };
}

function handleCommunityList(params: CommunityFilters): AxiosResponse<CommunityListResponse> {
  const {
    search = '',
    category,
    sortBy = 'memberCount',
    sortOrder = 'desc',
    page = 1,
    limit = 10,
  } = params;

  let filtered = [...communityStore];

  if (search) {
    const lower = search.toLowerCase();
    filtered = filtered.filter(
      (c) => c.name.toLowerCase().includes(lower) || c.description.toLowerCase().includes(lower)
    );
  }

  if (category && category !== 'All') {
    filtered = filtered.filter((c) => c.category === category);
  }

  filtered.sort((a, b) => {
    const aVal = a[sortBy as keyof Community] as number | string;
    const bVal = b[sortBy as keyof Community] as number | string;
    if (sortOrder === 'asc') return aVal > bVal ? 1 : -1;
    return aVal < bVal ? 1 : -1;
  });

  const total = filtered.length;
  const start = (page - 1) * limit;
  const data = filtered.slice(start, start + limit);

  return mockResponse<CommunityListResponse>({
    data,
    total,
    page,
    limit,
    hasMore: start + limit < total,
  });
}

function handleCommunityDetail(id: string): AxiosResponse<Community> {
  const community = communityStore.find((c) => c.id === id);
  if (!community) {
    throw { response: { status: 404, data: { message: 'Community not found' } } };
  }
  return mockResponse<Community>(community);
}

async function handleJoinCommunity(id: string): Promise<AxiosResponse<Community>> {
  const community = communityStore.find((c) => c.id === id);
  if (!community) {
    throw { response: { status: 404, data: { message: 'Community not found' } } };
  }
  community.isJoined = true;
  community.memberCount += 1;
  const joinedIds = communityStore.filter((c) => c.isJoined).map((c) => c.id);
  await storageService.setJoinedCommunities(joinedIds);
  return mockResponse<Community>({ ...community });
}

async function handleLeaveCommunity(id: string): Promise<AxiosResponse<Community>> {
  const community = communityStore.find((c) => c.id === id);
  if (!community) {
    throw { response: { status: 404, data: { message: 'Community not found' } } };
  }
  community.isJoined = false;
  community.memberCount -= 1;
  const joinedIds = communityStore.filter((c) => c.isJoined).map((c) => c.id);
  await storageService.setJoinedCommunities(joinedIds);
  return mockResponse<Community>({ ...community });
}

function handlePostList(
  communityId: string,
  params: { page?: number; limit?: number }
): AxiosResponse<PostListResponse> {
  const { page = 1, limit = 10 } = params;
  const filtered = postStore.filter((p) => p.communityId === communityId);
  const total = filtered.length;
  const start = (page - 1) * limit;
  const data = filtered.slice(start, start + limit);

  return mockResponse<PostListResponse>({
    data,
    total,
    page,
    limit,
    hasMore: start + limit < total,
  });
}

function handleCreatePost(communityId: string, payload: CreatePostPayload): AxiosResponse<Post> {
  const newPost: Post = {
    id: `p${nextPostId++}`,
    communityId,
    title: payload.title,
    body: payload.body,
    authorId: 'current_user',
    authorName: 'You',
    likeCount: 0,
    commentCount: 0,
    isLiked: false,
    createdAt: new Date().toISOString(),
  };
  postStore.unshift(newPost);

  const community = communityStore.find((c) => c.id === communityId);
  if (community) {
    community.postCount += 1;
  }

  return mockResponse<Post>(newPost, 201);
}

function handleLogin(email: string): AxiosResponse<{
  token: string;
  user: { id: string; email: string; username: string };
}> {
  return mockResponse({
    token: 'mock_token_' + Date.now(),
    user: {
      id: 'current_user',
      email,
      username: email.split('@')[0],
    },
  });
}

async function routeRequest(
  method: string,
  url: string,
  params: Record<string, unknown>,
  data: Record<string, unknown>
): Promise<AxiosResponse> {
  if (url === '/auth/login' && method === 'post') {
    return handleLogin(data.email as string);
  }

  if (url === '/communities' && method === 'get') {
    return handleCommunityList(params as CommunityFilters);
  }

  const communityDetailMatch = url.match(/^\/communities\/([^/]+)$/);
  if (communityDetailMatch && method === 'get') {
    return handleCommunityDetail(communityDetailMatch[1]);
  }

  const joinMatch = url.match(/^\/communities\/([^/]+)\/join$/);
  if (joinMatch && method === 'post') {
    return await handleJoinCommunity(joinMatch[1]);
  }

  const leaveMatch = url.match(/^\/communities\/([^/]+)\/leave$/);
  if (leaveMatch && method === 'post') {
    return await handleLeaveCommunity(leaveMatch[1]);
  }

  const postsMatch = url.match(/^\/communities\/([^/]+)\/posts$/);
  if (postsMatch && method === 'get') {
    return handlePostList(postsMatch[1], params as { page?: number; limit?: number });
  }

  if (postsMatch && method === 'post') {
    return handleCreatePost(postsMatch[1], data as unknown as CreatePostPayload);
  }
  throw { response: { status: 404, data: { message: 'Not found' } } };
}

export function installMockAdapter(instance: AxiosInstance): void {
  instance.interceptors.request.use(async (config) => {
    await delay(300);

    await initMockStore();

    const method = (config.method || 'get').toLowerCase();
    const url = config.url || '';
    const params = (config.params as Record<string, unknown>) || {};
    const data = config.data
      ? typeof config.data === 'string'
        ? (JSON.parse(config.data) as Record<string, unknown>)
        : (config.data as Record<string, unknown>)
      : {};

    try {
      const response = await routeRequest(method, url, params, data);
      config.adapter = () => Promise.resolve(response);
    } catch (err) {
      config.adapter = () => Promise.reject(err);
    }

    return config;
  });
}
