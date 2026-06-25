export const endpoints = {
  auth: {
    login: '/auth/login',
    logout: '/auth/logout',
  },
  communities: {
    list: '/communities',
    detail: (id: string) => `/communities/${id}`,
    join: (id: string) => `/communities/${id}/join`,
    leave: (id: string) => `/communities/${id}/leave`,
  },
  posts: {
    list: (communityId: string) => `/communities/${communityId}/posts`,
    create: (communityId: string) => `/communities/${communityId}/posts`,
    detail: (communityId: string, postId: string) => `/communities/${communityId}/posts/${postId}`,
  },
};
