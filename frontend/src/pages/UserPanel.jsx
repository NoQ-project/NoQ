import React, { useState } from 'react';
import { 
  Building2, 
  HeartPulse, 
  CheckCircle2, 
  Clock, 
  Loader2,
  Search,
  User,
  Shield,
  Save,
  Ticket,
  History as HistoryIcon,
  ArrowLeft,
  Home as HomeIcon
} from 'lucide-react';
import "../assets/css/UserPanel.css";

export default function UserPanel() {
  const [activeTab, setActiveTab] = useState('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  
  // --- MULTI-TOKEN ACTIVE ARRAY STATE ---
  const [activeTokens, setActiveTokens] = useState([
    {
      id: 'token-1',
      number: 'B-042',
      department: 'General Banking',
      counter: 'Counter 3',
      institution: 'City Bank, Lazimpat',
      ahead: 3,
      estWait: '~12 min',
      serving: 'B-039'
    }
  ]);

  // Selected organization for booking wizard sub-state
  const [selectedOrgForBooking, setSelectedOrgForBooking] = useState(null);
  const [selectedDept, setSelectedDept] = useState('');

  // Profile Mutation State
  const [profile, setProfile] = useState({
    name: 'Ramesh Pandit',
    phone: '+977 9845XXXXXX',
    email: 'ramesh.pandit@email.com',
    address: 'Kathmandu, Nepal',
  });
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [tempProfile, setTempProfile] = useState({ ...profile });

  const categories = ['All', 'Banking', 'Healthcare', 'Government'];

  const organizations = [
    { id: 1, name: 'City Bank', category: 'Banking', branch: 'Lazimpat', departments: ['General Banking', 'Loans & Credit', 'Account Opening'], queues: 3, waiting: 13, icon: Building2, iconClass: 'icon-indigo' },
    { id: 2, name: 'City Hospital', category: 'Healthcare', branch: 'Baneshwor', departments: ['OPD Checkup', 'Lab Reports', 'Pharmacy'], queues: 2, waiting: 8, icon: HeartPulse, iconClass: 'icon-emerald' },
    { id: 3, name: 'Dept. of Passports', category: 'Government', branch: 'Tripureshwor', departments: ['Biometrics', 'Passport Collection'], queues: 1, waiting: 3, icon: Building2, iconClass: 'icon-gray' },
  ];

  const trackingSteps = [
    { label: 'Token issued successfully', status: 'done' },
    { label: 'Queue joined position updated', status: 'done' },
    { label: 'Almost your turn at the window', status: 'active' },
    { label: 'Called to counter deck room', status: 'pending' }
  ];

  const [historicalTokens, setHistoricalTokens] = useState([
    { id: 'h-1', type: 'General Banking', meta: 'Lazimpat · Jun 25', variant: 'Active', badgeClass: 'badge-active' },
    { id: 'h-2', type: 'General Banking', meta: 'New Road · Jun 20', variant: 'Done', badgeClass: 'badge-active' },
    { id: 'h-3', type: 'Loans & Credit', meta: 'Lazimpat · Jun 15', variant: 'Done', badgeClass: 'badge-active' }
  ]);

  const filteredOrgs = organizations.filter((org) => {
    const matchesCategory = activeCategory === 'All' || org.category === activeCategory;
    const matchesSearch = org.name.toLowerCase().includes(searchQuery.toLowerCase()) || org.branch.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // --- CORE INTERACTIVE MULTI-BOOKING ACTIONS ---
  const handleSelectOrg = (org) => {
    setSelectedOrgForBooking(org);
    setSelectedDept(org.departments[0]);
  };

  const handleExecuteBooking = (e) => {
    e.preventDefault();
    if (!selectedOrgForBooking) return;

    const randomNum = Math.floor(Math.random() * 90) + 10;
    const prefix = selectedOrgForBooking.name.toLowerCase().includes('bank') ? 'B' : 'H';
    const tokenNumber = `${prefix}-${randomNum}`;
    const generatedId = `token-${Date.now()}`;
    
    const newGeneratedToken = {
      id: generatedId,
      number: tokenNumber,
      department: selectedDept,
      counter: `Counter ${Math.floor(Math.random() * 3) + 1}`,
      institution: `${selectedOrgForBooking.name}, ${selectedOrgForBooking.branch}`,
      ahead: selectedOrgForBooking.waiting + 1,
      estWait: `~${(selectedOrgForBooking.waiting + 1) * 4} min`,
      serving: `${prefix}-${Math.max(1, randomNum - 3)}`
    };

    setActiveTokens([...activeTokens, newGeneratedToken]);
    
    setHistoricalTokens([
      { id: `h-${Date.now()}`, type: selectedDept, meta: `${selectedOrgForBooking.branch} · Today`, variant: 'Active', badgeClass: 'badge-indigo' },
      ...historicalTokens
    ]);

    setSelectedOrgForBooking(null);
    setSearchQuery('');
    setActiveTab('track');
  };

  const handleCancelToken = (id) => {
    if (window.confirm('Are you sure you want to drop out of this live queue line?')) {
      setActiveTokens(activeTokens.filter(token => token.id !== id));
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
      
      {/* ─── GLOBAL HEADER (VISIBLE ON BOTH MOBILE & DESKTOP) ─── */}
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

        <div onClick={startEditing} className="user-profile-badge cursor-pointer">
          <div className="user-info sm:block">
            <div className="user-name">{profile.name}</div>
            <div className="user-phone">{profile.phone}</div>
          </div>
          <div className="user-avatar">
            {profile.name.split(' ').map(n => n[0]).join('')}
          </div>
        </div>
      </header>

      {/* ─── SCREEN WORKSPACE CONTENT ROUTER ─── */}
      <main className="main-content">
        
        {/* ─── HOME TAB VIEW ─── */}
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
                          <div className="token-dept">{token.department} &bull; {token.counter}</div>
                        </div>

                        <div className="token-metrics-grid">
                          <div>
                            <div className="metric-value">{token.ahead}</div>
                            <div className="metric-label">Ahead</div>
                          </div>
                          <div>
                            <div className="metric-value wait-value">{token.estWait}</div>
                            <div className="metric-label">Wait</div>
                          </div>
                          <div>
                            <div className="metric-value">{token.serving}</div>
                            <div className="metric-label">Serving</div>
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

        {/* ─── BOOK TOKEN TAB VIEW ─── */}
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
                      const Icon = org.icon;
                      return (
                        <div key={org.id} onClick={() => handleSelectOrg(org)} className="org-item group cursor-pointer">
                          <div className="org-info">
                            <div className={`org-icon-wrapper ${org.iconClass}`}>
                              <Icon size={16} />
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
                <button onClick={() => setSelectedOrgForBooking(null)} className="back-btn">
                  <ArrowLeft size={14}/> Back to list
                </button>
                
                <div className="selected-org-summary">
                  <div className={`org-icon-wrapper ${selectedOrgForBooking.iconClass}`}>
                    <selectedOrgForBooking.icon size={20} />
                  </div>
                  <div>
                    <h4 className="summary-title">{selectedOrgForBooking.name}</h4>
                    <p className="summary-subtitle">{selectedOrgForBooking.branch} Branch &middot; {selectedOrgForBooking.waiting} waiting</p>
                  </div>
                </div>

                <form onSubmit={handleExecuteBooking} className="booking-form">
                  <div>
                    <label className="form-label">Select Service Department</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 dept-grid">
                      {selectedOrgForBooking.departments.map((dept) => (
                        <div 
                          key={dept}
                          onClick={() => setSelectedDept(dept)}
                          className={`dept-option ${selectedDept === dept ? 'selected' : ''}`}
                        >
                          {dept}
                        </div>
                      ))}
                    </div>
                  </div>

                  <button type="submit" className="confirm-btn">
                    Confirm & Book Token Now
                  </button>
                </form>
              </div>
            )}
          </div>
        )}

        {/* ─── TRACK TAB VIEW ─── */}
        {activeTab === 'track' && (
          <div className="track-container card-container">
            <h3 className="track-header">Live Monitor Timelines</h3>
            
            {activeTokens.length > 0 ? (
              <div className="track-list">
                {activeTokens.map((token) => (
                  <div key={token.id} className="track-card">
                    <div className="track-card-header">
                      <div className="track-info">
                        <div className="track-number">{token.number}</div>
                        <p className="track-institution">{token.institution}</p>
                        <p className="track-dept">{token.department} &bull; {token.counter}</p>
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
                            {step.label} {step.status === 'active' && `(${token.estWait} left)`}
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

        {/* ─── HISTORY TAB VIEW ─── */}
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

        {/* ─── PROFILE TAB VIEW ─── */}
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

      {/* ─── MOBILE BOTTOM STICKY NAVIGATION ANCHOR BAR ─── */}
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