import { memo } from 'react';
import type { ListingStatus, ReservationStatus } from '@/types';

const LABELS: Record<string, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  cancelled: 'Cancelled',
  unavailable: 'Unavailable',
};

function StatusBadgeImpl({ status }: { status: ListingStatus | ReservationStatus }) {
  return <span className={`status-badge status-badge--${status}`}>{LABELS[status] ?? status}</span>;
}

export const StatusBadge = memo(StatusBadgeImpl);
