import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Building2, 
  CheckCircle2, 
  Clock, 
  Loader2,
  User,
  Shield,
  Save,
  Ticket,
  History as HistoryIcon,
  ArrowLeft,
  Home as HomeIcon,
  Bell,
  Calendar
} from 'lucide-react';
import tokenService from "../services/tokenServices";
import queueServices from '../services/queueServices';
import { authService } from '../services/authService';
import "../assets/css/UserPanel.css";

// Inline DatePicker Component
function InlineDatePicker({ value, onChange, minDate }) {
  return (
    <div style={{ marginTop: '1rem' }}>
      <label 
        className="form-label" 
        style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: '600' }}
      >
        <Calendar size={15} /> Select Booking Date
      </label>
      <input 
        type="date" 
        value={value}
        min={minDate || new Date().toISOString().split('T')[0]}
        onChange={(e) => onChange(e.target.value)}
        required
        className="form-input"
        style={{
          width: '100%',
          padding: '0.6rem 0.8rem',
          borderRadius: '6px',
          border: '1px solid #d1d5db',
          marginTop: '0.3rem'
        }}
      />
    </div>
  );
}

// Helper to format estimated datetime to a readable time string
function formatExpectedTime(timeStr) {
  if (!timeStr) return 'N/A';
  const dateObj = new Date(timeStr);
  if (isNaN(dateObj.getTime())) return timeStr;
  return dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function UserPanel() {
  const [activeTab, setActiveTab] = useState('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  
  // Local notification system (same as OrgPanel)
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const notifIdRef = useRef(0);

  const addNotification = useCallback((type, title, message) => {
    const id = ++notifIdRef.current;
    setNotifications(prev => [
      { id, type, title, message, timestamp: new Date(), read: false },
      ...prev
    ]);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;
  const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  const clearAll = () => setNotifications([]);
  const dismissNotification = (id) => setNotifications(prev => prev.filter(n => n.id !== id));

  // Active & Historical tokens
  const [activeTokens, setActiveTokens] = useState([]);
  const [historicalTokens, setHistoricalTokens] = useState([]);

  // Booking wizard state
  const [selectedOrgForBooking, setSelectedOrgForBooking] = useState(null);
  const [selectedQueueId, setSelectedQueueId] = useState(null);
  const [bookingDate, setBookingDate] = useState(new Date().toISOString().split('T')[0]);

  // Profile State — loaded from /auth/me on mount
  const [profile, setProfile] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
  });
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [tempProfile, setTempProfile] = useState({ ...profile });
  const [profileSaveStatus, setProfileSaveStatus] = useState(null); // null | 'saving' | 'success' | 'error'
  const [profileSaveError, setProfileSaveError] = useState('');

  // Sync tempProfile whenever real profile loads
  useEffect(() => {
    setTempProfile({ ...profile });
  }, [profile]);

  // Returns greeting based on current hour
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const categories = ['All', 'Banking', 'Healthcare', 'Government'];

  const [organizations, setOrganizations] = useState([]);


  const trackingSteps = [
    { label: 'Token issued successfully', status: 'done' },
    { label: 'Queue joined position updated', status: 'done' },
    { label: 'Almost your turn at the window', status: 'active' },
    { label: 'Called to counter deck room', status: 'pending' }
  ];

  // --- API FETCH FUNCTIONS ---

  const fetchDashboardData = async () => {
    try {
      // Backend returns a flat array of all user tokens
      const data = await tokenService.getMyTokens();
      const allTokens = Array.isArray(data) ? data : [];

      // Active statuses from the backend TokenStatus enum (SERVING maps to 'CALLED')
      const activeStatuses = ['WAITING', 'SERVING', 'CALLED'];
      const rawActive = allTokens.filter((t) => activeStatuses.includes(t.status));
      const rawHistory = allTokens.filter((t) => !activeStatuses.includes(t.status));

      const mappedActive = await Promise.all(
        rawActive.map(async (item) => {
          try {
            let positionText = 'Pending';
            let currentServingNumber = 'N/A';

            if (item.status === 'CALLED' || item.status === 'SERVING') {
              positionText = 'Serving';
            } else {
              try {
                const posData = await tokenService.getWaitingPosition(item.id);
                if (posData && posData.waiting_position !== undefined) {
                  positionText = `${posData.waiting_position}`;
                }
              } catch (posErr) {
                positionText = 'Pending';
              }
            }

            try {
              const currentData = await tokenService.getCurrentToken(item.queue_id);
              if (currentData && currentData.token_number !== undefined) {
                currentServingNumber = `T-${currentData.token_number}`;
              }
            } catch (currErr) {
              currentServingNumber = 'None';
            }

            let statusText = 'Pending';
            if (item.status === 'CALLED' || item.status === 'SERVING') {
              statusText = 'Serving';
            } else if (item.status === 'WAITING') {
              statusText = 'Pending';
            }

            return {
              id: item.id,
              queueId: item.queue_id,
              number: `T-${item.token_number}`,
              department: item.queue_name || `Queue #${item.queue_id}`,
              counter: item.status,
              institution: item.queue_name || `Queue #${item.queue_id}`,
              ahead: positionText,
              nowServing: currentServingNumber,
              status: statusText,
              bookingDate: item.booking_date,
              estimatedTime: item.estimated_time
            };
          } catch (itemErr) {
            return {
              id: item.id,
              queueId: item.queue_id,
              number: `T-${item.token_number}`,
              department: item.queue_name || `Queue #${item.queue_id}`,
              counter: item.status,
              institution: item.queue_name || `Queue #${item.queue_id}`,
              ahead: 'Pending',
              nowServing: 'None',
              status: item.status === 'WAITING' ? 'Pending' : 'Serving',
              bookingDate: item.booking_date,
              estimatedTime: item.estimated_time
            };
          }
        })
      );
      setActiveTokens(mappedActive);

      const mappedHistory = rawHistory.map((item) => ({
        id: `h-${item.id}`,
        type: item.queue_name || `Queue #${item.queue_id}`,
        meta: `Token #T-${item.token_number} · Status: ${item.status} · Date: ${item.booking_date}`,
        variant: item.status,
        badgeClass: item.status === 'COMPLETED' ? 'badge-emerald' : 'badge-indigo'
      }));
      setHistoricalTokens(mappedHistory);

    } catch (err) {
      console.error('Failed to fetch user dashboard data:', err);
    }
  };

  const fetchOrganizations = async () => {
    try {
      const data = await tokenService.getOrganizations();
      if (Array.isArray(data) && data.length > 0) {
        const mappedOrgs = data.map((item) => ({
          id: item.id || item.queue_id,
          name: item.institution_name || item.name || item.queue_name || 'Organization',
          category: item.category || 'General',
          branch: item.branch || 'Main Branch',
          departments: item.departments || ['General Counter'],
          waiting: item.waiting_count || 0,
          icon: Building2,
          iconClass: 'icon-indigo'
        }));
        setOrganizations(mappedOrgs);
      }
    } catch (err) {
      console.error('Failed to fetch queues:', err);
    }
  };

  const fetchUserProfile = async () => {
    try {
      const data = await authService.getMe();
      setProfile({
        name: data.name || '',
        email: data.email || '',
        phone: data.phone || '',
        address: data.address || '',
      });
    } catch (err) {
      console.error('Failed to fetch user profile:', err);
    }
  };

  useEffect(() => {
    fetchUserProfile();
    fetchDashboardData();
    fetchOrganizations();

    const interval = setInterval(() => {
      fetchDashboardData();
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  // --- NOTIFICATION HANDLERS ---
  const handleToggleNotifications = () => {
    setShowNotifications((prev) => !prev);
  };

  const filteredOrgs = organizations.filter((org) => {
    const matchesCategory = activeCategory === 'All' || org.category === activeCategory;
    const matchesSearch = org.name.toLowerCase().includes(searchQuery.toLowerCase()) || org.branch.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // --- ACTIONS ---
  const handleSelectOrg = (org) => {
    // Fetch queues for this institution and let user pick a specific queue
    (async () => {
      try {
        const queues = await queueServices.getQueuesByInstitution(org.id);
        setSelectedOrgForBooking({ ...org, queues });
        setSelectedQueueId(queues && queues.length > 0 ? queues[0].id : null);
      } catch (err) {
        console.error('Failed to load queues for institution:', err);
        setSelectedOrgForBooking({ ...org, queues: [] });
        setSelectedQueueId(null);
      }
    })();
  };

  const handleExecuteBooking = async (e) => {
    e.preventDefault();
    if (!selectedOrgForBooking || !bookingDate || !selectedQueueId) {
      addNotification('error', 'Booking Failed', 'Please select a queue and booking date.');
      return;
    }

    try {
      const booked = await tokenService.bookToken(selectedQueueId, bookingDate);
      addNotification(
        'success',
        'Token Booked Successfully',
        `Token #T-${booked.token_number} booked at ${selectedOrgForBooking.name} for ${bookingDate}.`
      );
      await fetchDashboardData();
      setSelectedOrgForBooking(null);
      setSelectedQueueId(null);
      setSearchQuery('');
      setActiveTab('track');
    } catch (err) {
      console.error('Booking API call failed:', err);
      addNotification('error', 'Booking Failed', err.message || 'Failed to book token. Please try again.');
    }
  };

  const handleCancelToken = async (id) => {
    if (window.confirm('Are you sure you want to cancel this live token?')) {
      try {
        const token = activeTokens.find((t) => t.id === id);
        await tokenService.cancelToken(id, token?.queueId);
        addNotification(
          'info',
          'Token Cancelled',
          `Your token at ${token?.institution || 'the queue'} has been cancelled.`
        );
        await fetchDashboardData();
      } catch (err) {
        console.error('Cancellation failed:', err);
        addNotification('error', 'Cancellation Failed', err.message || 'Failed to cancel token.');
      }
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setProfileSaveStatus('saving');
    setProfileSaveError('');
    try {
      const updated = await authService.updateProfile({
        name: tempProfile.name,
        phone: tempProfile.phone,
        address: tempProfile.address,
      });
      // Sync local state from server response
      setProfile({
        name: updated.name || '',
        email: updated.email || profile.email,
        phone: updated.phone || '',
        address: updated.address || '',
      });
      setIsEditingProfile(false);
      setProfileSaveStatus('success');
      setTimeout(() => setProfileSaveStatus(null), 3000);
    } catch (err) {
      setProfileSaveStatus('error');
      setProfileSaveError(err.message || 'Failed to save profile.');
    }
  };

  const startEditing = () => {
    setTempProfile({ ...profile });
    setIsEditingProfile(true);
    setActiveTab('profile');
  };

  const getTabIcon = (tab) => {
    switch(tab) {
      case 'home': return <HomeIcon size={18} />;
      case 'book': return <Building2 size={18} />;
      case 'track': return <Ticket size={18} />;
      case 'history': return <HistoryIcon size={18} />;
      case 'profile': return <User size={18} />;
      default: return <HomeIcon size={18} />;
    }
  };

  return (
    <div className="app-container">
      
      {/* HEADER */}
      <header className="global-header">
        <div className="header-left">
          <span 
            className="brand-logo" 
            onClick={() => { setActiveTab('home'); setSelectedOrgForBooking(null); }}
          >
            NoQ
          </span>
          
          <nav className="desktop-nav md:flex">
            {['home', 'book', 'track', 'history', 'profile'].map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  if (tab !== 'profile') setIsEditingProfile(false);
                  if (tab !== 'book') setSelectedOrgForBooking(null);
                }}
                className={`nav-button ${activeTab === tab ? 'active' : ''}`}
              >
                {tab === 'book' ? 'Book Token' : tab === 'track' ? 'Track Queue' : tab}
              </button>
            ))}
          </nav>
        </div>

        <div className="header-right" style={{ display: 'flex', alignItems: 'center', gap: '1rem', position: 'relative' }}>
          
          {/* NOTIFICATION HEADER DROPDOWN */}
          <div className="notification-container" style={{ position: 'relative' }}>
            <button 
              className="notification-icon-btn"
              onClick={handleToggleNotifications}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '8px',
                borderRadius: '50%',
                position: 'relative',
                color: 'inherit'
              }}
              aria-label="Notifications"
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span 
                  style={{
                    position: 'absolute',
                    top: '2px',
                    right: '2px',
                    backgroundColor: '#ef4444',
                    color: '#ffffff',
                    borderRadius: '50%',
                    fontSize: '0.65rem',
                    padding: '2px 5px',
                    fontWeight: 'bold'
                  }}
                >
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div
                className="notification-dropdown"
                style={{
                  position: 'absolute',
                  right: 0,
                  top: '44px',
                  width: '340px',
                  backgroundColor: '#ffffff',
                  boxShadow: '0 12px 30px -5px rgba(0,0,0,0.18)',
                  borderRadius: '12px',
                  border: '1px solid #e5e7eb',
                  zIndex: 200,
                  color: '#1f2937',
                  overflow: 'hidden'
                }}
              >
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', borderBottom: '1px solid #f3f4f6', background: '#fafafa' }}>
                  <span style={{ fontWeight: '700', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Bell size={14} /> Notifications
                    {unreadCount > 0 && (
                      <span style={{ background: '#ef4444', color: '#fff', borderRadius: '20px', fontSize: '0.6rem', padding: '1px 6px', fontWeight: 'bold' }}>
                        {unreadCount}
                      </span>
                    )}
                  </span>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    {unreadCount > 0 && (
                      <button onClick={markAllRead} style={{ fontSize: '0.72rem', color: '#4f46e5', border: 'none', background: 'none', cursor: 'pointer', fontWeight: '600' }}>
                        Mark all read
                      </button>
                    )}
                    {notifications.length > 0 && (
                      <button onClick={clearAll} style={{ fontSize: '0.72rem', color: '#6b7280', border: 'none', background: 'none', cursor: 'pointer' }}>
                        Clear all
                      </button>
                    )}
                  </div>
                </div>

                {/* List */}
                <div style={{ maxHeight: '340px', overflowY: 'auto' }}>
                  {notifications.length > 0 ? (
                    notifications.map((item) => {
                      const colors = {
                        success: { bg: '#f0fdf4', border: '#22c55e', icon: '#16a34a', badge: '#dcfce7', badgeText: '#15803d' },
                        error:   { bg: '#fef2f2', border: '#ef4444', icon: '#dc2626', badge: '#fee2e2', badgeText: '#b91c1c' },
                        info:    { bg: '#eff6ff', border: '#3b82f6', icon: '#2563eb', badge: '#dbeafe', badgeText: '#1d4ed8' },
                        warning: { bg: '#fffbeb', border: '#f59e0b', icon: '#d97706', badge: '#fef3c7', badgeText: '#92400e' },
                      };
                      const c = colors[item.type] || colors.info;
                      return (
                        <div
                          key={item.id}
                          style={{
                            padding: '10px 14px',
                            borderLeft: `3px solid ${item.read ? '#e5e7eb' : c.border}`,
                            background: item.read ? '#fff' : c.bg,
                            borderBottom: '1px solid #f3f4f6',
                            display: 'flex',
                            gap: '10px',
                            alignItems: 'flex-start',
                            transition: 'background 0.2s'
                          }}
                        >
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                              <span style={{ fontWeight: '700', fontSize: '0.82rem', color: item.read ? '#6b7280' : '#111827' }}>
                                {item.title}
                              </span>
                              <span style={{ fontSize: '0.68rem', color: c.icon, background: c.badge, color: c.badgeText, borderRadius: '6px', padding: '1px 6px', fontWeight: '600', marginLeft: '6px', whiteSpace: 'nowrap', flexShrink: 0 }}>
                                {item.type}
                              </span>
                            </div>
                            <div style={{ fontSize: '0.78rem', color: item.read ? '#9ca3af' : '#374151', lineHeight: 1.4 }}>{item.message}</div>
                            <div style={{ fontSize: '0.68rem', color: '#9ca3af', marginTop: '4px' }}>
                              {item.timestamp ? item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                            </div>
                          </div>
                          <button
                            onClick={() => dismissNotification(item.id)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: '0', fontSize: '14px', flexShrink: 0, lineHeight: 1 }}
                            aria-label="Dismiss"
                          >
                            ✕
                          </button>
                        </div>
                      );
                    })
                  ) : (
                    <div style={{ padding: '28px 16px', textAlign: 'center', color: '#9ca3af', fontSize: '0.85rem' }}>
                      <Bell size={28} style={{ opacity: 0.25, display: 'block', margin: '0 auto 8px' }} />
                      No notifications yet
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div onClick={startEditing} className="user-profile-badge cursor-pointer">
            <div className="user-info sm:block">
              <div className="user-name">{profile.name}</div>
              <div className="user-phone">{profile.phone}</div>
            </div>
            <div className="user-avatar">
              {profile.name.split(' ').map(n => n[0]).join('')}
            </div>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <main className="main-content">
        
        {/* HOME TAB */}
        {activeTab === 'home' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 home-grid">
            <div className="lg:col-span-7 home-left-col">
              <div className="welcome-header">
                <h2 className="welcome-title">Welcome back, {profile.name.split(' ')[0]}</h2>
                <span className="active-count">
                  {activeTokens.length} Active {activeTokens.length === 1 ? 'Booking' : 'Bookings'}
                </span>
              </div>

              {activeTokens.length > 0 ? (
                <div className="active-tokens-container">
                  <div className="tokens-scroll-area">
                    {activeTokens.map((token) => (
                      <div key={token.id} className="token-card">
                        <div className="token-card-header">
                          <div className="token-institution">
                            {token.institution} &bull; {token.bookingDate ? new Date(token.bookingDate).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) : ''}
                          </div>
                          <span className="live-badge">Live</span>
                        </div>
                        
                        <div className="token-card-body">
                          <div className="token-number">{token.number}</div>
                          <div className="token-dept">{token.department}</div>
                        </div>

                        <div className="token-metrics-grid">
                          <div>
                            <div className="metric-value">{token.ahead}</div>
                            <div className="metric-label">Position</div>
                          </div>
                          <div>
                            <div className="metric-value wait-value">{formatExpectedTime(token.estimatedTime)}</div>
                            <div className="metric-label">Expected Time</div>
                          </div>
                          <div>
                            <div className="metric-value">{token.status}</div>
                            <div className="metric-label">Status</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="empty-state-card">
                  No active tokens running right now. Select "Book Token" to join a line.
                </div>
              )}
            </div>

            <div className="lg:col-span-5 home-right-col">
              <div className="hidden lg:block spacer-block"></div>
              <div className="promo-banner-card">
                <div>
                  <h3 className="promo-title">Skipping lines made simple</h3>
                  <p className="promo-subtitle">You can book multiple tokens simultaneously across separate remote branches or counters from this screen.</p>
                </div>
                <div className="grid grid-cols-2 action-tiles-grid">
                  <div onClick={() => setActiveTab('book')} className="action-tile group cursor-pointer">
                    <Building2 size={18} className="tile-icon" />
                    <div className="tile-title">New Booking</div>
                  </div>
                  <div onClick={() => setActiveTab('track')} className="action-tile group hover-emerald cursor-pointer">
                    <Ticket size={18} className="tile-icon" />
                    <div className="tile-title">Monitor Lines</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* BOOK TOKEN TAB */}
        {activeTab === 'book' && (
          <div className="card-container">
            {!selectedOrgForBooking ? (
              <>
                <div>
                  <h3 className="section-title">Search Institutions</h3>
                  <p className="section-subtitle">Find active service lines and check real-time availability.</p>
                </div>

                <div className="search-input-wrapper">
                  <input
                    type="text"
                    placeholder="Search bank, hospital, branch location..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="search-input"
                  />
                </div>

                <div className="category-chips-row">
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => setActiveCategory(category)}
                      className={`category-chip ${activeCategory === category ? 'active' : ''}`}
                    >
                      {category}
                    </button>
                  ))}
                </div>

                <div className="org-list-wrapper">
                  {filteredOrgs.length > 0 ? (
                    filteredOrgs.map((org) => {
                      const IconComponent = org.icon || Building2;
                      return (
                        <div key={org.id} onClick={() => handleSelectOrg(org)} className="org-item group cursor-pointer">
                          <div className="org-info">
                            <div className={`org-icon-wrapper ${org.iconClass}`}>
                              <IconComponent size={16} />
                            </div>
                            <div className="org-details">
                              <h4 className="org-title">{org.name} ({org.branch})</h4>
                              <p className="org-meta">{org.category} &middot; <span className="waiting-highlight">{org.waiting} waiting</span></p>
                            </div>
                          </div>
                          <button className="select-btn">Select</button>
                        </div>
                      );
                    })
                  ) : (
                    <div className="empty-search">No institutions match your search parameters.</div>
                  )}
                </div>
              </>
            ) : (
              <div className="booking-wizard space-y-4">
                <button onClick={() => { setSelectedOrgForBooking(null); setSelectedQueueId(null); }} className="back-btn">
                  <ArrowLeft size={14}/> Back to list
                </button>
                
                <div className="selected-org-summary">
                  <div className={`org-icon-wrapper ${selectedOrgForBooking.iconClass}`}>
                    {React.createElement(selectedOrgForBooking.icon || Building2, { size: 20 })}
                  </div>
                  <div>
                    <h4 className="summary-title">{selectedOrgForBooking.name}</h4>
                    <p className="summary-subtitle">{selectedOrgForBooking.branch} Branch &middot; {selectedOrgForBooking.waiting} waiting</p>
                  </div>
                </div>

                <form onSubmit={handleExecuteBooking} className="booking-form">
                  <div>
                    <label className="form-label">Select Queue</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 dept-grid">
                      {selectedOrgForBooking.queues && selectedOrgForBooking.queues.length > 0 ? (
                        selectedOrgForBooking.queues.map((q) => (
                          <div
                            key={q.id}
                            onClick={() => setSelectedQueueId(q.id)}
                            className={`dept-option ${selectedQueueId === q.id ? 'selected' : ''}`}
                          >
                            {q.name}
                          </div>
                        ))
                      ) : (
                        <div className="text-sm text-[#8A968E]">No queues available for this institution.</div>
                      )}
                    </div>
                  </div>

                  <InlineDatePicker 
                    value={bookingDate} 
                    onChange={setBookingDate} 
                  />

                  <button type="submit" className="confirm-btn" style={{ marginTop: '1.2rem' }}>
                    Confirm & Book Token Now
                  </button>
                </form>
              </div>
            )}
          </div>
        )}

        {/* TRACK TAB */}
        {activeTab === 'track' && (
          <div className="track-container card-container">
            <h3 className="track-header">Live Monitor Timelines</h3>
            
            {activeTokens.length > 0 ? (
              <div className="track-list">
                {activeTokens.map((token) => (
                  <div key={token.id} className="track-card">
                    <div className="track-card-header">
                      <div className="track-info">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                          <span className="track-number">{token.number}</span>
                          <span style={{
                            backgroundColor: '#e0e7ff',
                            color: '#3730a3',
                            fontSize: '0.75rem',
                            fontWeight: '600',
                            padding: '4px 8px',
                            borderRadius: '6px'
                          }}>
                            Now Serving: {token.nowServing}
                          </span>
                        </div>
                        <p className="track-institution">{token.institution}</p>
                        <p className="track-dept">{token.department} &bull; Status: {token.status}</p>
                      </div>
                      <button 
                        onClick={() => handleCancelToken(token.id)}
                        className="cancel-btn"
                      >
                        Cancel Ticket
                      </button>
                    </div>
                    
                    <div className="tracking-timeline">
                      {trackingSteps.map((step, index) => (
                        <div key={index} className="timeline-step">
                          <div className={`step-indicator ${step.status}`}>
                            {step.status === 'done' && <CheckCircle2 size={14} />}
                            {step.status === 'active' && <Loader2 size={14} className="animate-spin" />}
                            {step.status === 'pending' && <Clock size={14} />}
                          </div>
                          <div className={`step-label ${step.status === 'active' ? 'active-step' : ''}`}>
                            {step.label}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state-card">
                No active operational queues to monitor.
              </div>
            )}
          </div>
        )}

        {/* HISTORY TAB */}
        {activeTab === 'history' && (
          <div className="card-container">
            <h3 className="history-title"><HistoryIcon size={14}/> Past Visitations Log</h3>
            <div className="history-list">
              {historicalTokens.length === 0 ? (
                <div className="empty-search">No historical tokens found yet.</div>
              ) : (
                historicalTokens.map((item) => (
                  <div key={item.id} className="history-item">
                    <div>
                      <div className="history-type">{item.type}</div>
                      <div className="history-meta">{item.meta}</div>
                    </div>
                    <span className={`status-badge ${item.badgeClass}`}>
                      {item.variant}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* PROFILE TAB */}
        {activeTab === 'profile' && (
          <div className="card-container profile-container">
            <div className="profile-header">
              <div className="profile-avatar">
                {profile.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <h3 className="profile-name-title">{profile.name}</h3>
                <p className="profile-account-id">Client ID Account: #NQ-98452-CP</p>
              </div>
            </div>

            <form onSubmit={handleSaveProfile} className="profile-form">
              <div>
                <label className="form-label">Full Identity Name</label>
                <input 
                  type="text" 
                  value={tempProfile.name}
                  onChange={(e) => setTempProfile({ ...tempProfile, name: e.target.value })}
                  disabled={!isEditingProfile}
                  className="form-input"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 form-grid">
                <div>
                  <label className="form-label">Phone Number</label>
                  <input 
                    type="text" 
                    value={tempProfile.phone}
                    onChange={(e) => setTempProfile({ ...tempProfile, phone: e.target.value })}
                    disabled={!isEditingProfile}
                    className="form-input"
                  />
                </div>
                <div>
                  <label className="form-label">Email Address</label>
                  <input 
                    type="email" 
                    value={tempProfile.email}
                    onChange={(e) => setTempProfile({ ...tempProfile, email: e.target.value })}
                    disabled={!isEditingProfile}
                    className="form-input"
                  />
                </div>
              </div>

              <div>
                <label className="form-label">Residential Address</label>
                <input 
                  type="text" 
                  value={tempProfile.address}
                  onChange={(e) => setTempProfile({ ...tempProfile, address: e.target.value })}
                  disabled={!isEditingProfile}
                  className="form-input"
                />
              </div>

              <div className="profile-footer">
                <div className="verification-status">
                  <Shield size={14} className="shield-icon" /> Verified Profile
                </div>

                {isEditingProfile ? (
                  <div className="btn-group">
                    <button type="button" onClick={() => { setIsEditingProfile(false); setProfileSaveStatus(null); }} className="cancel-edit-btn">Cancel</button>
                    <button type="submit" className="save-btn" disabled={profileSaveStatus === 'saving'}>
                      {profileSaveStatus === 'saving' ? <Loader2 size={13} className="spin-icon" /> : <Save size={13}/>} Save
                    </button>
                  </div>
                ) : (
                  <button type="button" onClick={() => setIsEditingProfile(true)} className="edit-btn"><User size={13}/> Edit Details</button>
                )}
              </div>

              {/* Save feedback messages */}
              {profileSaveStatus === 'success' && (
                <div className="profile-save-feedback profile-save-success">
                  <CheckCircle2 size={14} /> Profile updated successfully!
                </div>
              )}
              {profileSaveStatus === 'error' && (
                <div className="profile-save-feedback profile-save-error">
                  {profileSaveError || 'Failed to save profile. Please try again.'}
                </div>
              )}
            </form>
          </div>
        )}

      </main>

      {/* MOBILE BOTTOM NAVIGATION BAR */}
      <div className="mobile-bottom-nav md:hidden">
        {['home', 'book', 'track', 'history', 'profile'].map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab);
              if (tab !== 'profile') setIsEditingProfile(false);
              if (tab !== 'book') setSelectedOrgForBooking(null);
            }}
            className={`mobile-nav-item ${activeTab === tab ? 'active' : ''}`}
          >
            {getTabIcon(tab)}
            <span className="mobile-nav-label">
              {tab === 'book' ? 'Book' : tab === 'track' ? 'Track' : tab}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}