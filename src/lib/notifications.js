export function notificationHref(notification) {
  const type = notification?.reference_type || notification?.type;
  const id = notification?.reference_id;

  if (type === 'rfq' && id) return `/rfq/${id}`;
  if (type === 'order' && id) return `/orders/${id}`;
  if (type === 'quotation' && id) return `/dashboard?tab=quotations&quotation_id=${id}`;
  if (type === 'message') return '/messages';

  return '/notifications';
}

export function notificationTime(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}

export function notificationsFromResponse(response) {
  return Array.isArray(response?.notifications)
    ? response.notifications
    : Array.isArray(response?.data)
      ? response.data
      : [];
}
