import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { MdPerson as UserIcon, MdSearch as SearchIcon, MdNotifications as BellIcon } from 'react-icons/md';
import { useRouter } from 'next/router';
import UserDropdown from './UserDropdown';
import SearchModal from './SearchModal';
import NotificationDropdown from './NotificationDropdown';
import '../app/styles/header.css';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [headerVisible, setHeaderVisible] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
  const router = useRouter();

  const handleScroll = useCallback(() => {
    const currentScrollY = window.scrollY;

    if (currentScrollY > 70) {
      setHeaderVisible(currentScrollY < lastScrollY);
    }

    setLastScrollY(currentScrollY);
  }, [lastScrollY]);

  useEffect(() => {
    setLastScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [handleScroll]);

  useEffect(() => {
    const handleRouteChangeStart = () => {
      setHeaderVisible(true);
      setIsLoading(true);
    };

    const handleRouteChangeComplete = () => {
      setIsLoading(false);
    };

    router.events.on('routeChangeStart', handleRouteChangeStart);
    router.events.on('routeChangeComplete', handleRouteChangeComplete);

    return () => {
      router.events.off('routeChangeStart', handleRouteChangeStart);
      router.events.off('routeChangeComplete', handleRouteChangeComplete);
    };
  }, [router.events]);

  const toggleUserDropdown = () => {
    setIsUserDropdownOpen(!isUserDropdownOpen);
  };

  const toggleSearchModal = () => {
    setIsSearchModalOpen(!isSearchModalOpen);
  };

  const toggleNotification = () => {
    setIsNotificationOpen(!isNotificationOpen);
  };

  const deleteNotification = (notificationId) => {
    console.debug('Deleting notification with ID:', notificationId);
    if (isLoggedIn && userId) {
      fetch(`http://blog.tourismofkashmir.com/apinotification.php?delete_notification=true&user_id=${userId}&notification_id=${notificationId}`, {
        method: 'GET' 
      })
        .then(response => response.json())
        .then(data => {
          console.debug('Notification deleted:', data);
          const updatedNotifications = notifications.filter(notification => notification.id !== notificationId);
          setNotifications(updatedNotifications);
          fetchUnreadNotificationCount();
        })
        .catch(error => {
          console.error('Error deleting notification:', error);
        });
    }
  };

  const fetchNotifications = useCallback(() => {
    if (userId) {
      console.debug('Fetching notifications for user ID:', userId);
      fetch(`http://blog.tourismofkashmir.com/apinotification.php?get_notifications&user_id=${userId}`)
        .then(response => response.json())
        .then(data => {
          setNotifications(data);
          console.debug('Fetched notifications:', data);
        })
        .catch(error => {
          console.error('Error fetching notifications:', error);
        });
    }
  }, [userId]);

  const fetchUnreadNotificationCount = useCallback(() => {
    if (userId) {
      fetch(`http://blog.tourismofkashmir.com/apinotification.php?get_notifications&user_id=${userId}&is_read=false`)
        .then(response => response.json())
        .then(data => {
          setUnreadNotificationCount(data.length);
          console.debug('Fetched unread notification count:', data.length);
        })
        .catch(error => {
          console.error('Error fetching unread notification count:', error);
        });
    }
  }, [userId]);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
      setIsLoggedIn(true);
      setUserId(user.id);
      setAvatarUrl(user.avatar);
      console.debug('User logged in:', user);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    fetchUnreadNotificationCount();

    const notificationsInterval = setInterval(fetchNotifications, 60000);
    const unreadCountInterval = setInterval(fetchUnreadNotificationCount, 60000);

    return () => {
      clearInterval(notificationsInterval);
      clearInterval(unreadCountInterval);
    };
  }, [fetchNotifications, fetchUnreadNotificationCount]);

  useEffect(() => {
    const handleTouchOrScroll = (event) => {
      // Check if the click occurred inside the dropdown or modal
      if (event.target.closest('.user-dropdown') || event.target.closest('.search-modal') || event.target.closest('.notification-dropdown')) {
        return;
      }
  
      // Close dropdowns and modals if click occurred outside
      setIsSearchModalOpen(false);
      setIsNotificationOpen(false);
      setIsUserDropdownOpen(false);
     
    };
  
    document.body.addEventListener('touchstart', handleTouchOrScroll);
    document.body.addEventListener('scroll', handleTouchOrScroll);
  
    return () => {
      document.body.removeEventListener('touchstart', handleTouchOrScroll);
      document.body.removeEventListener('scroll', handleTouchOrScroll);
    };
  }, []);
  
  
  return (
    <header style={{ top: headerVisible ? '0' : '-100px', transition: 'top 0.3s' }}>
      <div className="custom-header">
        <div className="menu-and-logo">
          <div className={`menu-icon ${isMenuOpen ? 'change' : ''}`} onClick={() => setIsMenuOpen(!isMenuOpen)}>
            <span></span>
            <span></span>
            <span></span>
          </div>
          <div className="logo">
            <Link href="/" legacyBehavior>
              <a className="logo-link">Leak News</a>
            </Link>
          </div>
        </div>

        <div className="header-icons">
          <div className="icon notification-icon" onClick={toggleNotification}>
            <BellIcon />
            {unreadNotificationCount > 0 && <span className="notification-badge">{unreadNotificationCount}</span>}
          </div>
         
          <div className="icon search-icon" onClick={toggleSearchModal}>
            <SearchIcon />
          </div>
          
          <div className="icon user-icon" onClick={toggleUserDropdown}>
            <UserIcon />
          </div>
          {isUserDropdownOpen && <UserDropdown onClose={() => setIsUserDropdownOpen(false)} />}
          {isSearchModalOpen && <SearchModal onClose={() => setIsSearchModalOpen(false)} />}
          {isNotificationOpen && <NotificationDropdown notifications={notifications} onDelete={deleteNotification} onClose={toggleNotification} />}
        </div>

        <div className={`side-menu ${isMenuOpen ? 'open' : 'closed'}`}>
          <Link href="/about">About Us</Link>
          <Link href="/contact">Contact</Link>
        </div>
      </div>

      {isLoading && (
        <div className="loading-bar"></div>
      )}
    </header>
  );
};

export default Header;