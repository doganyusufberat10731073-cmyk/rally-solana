import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCheck, Sparkles } from 'lucide-react';
import { api } from '@/api/client';
import type { Notification } from '@/types';
import { Button } from '@/components/ui/Button';

interface NotificationsDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdateUnreadCount?: (count: number) => void;
  isLoggedIn: boolean;
}

export function NotificationsDropdown({
  isOpen,
  onClose,
  onUpdateUnreadCount,
  isLoggedIn,
}: NotificationsDropdownProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    if (!isLoggedIn) return;
    try {
      setIsLoading(true);
      const res = await api.getNotifications();
      setNotifications(res.items || []);
      setUnreadCount(res.unreadCount || 0);
      onUpdateUnreadCount?.(res.unreadCount || 0);
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetchNotifications();
    }
  }, [isLoggedIn]);

  useEffect(() => {
    if (isOpen && isLoggedIn) {
      fetchNotifications();
    }
  }, [isOpen]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  const handleMarkAllAsRead = async () => {
    try {
      await api.markAllNotificationsAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
      onUpdateUnreadCount?.(0);
    } catch {
      // ignore
    }
  };

  const handleNotificationClick = async (notif: Notification) => {
    if (!notif.read) {
      try {
        await api.markNotificationAsRead(notif.id);
        setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, read: true } : n));
        setUnreadCount(prev => Math.max(0, prev - 1));
        onUpdateUnreadCount?.(Math.max(0, unreadCount - 1));
      } catch {
        // ignore
      }
    }
    if (notif.activityId) {
      navigate(`/activity/${notif.activityId}`);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 top-12 z-50 w-80 sm:w-96 bg-card border border-border rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-secondary-background/50">
        <div className="flex items-center gap-2">
          <Bell className="h-4 w-4 text-accent" />
          <span className="font-semibold text-sm">Notifications</span>
          {unreadCount > 0 && (
            <span className="px-1.5 py-0.5 rounded-full bg-accent/20 text-accent text-xs font-bold">
              {unreadCount}
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleMarkAllAsRead}
            className="text-xs h-7 px-2 text-secondary-text hover:text-primary-text flex items-center gap-1"
          >
            <CheckCheck className="h-3.5 w-3.5" /> Mark all read
          </Button>
        )}
      </div>

      {/* Content */}
      <div className="max-h-[380px] overflow-y-auto divide-y divide-border/60">
        {!isLoggedIn ? (
          <div className="py-12 px-4 text-center">
            <Bell className="h-8 w-8 text-muted-text mx-auto mb-2 opacity-50" />
            <p className="text-sm text-secondary-text">Connect wallet to view your notifications.</p>
          </div>
        ) : isLoading && notifications.length === 0 ? (
          <div className="py-12 text-center text-xs text-secondary-text">Loading notifications...</div>
        ) : notifications.length === 0 ? (
          <div className="py-12 px-4 text-center">
            <Sparkles className="h-8 w-8 text-accent/50 mx-auto mb-2" />
            <p className="text-sm font-medium text-primary-text mb-1">All caught up!</p>
            <p className="text-xs text-secondary-text">You don't have any notifications right now.</p>
          </div>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => handleNotificationClick(notif)}
              className={`p-3.5 transition-colors cursor-pointer hover:bg-secondary-background/60 flex items-start gap-3 ${
                !notif.read ? 'bg-accent/5' : ''
              }`}
            >
              <div className="mt-1 shrink-0">
                {!notif.read ? (
                  <span className="block h-2 w-2 rounded-full bg-accent" />
                ) : (
                  <span className="block h-2 w-2 rounded-full bg-transparent" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-xs leading-relaxed ${!notif.read ? 'font-medium text-primary-text' : 'text-secondary-text'}`}>
                  {notif.content}
                </p>
                <span className="text-[10px] text-muted-text mt-1 block">
                  {new Date(notif.timestamp).toLocaleString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
