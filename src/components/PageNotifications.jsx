import React from "react";
import { notificationAPI } from "./api";
import { useFetch, useToast } from "./hooks";
import { Spinner, ErrorState, Toast, EmptyState } from "./UI";

export default function PageNotifications() {
  const { data, loading, error, refetch } = useFetch(notificationAPI.getAll);
  const { toast, showToast } = useToast();

  const notifications = Array.isArray(data) ? data : (data?.notifications || data?.content || []);

  const markAllRead = async () => {
    try {
      await notificationAPI.markAllRead();
      await refetch();
      showToast("✅ All marked as read");
    } catch { showToast("❌ Failed"); }
  };

  const markOne = async (id) => {
    try {
      await notificationAPI.markRead(id);
      await refetch();
    } catch {}
  };

  const unreadCount = notifications.filter(n => !n.read && !n.isRead).length;

  if (loading) return <Spinner />;
  if (error)   return <ErrorState message={error} onRetry={refetch} />;

  return (
    <div className="hr-page">
      <Toast message={toast} />
      <div className="hr-page-header-row">
        <h2 className="hr-page-heading">Notifications</h2>
        {unreadCount > 0 && (
          <button className="hr-text-btn" onClick={markAllRead}>Mark all read</button>
        )}
      </div>
      <div className="hr-panel">
        {notifications.length === 0 ? (
          <EmptyState icon="🔔" text="No notifications" />
        ) : notifications.map(n => {
          const id      = n.id || n.notifId || n.notificationId;
          const isUnread= !n.read && !n.isRead;
          const text    = n.message || n.text || n.title || n.content || "";
          const time    = n.createdAt
            ? new Date(n.createdAt).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })
            : n.time || "";
          const icon    = n.icon || (n.type === "LEAVE" ? "📋" : n.type === "PAYROLL" ? "💰" : "🔔");
          return (
            <div key={id}
              className={`hr-notif-row ${isUnread ? "unread" : ""}`}
              onClick={() => isUnread && markOne(id)}>
              <div className="hr-notif-icon">{icon}</div>
              <div className="hr-notif-body">
                <div className="hr-notif-text">{text}</div>
                <div className="hr-notif-time">{time}</div>
              </div>
              {isUnread && <div className="hr-notif-dot" />}
            </div>
          );
        })}
      </div>
    </div>
  );
}
