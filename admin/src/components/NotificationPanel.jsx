import React, { useEffect, useRef } from 'react';

const getRelativeTime = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays === 1) return 'Yesterday';
  if (diffInDays < 7) return `${diffInDays}d ago`;
  
  return date.toLocaleDateString();
};

const NotificationPanel = ({
  isOpen,
  onClose,
  notifications,
  unreadCount,
  markAsRead,
  markAllAsRead
}) => {
  const panelRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      <div 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 99,
        }}
        onClick={onClose}
      />
      <div
        ref={panelRef}
        style={{
          position: 'absolute',
          top: '8px',
          right: '0',
          width: '380px',
          maxHeight: '480px',
          background: 'rgba(15, 15, 17, 0.95)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(200, 169, 110, 0.15)',
          borderRadius: '16px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
          zIndex: 100,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          fontFamily: "'Inter', sans-serif",
          color: '#F5F5F5'
        }}
      >
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px 20px',
          borderBottom: '1px solid rgba(200, 169, 110, 0.15)',
          background: '#161820'
        }}>
          <h3 style={{ 
            margin: 0, 
            fontFamily: "'Rajdhani', sans-serif", 
            fontSize: '1.25rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            Notifications
            {unreadCount > 0 && (
              <span style={{
                background: '#c8a96e',
                color: '#0A0A0B',
                fontSize: '0.75rem',
                padding: '2px 8px',
                borderRadius: '12px',
                fontWeight: 700
              }}>
                {unreadCount}
              </span>
            )}
          </h3>
          <button 
            onClick={markAllAsRead}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#c8a96e',
              fontSize: '0.875rem',
              cursor: 'pointer',
              padding: '4px 8px',
              borderRadius: '4px',
              transition: 'background 0.2s',
            }}
            onMouseOver={(e) => e.target.style.background = 'rgba(200, 169, 110, 0.1)'}
            onMouseOut={(e) => e.target.style.background = 'transparent'}
          >
            Mark all read
          </button>
        </div>

        <div style={{ 
          overflowY: 'auto', 
          flex: 1,
          maxHeight: '400px'
        }}>
          {notifications.length === 0 ? (
            <div style={{
              padding: '40px 20px',
              textAlign: 'center',
              color: '#6b6980'
            }}>
              No notifications yet
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                onClick={() => {
                  if (!notification.isRead) markAsRead(notification.id);
                  window.location.hash = '/inquiries';
                  onClose();
                }}
                style={{
                  padding: '16px 20px',
                  borderBottom: '1px solid rgba(255,255,255,0.05)',
                  borderLeft: notification.isRead ? '4px solid transparent' : '4px solid #c8a96e',
                  cursor: 'pointer',
                  background: notification.isRead ? 'transparent' : 'rgba(200, 169, 110, 0.05)',
                  transition: 'background 0.2s',
                }}
                onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'}
                onMouseOut={(e) => e.currentTarget.style.background = notification.isRead ? 'transparent' : 'rgba(200, 169, 110, 0.05)'}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{notification.title}</span>
                  <span style={{ fontSize: '0.75rem', color: '#a3a3a3' }}>
                    {getRelativeTime(notification.createdAt || notification.created_at)}
                  </span>
                </div>
                <p style={{ 
                  margin: 0, 
                  fontSize: '0.85rem', 
                  color: '#a3a3a3',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}>
                  {notification.body}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
};

export default NotificationPanel;
