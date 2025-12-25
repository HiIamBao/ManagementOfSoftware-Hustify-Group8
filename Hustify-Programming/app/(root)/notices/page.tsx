import { getNotificationsForUser } from '@/lib/actions/notification.action';
import NoticesClient from './notices-client';

export default async function NoticesPage() {
  const notifications = await getNotificationsForUser();

  // B1: Only friend/activity notifications belong on /notices
  const socialNotifications = (notifications as any[]).filter((n) =>
    ['friend_post', 'friend_reaction'].includes(n?.type)
  );

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Notifications</h1>
      <NoticesClient initialNotifications={socialNotifications as any} />
    </div>
  );
}

