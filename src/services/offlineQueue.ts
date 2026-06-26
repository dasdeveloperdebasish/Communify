import { apiClient } from '@/api/client';
import { endpoints } from '@/api/endpoints';
import { useOfflineStore, OfflineAction } from '@/store/offlineStore';
import { queryClient } from '@/services/queryClient';

async function processAction(action: OfflineAction): Promise<void> {
  if (action.type === 'JOIN') {
    await apiClient.post(endpoints.communities.join(action.communityId));
  } else if (action.type === 'LEAVE') {
    await apiClient.post(endpoints.communities.leave(action.communityId));
  }
}

export async function syncOfflineQueue(): Promise<void> {
  const { queue, clearQueue } = useOfflineStore.getState();

  if (queue.length === 0) return;

  const results = await Promise.allSettled(queue.map(processAction));

  const failed: OfflineAction[] = [];
  results.forEach((result, index) => {
    if (result.status === 'rejected') {
      failed.push(queue[index]);
    }
  });

  if (failed.length === 0) {
    await clearQueue();
  } else {
    useOfflineStore.setState({ queue: failed });
    await useOfflineStore.getState().loadQueue();
  }

  queryClient.invalidateQueries({ queryKey: ['communities'] });
  queryClient.invalidateQueries({ queryKey: ['community'] });
}
