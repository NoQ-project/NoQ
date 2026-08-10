import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  HeartPulse, 
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

export default function UserPanel() {
  const [activeTab, setActiveTab] = useState('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  
  // Notification State
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);

  // Active & Historical tokens
  const [activeTokens, setActiveTokens] = useState([]);
  const [historicalTokens, setHistoricalTokens] = useState([]);

  // Booking wizard state
  const [selectedOrgForBooking, setSelectedOrgForBooking] = useState(null);
  const [selectedQueueId, setSelectedQueueId] = useState(null);
  const [bookingDate, setBookingDate] = useState(new Date().toISOString().split('T')[0]);

  // Profile State
  const [profile, setProfile] = useState({
    name: 'Ramesh Pandit',
    phone: '+977 9845XXXXXX',
    email: 'ramesh.pandit@email.com',
    address: 'Kathmandu, Nepal',
  });
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [tempProfile, setTempProfile] = useState({ ...profile });

  const categories = ['All', 'Banking', 'Healthcare', 'Government'];

  const [organizations, setOrganizations] = useState([
    { id: 1, name: 'City Bank', category: 'Banking', branch: 'Lazimpat', departments: ['General Banking', 'Loans & Credit'], waiting: 13, icon: Building2, iconClass: 'icon-indigo' },
    { id: 2, name: 'City Hospital', category: 'Healthcare', branch: 'Baneshwor', departments: ['OPD Checkup', 'Lab Reports'], waiting: 8, icon: HeartPulse, iconClass: 'icon-emerald' },
    { id: 3, name: 'Dept. of Passports', category: 'Government', branch: 'Tripureshwor', departments: ['Biometrics', 'Collection'], waiting: 3, icon: Building2, iconClass: 'icon-gray' },
  ]);

  const trackingSteps = [
    { label: 'Token issued successfully', status: 'done' },
    { label: 'Queue joined position updated', status: 'done' },
    { label: 'Almost your turn at the window', status: 'active' },
    { label: 'Called to counter deck room', status: 'pending' }
  ];

  // --- API FETCH FUNCTIONS ---
  const fetchNotifications = async () => {
    try {
      const data = await tokenService.getNotifications();
      if (Array.isArray(data)) {
        setNotifications(data);
        const unread = data.filter((n) => !n.is_read).length;
        setUnreadCount(unread);
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  };

  const fetchDashboardData = async () => {
    try {
      const data = await tokenService.getMyTokens();
      
      const rawActive = Array.isArray(data.active_tokens) ? data.active_tokens : [];
      const mappedActive = await Promise.all(
        rawActive.map(async (item) => {
          let positionText = 'In Queue';
          let currentServingNumber = 'N/A';

          try {
            const posData = await tokenService.getWaitingPosition(item.token_id);
            if (posData && posData.position !== undefined) {
              positionText = `#${posData.position} in line`;
            }
          } catch (posErr) {
            positionText = item.status;
          }

          try {
            const currentData = await tokenService.getCurrentToken(item.queue_id);
            if (currentData && currentData.token_number !== undefined) {
              currentServingNumber = `T-${currentData.token_number}`;
            }
          } catch (currErr) {
            currentServingNumber = 'None';
          }

          return {
            id: item.token_id,
            queueId: item.queue_id,
            number: `T-${item.token_number}`,
            department: item.queue_name || `Queue #${item.queue_id}`,
            counter: item.status,
            institution: item.queue_name || `Queue #${item.queue_id}`,
            ahead: positionText,
            nowServing: currentServingNumber,
            status: item.status,
            bookingDate: item.booking_date
          };
        })
      );
      setActiveTokens(mappedActive);

      const rawHistory = Array.isArray(data.booking_history) ? data.booking_history : [];
      const mappedHistory = rawHistory.map((item) => ({
        id: `h-${item.token_id}`,
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

  useEffect(() => {
    fetchDashboardData();
    fetchOrganizations();
    fetchNotifications();
  }, []);

  // --- NOTIFICATION HANDLERS ---
  const handleToggleNotifications = () => {
    setShowNotifications((prev) => !prev);
  };

  const handleMarkAllRead = async () => {
    try {
      await tokenService.markAllNotificationsRead();
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch (err) {
      console.error('Failed to mark all notifications read:', err);
    }
  };

  const handleMarkSingleRead = async (id, isRead) => {
    if (isRead) return;
    try {
      const updatedItem = await tokenService.markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((item) => (item.id === id ? { ...item, ...updatedItem, is_read: true } : item))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark notification read:', err);
    }
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
      alert('Please select a queue and booking date.');
      return;
    }

    try {
      await tokenService.bookToken(selectedQueueId, bookingDate);
      await fetchDashboardData();
      await fetchNotifications();
      setSelectedOrgForBooking(null);
      setSelectedQueueId(null);
      setSearchQuery('');
      setActiveTab('track');
    } catch (err) {
      console.error('Booking API call failed:', err);
      alert('Failed to book token. Please check backend connection.');
    }
  };

  const handleCancelToken = async (id) => {
    if (window.confirm('Are you sure you want to cancel this live token?')) {
      try {
        await tokenService.cancelToken(id);
        await fetchDashboardData();
        await fetchNotifications();
      } catch (err) {
        console.error('Cancellation failed:', err);
        alert('Failed to cancel token.');
      }
    }
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    setProfile({ ...tempProfile });
    setIsEditingProfile(false);
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
                  top: '40px',
                  width: '320px',
                  backgroundColor: '#ffffff',
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.15)',
                  borderRadius: '10px',
                  border: '1px solid #e5e7eb',
                  padding: '12px',
                  zIndex: 100,
                  color: '#1f2937'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', borderBottom: '1px solid #f3f4f6', paddingBottom: '6px' }}>
                  <span style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>Notifications</span>
                  {unreadCount > 0 && (
                    <button 
                      onClick={handleMarkAllRead}
                      style={{ fontSize: '0.75rem', color: '#4f46e5', border: 'none', background: 'none', cursor: 'pointer', fontWeight: '600' }}
                    >
                      Mark all as read
                    </button>
                  )}
                </div>

                <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
                  {notifications.length > 0 ? (
                    notifications.map((item) => (
                      <div 
                        key={item.id} 
                        onClick={() => handleMarkSingleRead(item.id, item.is_read)}
                        style={{ 
                          fontSize: '0.8rem', 
                          padding: '8px 10px', 
                          borderRadius: '6px',
                          marginBottom: '6px',
                          backgroundColor: item.is_read ? '#ffffff' : '#f0f9ff',
                          borderLeft: item.is_read ? '3px solid transparent' : '3px solid #0284c7',
                          cursor: item.is_read ? 'default' : 'pointer',
                          borderBottom: '1px solid #f9fafb' 
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '600', color: '#111827' }}>
                          <span>{item.title}</span>
                          <span style={{ fontSize: '0.65rem', color: '#0284c7', textTransform: 'uppercase' }}>
                            {item.type}
                          </span>
                        </div>
                        <div style={{ color: '#4b5563', marginTop: '2px' }}>{item.message}</div>
                        <div style={{ fontSize: '0.7rem', color: '#9ca3af', marginTop: '4px' }}>
                          {item.created_at ? new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recently'}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div style={{ padding: '16px', textAlign: 'center', color: '#9ca3af', fontSize: '0.85rem' }}>
                      No notifications found.
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
                          <div className="token-institution">{token.institution}</div>
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
                            <div className="metric-value wait-value">{token.bookingDate}</div>
                            <div className="metric-label">Date</div>
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
                    <button type="button" onClick={() => setIsEditingProfile(false)} className="cancel-edit-btn">Cancel</button>
                    <button type="submit" className="save-btn"><Save size={13}/> Save</button>
                  </div>
                ) : (
                  <button type="button" onClick={() => setIsEditingProfile(true)} className="edit-btn"><User size={13}/> Edit Details</button>
                )}
              </div>
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