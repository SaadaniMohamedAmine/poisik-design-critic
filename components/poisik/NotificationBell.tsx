'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Bell,
  LogIn,
  LogOut,
  FolderPlus,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Zap,
  ArrowDownCircle,
  type LucideIcon,
} from 'lucide-react';
import { useRouter } from '@/i18n/navigation';

interface NotificationItem {
  id: string;
  type: string;
  title: string;
  message: string;
  link: string | null;
  read: boolean;
  createdAt: string;
}

const ICONS: Record<string, LucideIcon> = {
  WELCOME: LogIn,
  GOODBYE: LogOut,
  PROJECT_CREATED: FolderPlus,
  ANALYSIS_COMPLETED: CheckCircle2,
  ANALYSIS_FAILED: XCircle,
  USAGE_LIMIT_REACHED: AlertTriangle,
  PLAN_UPGRADED: Zap,
  PLAN_DOWNGRADED: ArrowDownCircle,
};

function timeAgo(dateStr: string): string {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loaded, setLoaded] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/notifications');
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount);
      }
    } finally {
      setLoading(false);
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    // Inlined (not `load()`) so the mount fetch doesn't call setLoading(true)
    // synchronously in the effect body — `loading` is already true from its
    // initial state, so there's nothing to set before the first await.
    async function fetchInitial() {
      try {
        const res = await fetch('/api/notifications');
        if (res.ok && !ignore) {
          const data = await res.json();
          setNotifications(data.notifications);
          setUnreadCount(data.unreadCount);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
          setLoaded(true);
        }
      }
    }
    fetchInitial();
    const interval = setInterval(load, 60000);
    return () => {
      ignore = true;
      clearInterval(interval);
    };
  }, [load]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  function handleToggle() {
    const next = !open;
    setOpen(next);
    if (next) load();
  }

  function handleItemClick(item: NotificationItem) {
    setOpen(false);
    if (!item.read) {
      setNotifications((prev) => prev.map((n) => (n.id === item.id ? { ...n, read: true } : n)));
      setUnreadCount((c) => Math.max(0, c - 1));
      fetch(`/api/notifications/${item.id}/read`, { method: 'PATCH' }).catch(() => {});
    }
    if (item.link) router.push(item.link);
  }

  function handleMarkAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
    fetch('/api/notifications/read-all', { method: 'PATCH' }).catch(() => {});
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={handleToggle}
        aria-label="Notifications"
        className="relative flex size-9 items-center justify-center rounded-full border border-border bg-bg-elevated text-text-secondary transition-colors hover:text-text-primary"
      >
        <Bell className="size-4" strokeWidth={1.5} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-accent-signal text-[10px] font-bold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="fixed inset-x-margin top-20 z-70 mt-2 overflow-hidden rounded-lg border border-border bg-surface shadow-2xl sm:absolute sm:inset-x-auto sm:right-0 sm:top-full sm:w-80">
          <div className="flex items-center justify-between border-b border-border px-md py-sm">
            <span className="text-label-md font-bold text-text-primary">Notifications</span>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-label-sm text-accent-signal hover:underline"
              >
                Mark all as read
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {loading && !loaded ? (
              <div className="px-lg py-xl text-center text-label-sm text-text-muted">Loading…</div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center gap-sm px-lg py-xl text-center">
                <Bell className="size-6 text-text-muted" strokeWidth={1.5} />
                <p className="text-label-md text-text-secondary">No notifications yet</p>
              </div>
            ) : (
              notifications.map((item) => {
                const Icon = ICONS[item.type] ?? Bell;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleItemClick(item)}
                    className={`flex w-full items-start gap-sm border-b border-border px-md py-sm text-left transition-colors last:border-b-0 hover:bg-surface-hover ${
                      item.read ? '' : 'bg-accent-soft-bg/40'
                    }`}
                  >
                    <Icon className="mt-0.5 size-4 shrink-0 text-accent-signal" strokeWidth={1.5} />
                    <div className="min-w-0 flex-1">
                      <p className="text-label-md font-medium text-text-primary">{item.title}</p>
                      <p className="mt-0.5 line-clamp-2 text-label-sm text-text-secondary">
                        {item.message}
                      </p>
                      <p className="mt-1 text-[11px] text-text-muted">{timeAgo(item.createdAt)}</p>
                    </div>
                    {!item.read && (
                      <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-accent-signal" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
