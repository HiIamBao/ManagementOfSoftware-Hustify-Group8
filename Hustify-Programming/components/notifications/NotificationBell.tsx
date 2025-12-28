"use client";

import { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { markNotificationAsRead } from '@/lib/actions/notification.action';
import { Notification } from '@/types';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '@/firebase/client';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const q = query(
          collection(db, 'notifications'),
          where('userId', '==', user.uid),
          // Job-only notifications
          where('type', '==', 'job_posting'),
          orderBy('createdAt', 'desc')
        );

        const unsubscribeSnapshot = onSnapshot(q, (snapshot) => {
          const fetchedNotifications = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Notification[];
          setNotifications(fetchedNotifications);
          setUnreadCount(fetchedNotifications.filter(n => !n.isRead).length);
        });

        return () => unsubscribeSnapshot();
      } else {
        setNotifications([]);
        setUnreadCount(0);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.isRead) {
      await markNotificationAsRead(notification.id);
      setUnreadCount(prev => prev - 1);
      setNotifications(prev => 
        prev.map(n => n.id === notification.id ? { ...n, isRead: true } : n)
      );
    }
    setIsOpen(false);
    router.push(notification.link);
  };

  useEffect(() => {
    if (!isOpen) return;

    const unread = notifications.filter((n) => !n.isRead);
    if (unread.length === 0) return;

    (async () => {
      await Promise.all(unread.map((n) => markNotificationAsRead(n.id)));
    })();
  }, [isOpen, notifications]);

  return (
    <Popover
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open);
      }}
    >
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white">
              {unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="p-2 font-semibold border-b">Notifications</div>
        <div className="max-h-96 overflow-y-auto">
          {notifications.length > 0 ? (
            notifications.map(notification => (
              <div 
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className={`p-3 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer border-b ${!notification.isRead ? 'font-semibold' : 'text-gray-500'}`}
              >
                <p className="text-sm">{notification.message}</p>
                <p className="text-xs text-gray-400 mt-1">{new Date(notification.createdAt).toLocaleString()}</p>
              </div>
            ))
          ) : (
            <p className="p-4 text-sm text-center text-gray-500">No notifications yet.</p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

