"use client";

import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, onSnapshot, query, where } from 'firebase/firestore';

import { auth, db } from '@/firebase/client';

export default function NetworkNavIndicator() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (!user) {
        setCount(0);
        return;
      }

      const q = query(
        collection(db, 'friendships'),
        where('userB', '==', user.uid),
        where('status', '==', 'pending')
      );

      const unsubSnap = onSnapshot(q, (snap) => {
        setCount(snap.docs.length);
      });

      return () => unsubSnap();
    });

    return () => unsub();
  }, []);

  if (count <= 0) return null;

  return (
    <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] leading-none text-white">
      {count}
    </span>
  );
}

