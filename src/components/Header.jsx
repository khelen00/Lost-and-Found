
import { useEffect, useState } from "react";
import api from "../services/api";

const pageDescriptions = {
  Dashboard: "Your campus lost and found overview.",
  "Report Lost": "Report an item you have lost on campus.",
  "Report Found": "Help someone recover their missing item.",
  "My Reports": "Manage the items you have reported.",
  "Possible Matches": "Explore potential matches for lost items.",
  "Browse Found Items": "Search items found around campus.",
  "My Claims": "Track your submitted item claims.",
  "Admin Panel": "Review claims for items you reported as found.",
};

function Header({ page, user, logout }) {
  const userName = user?.name || "Student";
  const initial = userName.charAt(0).toUpperCase();
  const userId = user?.id || user?._id;

  const description =
    pageDescriptions[page] || "College Lost & Found Portal";

  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [notificationError, setNotificationError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  const unreadCount = notifications.filter(
    (notification) => !notification.isRead
  ).length;

  useEffect(() => {
    if (!userId) {
      setNotifications([]);
      return;
    }

    let cancelled = false;

    async function loadNotifications() {
      try {
        const response = await api.get("/notifications");
        const data = response.data;

        if (!cancelled) {
          setNotifications(
            Array.isArray(data.notifications)
              ? data.notifications
              : []
          );
          setNotificationError("");
        }
      } catch (error) {
        if (!cancelled) {
          setNotificationError(
            error.response?.data?.message ||
            "Could not load notifications."
          );
        }
      }
    }

    loadNotifications();

    // Refresh periodically to show new claim updates.
    const intervalId = window.setInterval(
      loadNotifications,
      30000
    );

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, [userId]);

  useEffect(() => {
    if (!isOpen) return;

    function handleEscape(event) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  async function markAsRead(notification) {
    if (notification.isRead || updatingId === notification._id) {
      return;
    }

    setUpdatingId(notification._id);

    try {
      await api.patch(
        `/notifications/${notification._id}/read`
      );

      setNotifications((current) =>
        current.map((item) =>
          item._id === notification._id
            ? { ...item, isRead: true }
            : item
        )
      );

      setNotificationError("");
    } catch (error) {
      setNotificationError(
        error.response?.data?.message ||
        "Could not mark notification as read."
      );
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <header className="app-header">
      <div className="header-content">
        <p className="subtitle">FindIt</p>

        <h1>{page}</h1>

        <p className="header-description">{description}</p>
      </div>

      <div className="header-user">
        <button
          type="button"
          className="mobile-header-logout"
          onClick={logout}
          aria-label="Log out"
          title="Log out"
        >
          <svg
            viewBox="0 0 24 24"
            width="23"
            height="23"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M10 17l5-5-5-5" />
            <path d="M15 12H3" />
            <path d="M12 3h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-6" />
          </svg>
        </button>
        <div className="notification-wrapper">
          <button
            type="button"
            className="notification-bell"
            onClick={() => setIsOpen((current) => !current)}
            aria-label={`Notifications, ${unreadCount} unread`}
            aria-expanded={isOpen}
            aria-haspopup="true"
            title="Notifications"
          >
            <svg
              viewBox="0 0 24 24"
              width="23"
              height="23"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
              <path d="M10 21h4" />
            </svg>

            {unreadCount > 0 && (
              <span className="notification-badge">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>

          {isOpen && (
            <section
              className="notification-dropdown"
              aria-label="Your notifications"
            >
              <div className="notification-dropdown-header">
                <div>
                  <h2>Notifications</h2>
                  <p>
                    {unreadCount === 0
                      ? "You're all caught up."
                      : `${unreadCount} unread notification${unreadCount === 1 ? "" : "s"
                      }`}
                  </p>
                </div>

                <button
                  type="button"
                  className="notification-close"
                  onClick={() => setIsOpen(false)}
                  aria-label="Close notifications"
                >
                  ×
                </button>
              </div>

              {notificationError && (
                <p className="notification-error" role="alert">
                  {notificationError}
                </p>
              )}

              {notifications.length === 0 ? (
                <div className="notification-empty">
                  <p>No notifications yet</p>
                  <span>
                    Claim updates will appear here when available.
                  </span>
                </div>
              ) : (
                <div className="notification-list">
                  {notifications.map((notification) => (

                    <button
                      type="button"
                      className={`notification-entry ${notification.isRead ? "" : "is-unread"
                        }`}
                      key={notification._id}
                      onClick={() => markAsRead(notification)}
                      disabled={updatingId === notification._id}
                    >

                      <span
                        className={`notification-dot ${notification.isRead ? "is-read" : ""
                          }`}
                      />

                      <span className="notification-entry-content">
                        <span className="notification-entry-message">
                          {notification.message}
                        </span>

                        <span className="notification-time">
                          {notification.createdAt
                            ? new Date(
                              notification.createdAt
                            ).toLocaleString()
                            : "Recently"}
                        </span>

                        {!notification.isRead && (
                          <span className="notification-mark-read">
                            {updatingId === notification._id
                              ? "Updating..."
                              : "Click to mark as read"}
                          </span>
                        )}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </section>
          )}
        </div>

        <div className="header-user-info">
          <span className="header-user-name">{userName}</span>
          <span className="header-user-label">Campus Member</span>
        </div>

        <span
          className="profile"
          aria-label={`Profile: ${userName}`}
          title={userName}
        >
          {initial}
        </span>
      </div>
    </header>
  );
}

export default Header;
