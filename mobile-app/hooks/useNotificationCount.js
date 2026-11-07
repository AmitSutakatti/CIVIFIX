// hooks/useNotificationCount.js
//
// Provides the unread notification count for the tab badge.
// Polls the backend every NOTIFICATION_POLL_INTERVAL ms.
// Uses React Query so the count is shared across all components
// without duplicate requests.

import { useQuery } from '@tanstack/react-query';
import { notificationService } from '../services/notificationService';
import { useAuth } from '../context/AuthContext';
import { NOTIFICATION_POLL_INTERVAL } from '../constants/config';

export function useNotificationCount() {
  const { isAuthenticated } = useAuth();

  const { data } = useQuery({
    queryKey: ['notifications', 'count'],
    queryFn: notificationService.getNotifications,
    enabled: isAuthenticated,
    refetchInterval: NOTIFICATION_POLL_INTERVAL,
    select: (data) => data?.unreadCount ?? 0,
  });

  return { unreadCount: data ?? 0 };
}
