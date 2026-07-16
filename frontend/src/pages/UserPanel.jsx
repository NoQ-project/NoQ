import React, { useState } from 'react';
import { 
  Building2, 
  HeartPulse, 
  CheckCircle2, 
  Clock, 
  Loader2,
  Search,
  ChevronRight,
  User,
  Shield,
  Save,
  Ticket,
  History as HistoryIcon,
  ArrowLeft,
  Home as HomeIcon
} from 'lucide-react';

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
    { id: 1, name: 'City Bank', category: 'Banking', branch: 'Lazimpat', departments: ['General Banking', 'Loans & Credit', 'Account Opening'], queues: 3, waiting: 13, icon: Building2, iconBg: 'bg-[#EEEDFE] text-[#534AB7]' },
    { id: 2, name: 'City Hospital', category: 'Healthcare', branch: 'Baneshwor', departments: ['OPD Checkup', 'Lab Reports', 'Pharmacy'], queues: 2, waiting: 8, icon: HeartPulse, iconBg: 'bg-[#E1F5EE] text-[#0F6E56]' },
    { id: 3, name: 'Dept. of Passports', category: 'Government', branch: 'Tripureshwor', departments: ['Biometrics', 'Passport Collection'], queues: 1, waiting: 3, icon: Building2, iconBg: 'bg-[#F5F4F7] text-[#6B6B6B]' },
  ];

  const trackingSteps = [
    { label: 'Token issued successfully', status: 'done' },
    { label: 'Queue joined position updated', status: 'done' },
    { label: 'Almost your turn at the window', status: 'active' },
    { label: 'Called to counter deck room', status: 'pending' }
  ];

  const [historicalTokens, setHistoricalTokens] = useState([
    { id: 'h-1', type: 'General Banking', meta: 'Lazimpat · Jun 25', variant: 'Active', badge: 'bg-[#EAF3DE] text-[#3B6D11]' },
    { id: 'h-2', type: 'General Banking', meta: 'New Road · Jun 20', variant: 'Done', badge: 'bg-[#EAF3DE] text-[#3B6D11]' },
    { id: 'h-3', type: 'Loans & Credit', meta: 'Lazimpat · Jun 15', variant: 'Done', badge: 'bg-[#EAF3DE] text-[#3B6D11]' }
  ]);

  const filteredOrgs = organizations.filter((org) => {
    const matchesCategory = activeCategory === 'All' || org.category === activeCategory;
    const matchesSearch = org.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          org.branch.toLowerCase().includes(searchQuery.toLowerCase());
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
      { id: `h-${Date.now()}`, type: selectedDept, meta: `${selectedOrgForBooking.branch} · Today`, variant: 'Active', badge: 'bg-[#EEEDFE] text-[#534AB7]' },
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
    
    <div className="min-h-screen min-h-[100dvh] bg-[#F6F3EC] font-sans antialiased text-[#1A1A1A] flex flex-col justify-between md:justify-start">
      
      {/* ─── GLOBAL HEADER (VISIBLE ON BOTH MOBILE & DESKTOP) ─── */}
      <header className="bg-white border-b border-[#E9E7ED] px-4 md:px-8 py-3 md:py-4 flex justify-between items-center sticky top-0 z-50 shadow-sm flex-shrink-0">
        <div className="flex items-center gap-8">
          <span className="font-bold text-lg md:text-xl text-[#1A1A1A] tracking-tight cursor-pointer" onClick={() => { setActiveTab('home'); setSelectedOrgForBooking(null); }}>NoQ</span>
          
          <nav className="hidden md:flex gap-1">
            {['home', 'book', 'track', 'history', 'profile'].map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  if (tab !== 'profile') setIsEditingProfile(false);
                  if (tab !== 'book') setSelectedOrgForBooking(null);
                }}
                className={`px-4 py-2 text-xs font-semibold capitalize rounded-lg transition-all ${
                  activeTab === tab ? 'bg-[#EEEDFE] text-[#534AB7]' : 'text-[#6B6B6B] hover:text-[#1A1A1A]'
                }`}
              >
                {tab === 'book' ? 'Book Token' : tab === 'track' ? 'Track Queue' : tab}
              </button>
            ))}
          </nav>
        </div>

        <div onClick={startEditing} className="flex items-center gap-2 md:gap-3 cursor-pointer hover:bg-[#F5F4F7] p-1 md:p-1.5 rounded-xl transition-all">
          <div className="text-right hidden sm:block">
            <div className="text-xs font-semibold">{profile.name}</div>
            <div className="text-[10px] text-[#6B6B6B]">{profile.phone}</div>
          </div>
          <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-[#EEEDFE] text-[#3C3489] font-semibold text-xs md:text-sm flex items-center justify-center border border-[#DEDCE4]">
            {profile.name.split(' ').map(n => n[0]).join('')}
          </div>
        </div>
      </header>

      {/* ─── SCREEN WORKSPACE CONTENT ROUTER ─── */}
      <main className="flex-grow max-w-[1440px] w-full mx-auto p-4 md:p-6 lg:p-8 pb-24 md:pb-8">
        
        {/* ─── HOME TAB VIEW ─── */}
        {activeTab === 'home' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            
            {/* Active Bookings (Left Block) - Expanded with full-height stretch */}
            <div className="lg:col-span-7 space-y-4 flex flex-col justify-start">
              <div className="flex justify-between items-center px-1">
                <h2 className="text-sm font-bold text-[#1A1A1A]">Welcome back, {profile.name.split(' ')[0]}</h2>
                <span className="text-[11px] font-semibold text-[#6B6B6B]">
                  {activeTokens.length} Active {activeTokens.length === 1 ? 'Booking' : 'Bookings'}
                </span>
              </div>

              {activeTokens.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-1 gap-4 flex-grow">
                  {activeTokens.map((token) => (
                    <div key={token.id} className="bg-white border border-[#E9E7ED] rounded-2xl p-6 md:p-8 shadow-sm hover:border-[#534AB7]/20 transition-all flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-center mb-4">
                          <div className="text-sm font-bold text-[#1A1A1A] truncate max-w-[70%]">{token.institution}</div>
                          <span className="flex items-center gap-1.5 text-[10px] bg-[#EAF3DE] text-[#3B6D11] px-2.5 py-1 rounded-full font-bold">
                            Live
                          </span>
                        </div>
                        
                        <div className="flex items-baseline gap-3 my-4">
                          <div className="text-4xl md:text-5xl font-bold text-[#534AB7] tracking-tight">{token.number}</div>
                          <div className="text-xs text-[#6B6B6B] truncate">{token.department} &bull; {token.counter}</div>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 text-center border-t border-[#F5F4F0] pt-4 mt-4 gap-2 bg-[#F5F4F7]/60 rounded-xl p-3">
                        <div>
                          <div className="text-sm font-bold">{token.ahead}</div>
                          <div className="text-[10px] text-[#6B6B6B] uppercase font-semibold">Ahead</div>
                        </div>
                        <div>
                          <div className="text-sm font-bold text-[#3B6D11]">{token.estWait}</div>
                          <div className="text-[10px] text-[#6B6B6B] uppercase font-semibold">Wait</div>
                        </div>
                        <div>
                          <div className="text-sm font-bold">{token.serving}</div>
                          <div className="text-[10px] text-[#6B6B6B] uppercase font-semibold">Serving</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white border border-[#E9E7ED] rounded-2xl p-8 text-center text-xs text-[#6B6B6B] py-24 flex-grow flex items-center justify-center">
                  No active tokens running right now. Select "Book Token" to join a line.
                </div>
              )}
            </div>

            {/* Quick Actions Card (Right Block) - Made much taller to eliminate white gaps */}
            <div className="lg:col-span-5 bg-white border border-[#E9E7ED] rounded-2xl p-8 shadow-sm flex flex-col justify-between min-h-[320px] lg:min-h-[400px]">
              <div className="space-y-3">
                <h3 className="text-base font-bold text-[#1A1A1A]">Skipping lines made simple</h3>
                <p className="text-xs text-[#6B6B6B] leading-relaxed">
                  You can book multiple tokens simultaneously across separate remote branches or counters from this screen. Save your time and monitor everything in real-time.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-8">
                <div onClick={() => setActiveTab('book')} className="bg-[#F5F4F7] rounded-2xl p-5 cursor-pointer hover:bg-[#EEEDFE] hover:text-[#534AB7] transition-all group flex flex-col justify-between h-32">
                  <Building2 size={24} className="text-[#6B6B6B] group-hover:text-[#534AB7]" />
                  <div className="text-xs font-bold mt-auto">New Booking</div>
                </div>
                <div onClick={() => setActiveTab('track')} className="bg-[#F5F4F7] rounded-2xl p-5 cursor-pointer hover:bg-[#E1F5EE] hover:text-[#0F6E56] transition-all group flex flex-col justify-between h-32">
                  <Ticket size={24} className="text-[#6B6B6B] group-hover:text-[#0F6E56]" />
                  <div className="text-xs font-bold mt-auto">Monitor Lines</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─── BOOK TOKEN TAB VIEW ─── */}
        {activeTab === 'book' && (
          <div className="bg-white border border-[#E9E7ED] rounded-2xl p-6 md:p-8 shadow-sm max-w-3xl mx-auto space-y-6">
            {!selectedOrgForBooking ? (
              <>
                <div>
                  <h3 className="text-base font-bold text-[#1A1A1A]">Search Institutions</h3>
                  <p className="text-xs text-[#6B6B6B] mt-1">Find active service lines and check real-time availability.</p>
                </div>

                <div className="relative w-full">
                  <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-[#6B6B6B]">
                    <Search size={16} />
                  </div>
                  <input
                    type="text"
                    placeholder="Search bank, hospital, branch location..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-[#F5F4F7] rounded-xl text-xs text-[#1A1A1A] border border-transparent outline-none focus:bg-white focus:border-[#534AB7]/30 transition-all"
                  />
                </div>

                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => setActiveCategory(category)}
                      className={`text-xs px-4 py-2 rounded-full border transition-colors whitespace-nowrap font-medium ${
                        activeCategory === category ? 'bg-[#EEEDFE] text-[#3C3489] border-[#534AB7]/20 font-semibold' : 'bg-[#F5F4F7] text-[#6B6B6B] border-transparent'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>

                <div className="border border-[#E9E7ED] rounded-xl overflow-hidden divide-y divide-[#E9E7ED]">
                  {filteredOrgs.length > 0 ? (
                    filteredOrgs.map((org) => {
                      const Icon = org.icon;
                      return (
                        <div key={org.id} onClick={() => handleSelectOrg(org)} className="flex items-center justify-between p-5 bg-white hover:bg-[#F5F4F7]/40 transition-colors cursor-pointer group">
                          <div className="flex items-center gap-4 min-w-0">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${org.iconBg}`}><Icon size={18} /></div>
                            <div className="min-w-0">
                              <h4 className="text-xs font-bold text-[#1A1A1A] truncate group-hover:text-[#534AB7]">{org.name} ({org.branch})</h4>
                              <p className="text-[11px] text-[#6B6B6B] mt-1 truncate">{org.category} &middot; <span className="text-[#3B6D11] font-semibold">{org.waiting} waiting</span></p>
                            </div>
                          </div>
                          <button className="text-xs font-bold text-[#534AB7] bg-[#EEEDFE] px-3.5 py-1.5 rounded-lg flex-shrink-0">
                            Select
                          </button>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-12 text-xs text-[#6B6B6B]">No institutions match your search parameters.</div>
                  )}
                </div>
              </>
            ) : (
              <div className="space-y-6">
                <button onClick={() => setSelectedOrgForBooking(null)} className="flex items-center gap-1.5 text-xs font-semibold text-[#6B6B6B] hover:text-[#1A1A1A] mb-2 transition-colors">
                  <ArrowLeft size={14}/> Back to list
                </button>
                
                <div className="p-5 bg-[#F5F4F7] rounded-xl flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${selectedOrgForBooking.iconBg}`}>
                    <selectedOrgForBooking.icon size={24} />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-[#1A1A1A]">{selectedOrgForBooking.name}</h4>
                    <p className="text-xs text-[#6B6B6B]">{selectedOrgForBooking.branch} Branch &middot; <span className="text-[#3B6D11] font-medium">{selectedOrgForBooking.waiting} waiting</span></p>
                  </div>
                </div>

                <form onSubmit={handleExecuteBooking} className="space-y-6 pt-2">
                  <div>
                    <label className="block text-xs font-bold text-[#6B6B6B] uppercase mb-3">Select Service Department</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {selectedOrgForBooking.departments.map((dept) => (
                        <div 
                          key={dept}
                          onClick={() => setSelectedDept(dept)}
                          className={`p-4 rounded-xl border-2 text-xs font-bold cursor-pointer transition-all ${
                            selectedDept === dept ? 'bg-[#EEEDFE] border-[#534AB7] text-[#534AB7]' : 'bg-white border-[#E9E7ED] text-[#6B6B6B]'
                          }`}
                        >
                          {dept}
                        </div>
                      ))}
                    </div>
                  </div>

                  <button type="submit" className="w-full mt-6 bg-[#534AB7] hover:bg-[#3C3489] text-white py-4 rounded-xl text-xs font-bold transition-all uppercase tracking-wider shadow-sm">
                    Confirm & Book Token Now
                  </button>
                </form>
              </div>
            )}
          </div>
        )}

        {/* ─── TRACK TAB VIEW ─── */}
        {activeTab === 'track' && (
          <div className="max-w-2xl mx-auto space-y-6">
            <h3 className="text-xs font-bold text-[#1A1A1A] uppercase tracking-wider text-center px-1">Live Monitor Timelines</h3>
            
            {activeTokens.length > 0 ? (
              <div className="space-y-6">
                {activeTokens.map((token) => (
                  <div key={token.id} className="bg-white border border-[#E9E7ED] rounded-2xl p-6 md:p-8 shadow-sm space-y-6">
                    <div className="pb-4 border-b border-[#F5F4F0] flex justify-between items-start">
                      <div className="text-left">
                        <div className="text-3xl font-bold text-[#534AB7]">{token.number}</div>
                        <p className="text-sm font-bold text-[#1A1A1A] mt-1">{token.institution}</p>
                        <p className="text-xs text-[#6B6B6B] mt-0.5">{token.department} &bull; {token.counter}</p>
                      </div>
                      <button 
                        onClick={() => handleCancelToken(token.id)}
                        className="text-xs font-bold text-[#C93B2B] bg-[#FAEEDA] px-3.5 py-1.5 rounded-lg hover:bg-[#f5e3cc] transition-colors"
                      >
                        Cancel Ticket
                      </button>
                    </div>
                    
                    <div className="space-y-6 relative before:absolute before:bottom-3 before:top-3 before:left-4 before:w-0.5 before:bg-[#E9E7ED]">
                      {trackingSteps.map((step, index) => (
                        <div key={index} className="flex items-center gap-4 relative z-10">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                            step.status === 'done' ? 'bg-[#EAF3DE] text-[#3B6D11]' : step.status === 'active' ? 'bg-[#EEEDFE] text-[#534AB7]' : 'bg-white border border-[#DEDCE4] text-[#6B6B6B]'
                          }`}>
                            {step.status === 'done' && <CheckCircle2 size={16} />}
                            {step.status === 'active' && <Loader2 size={16} className="animate-spin" />}
                            {step.status === 'pending' && <Clock size={16} />}
                          </div>
                          <div className={`text-xs md:text-sm ${step.status === 'active' ? 'text-[#534AB7] font-bold' : 'text-[#1A1A1A] font-medium'}`}>
                            {step.label} {step.status === 'active' && `(${token.estWait} left)`}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white border border-[#E9E7ED] rounded-2xl p-16 text-center text-xs text-[#6B6B6B]">
                No active operational queues to monitor.
              </div>
            )}
          </div>
        )}

        {/* ─── HISTORY TAB VIEW ─── */}
        {activeTab === 'history' && (
          <div className="bg-white border border-[#E9E7ED] rounded-2xl p-6 md:p-8 shadow-sm max-w-3xl mx-auto space-y-5">
            <h3 className="text-sm font-bold text-[#1A1A1A] uppercase tracking-wider flex items-center gap-1.5"><HistoryIcon size={16}/> Past Visitations Log</h3>
            <div className="border border-[#E9E7ED] rounded-xl overflow-hidden divide-y divide-[#E9E7ED]">
              {historicalTokens.map((item) => (
                <div key={item.id} className="flex justify-between items-center p-5 bg-white hover:bg-[#F5F4F7]/20 transition-colors">
                  <div>
                    <div className="text-xs font-bold text-[#1A1A1A]">{item.type}</div>
                    <div className="text-[11px] text-[#6B6B6B] mt-1">{item.meta}</div>
                  </div>
                  <span className={`text-[9px] font-bold tracking-wider px-3 py-1 rounded-full uppercase ${item.badge}`}>
                    {item.variant}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ─── PROFILE TAB VIEW ─── */}
        {activeTab === 'profile' && (
          <div className="bg-white border border-[#E9E7ED] rounded-2xl p-6 md:p-8 shadow-sm max-w-2xl mx-auto">
            <div className="flex items-center gap-4 pb-6 border-b border-[#F5F4F0] mb-6">
              <div className="w-16 h-16 rounded-full bg-[#534AB7] text-white font-bold text-2xl flex items-center justify-center shadow-md">
                {profile.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#1A1A1A]">{profile.name}</h3>
                <p className="text-xs text-[#6B6B6B]">Client ID Account: #NQ-98452-CP</p>
              </div>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-[#6B6B6B] uppercase mb-1.5">Full Identity Name</label>
                <input 
                  type="text" 
                  value={tempProfile.name}
                  onChange={(e) => setTempProfile({ ...tempProfile, name: e.target.value })}
                  disabled={!isEditingProfile}
                  className="w-full text-xs px-4 py-3 bg-[#F5F4F7] border border-transparent rounded-xl outline-none focus:bg-white focus:border-[#534AB7]/30 disabled:opacity-75 font-medium text-[#1A1A1A]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#6B6B6B] uppercase mb-1.5">Phone Number</label>
                  <input 
                    type="text" 
                    value={tempProfile.phone}
                    onChange={(e) => setTempProfile({ ...tempProfile, phone: e.target.value })}
                    disabled={!isEditingProfile}
                    className="w-full text-xs px-4 py-3 bg-[#F5F4F7] border border-transparent rounded-xl outline-none focus:bg-white focus:border-[#534AB7]/30 disabled:opacity-75 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#6B6B6B] uppercase mb-1.5">Email Address</label>
                  <input 
                    type="email" 
                    value={tempProfile.email}
                    onChange={(e) => setTempProfile({ ...tempProfile, email: e.target.value })}
                    disabled={!isEditingProfile}
                    className="w-full text-xs px-4 py-3 bg-[#F5F4F7] border border-transparent rounded-xl outline-none focus:bg-white focus:border-[#534AB7]/30 disabled:opacity-75 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#6B6B6B] uppercase mb-1.5">Residential Address</label>
                <input 
                  type="text" 
                  value={tempProfile.address}
                  onChange={(e) => setTempProfile({ ...tempProfile, address: e.target.value })}
                  disabled={!isEditingProfile}
                  className="w-full text-xs px-4 py-3 bg-[#F5F4F7] border border-transparent rounded-xl outline-none focus:bg-white focus:border-[#534AB7]/30 disabled:opacity-75 font-medium"
                />
              </div>

              <div className="pt-6 flex items-center justify-between border-t border-[#F5F4F0]">
                <div className="flex items-center gap-2 text-xs text-[#6B6B6B] font-medium">
                  <Shield size={14} className="text-[#3B6D11]" /> Verified Profile
                </div>

                {isEditingProfile ? (
                  <div className="flex gap-2">
                    <button type="button" onClick={() => setIsEditingProfile(false)} className="px-4 py-2 border border-[#E9E7ED] hover:bg-[#F5F4F7] font-semibold text-xs rounded-xl transition-colors">Cancel</button>
                    <button type="submit" className="px-4 py-2 bg-[#534AB7] hover:bg-[#3C3489] text-white font-semibold text-xs rounded-xl flex items-center gap-1.5 shadow-sm"><Save size={13}/> Save</button>
                  </div>
                ) : (
                  <button type="button" onClick={() => setIsEditingProfile(true)} className="px-4 py-2 bg-[#534AB7] hover:bg-[#3C3489] text-white font-semibold text-xs rounded-xl flex items-center gap-1.5 shadow-sm"><User size={13}/> Edit Details</button>
                )}
              </div>
            </form>
          </div>
        )}

      </main>

      {/* ─── MOBILE BOTTOM STICKY NAVIGATION ANCHOR BAR (ONLY VISIBLE UNDER 768PX) ─── */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[#E9E7ED] z-50 shadow-[0_-4px_12px_rgba(0,0,0,0.04)] px-2 py-2 flex justify-around items-center">
        {['home', 'book', 'track', 'history', 'profile'].map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab);
              if (tab !== 'profile') setIsEditingProfile(false);
              if (tab !== 'book') setSelectedOrgForBooking(null);
            }}
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all min-w-[60px] ${
              activeTab === tab ? 'text-[#534AB7] font-bold bg-[#EEEDFE]/60' : 'text-[#6B6B6B]'
            }`}
          >
            {getTabIcon(tab)}
            <span className="text-[9px] capitalize tracking-wide">
              {tab === 'book' ? 'Book' : tab === 'track' ? 'Track' : tab}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}