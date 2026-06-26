import { useOfflineStore } from '@/store/offlineStore';
import { syncOfflineQueue } from '@/services/offlineQueue';
import { useJoinCommunity, useLeaveCommunity } from '@/hooks/useCommunities';

export function useOfflineQueue() {
  const { isOnline, addToQueue, queue } = useOfflineStore();
  const joinMutation = useJoinCommunity();
  const leaveMutation = useLeaveCommunity();

  async function joinCommunity(communityId: string) {
    if (isOnline) {
      joinMutation.mutate(communityId);
    } else {
      await addToQueue({ type: 'JOIN', communityId });
    }
  }

  async function leaveCommunity(communityId: string) {
    if (isOnline) {
      leaveMutation.mutate(communityId);
    } else {
      await addToQueue({ type: 'LEAVE', communityId });
    }
  }

  return {
    joinCommunity,
    leaveCommunity,
    pendingCount: queue.length,
    isOnline,
    sync: syncOfflineQueue,
  };
}
