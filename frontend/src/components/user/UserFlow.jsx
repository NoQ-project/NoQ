import React, { useState } from 'react';
import { 
  Home, 
  Ticket, 
  Radar, 
  History, 
  User,
  Building2, 
  HeartPulse, 
  CheckCircle2,
  Clock,
  Loader2
} from 'lucide-react';
import SearchInstitution from './SearchInstitution';

export default function UserFlow() {
  const [activeTab, setActiveTab] = useState('home');

  // Config mapping for dashboard navigation items
  const tabs = [
    { key: 'home', label: 'Home', icon: Home, bnav: 'Home' },
    { key: 'book', label: 'Book token', icon: Ticket, bnav: 'Book' },
    { key: 'track', label: 'Track queue', icon: Radar, bnav: 'Track' },
    { key: 'history', label: 'History', icon: History, bnav: 'History' },
    { key: 'profile', label: 'Profile', icon: User, bnav: 'Profile' }
  ];

  // ─── 1. HOME SCREEN PANEL ───
  const RenderHomeScreen = () => (
    <div className="space-y-5">
      <div className="bg-white border border-[#E9E7ED] rounded-2xl p-5 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-[13px] font-semibold text-[#1A1A1A]">Good morning, Ramesh</h2>
          <span className="flex items-center gap-1 text-[11px] bg-[#EAF3DE] text-[#3B6D11] px-2 py-0.5 rounded-full font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-[#639922] animate-pulse"></span>
            Live
          </span>
        </div>
        
        <div className="text-center py-2">
          <div className="text-[44px] font-medium text-[#534AB7] tracking-tight leading-none">B-042</div>
          <div className="text-[11px] text-[#6B6B6B] mt-2 font-medium">
            General Banking &middot; Counter 3 &middot; City Bank, Lazimpat
          </div>
        </div>

        <div className="grid grid-cols-3 text-center border-t border-[#E9E7ED] pt-3 mt-4 gap-2">
          <div>
            <div className="text-sm font-semibold text-[#1A1A1A]">3</div>
            <div className="text-[9px] text-[#6B6B6B] tracking-wide uppercase">Ahead</div>
          </div>
          <div>
            <div className="text-sm font-semibold text-[#3B6D11]">~12 min</div>
            <div className="text-[9px] text-[#6B6B6B] tracking-wide uppercase">Est. wait</div>
          </div>
          <div>
            <div className="text-sm font-semibold text-[#1A1A1A]">B-039</div>
            <div className="text-[9px] text-[#6B6B6B] tracking-wide uppercase">Serving</div>
          </div>
        </div>

        <div className="bg-[#F5F4F7] rounded-full h-1.5 mt-4 overflow-hidden">
          <div className="w-[68%] h-full bg-[#534AB7] rounded-full transition-all duration-500"></div>
        </div>
      </div>

      <div>
        <h3 className="text-xs font-semibold text-[#1A1A1A] mb-3">
          Quick book
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <div onClick={() => setActiveTab('book')} className="bg-white border border-[#E9E7ED] rounded-2xl p-4 shadow-sm cursor-pointer hover:border-[#534AB7] transition-all">
            <div className="w-8 h-8 rounded-lg bg-[#EEEDFE] flex items-center justify-center text-[#534AB7] mb-2">
              <Building2 size={16} />
            </div>
            <div className="text-xs font-semibold text-[#1A1A1A]">City Bank</div>
            <div className="text-[10px] text-[#6B6B6B] mt-0.5">~10 min</div>
          </div>
          <div onClick={() => setActiveTab('book')} className="bg-white border border-[#E9E7ED] rounded-2xl p-4 shadow-sm cursor-pointer hover:border-[#0F6E56] transition-all">
            <div className="w-8 h-8 rounded-lg bg-[#E1F5EE] flex items-center justify-center text-[#0F6E56] mb-2">
              <HeartPulse size={16} />
            </div>
            <div className="text-xs font-semibold text-[#1A1A1A]">City Hospital</div>
            <div className="text-[10px] text-[#6B6B6B] mt-0.5">~20 min</div>
          </div>
        </div>
      </div>
    </div>
  );

  // ─── 2. TRACK QUEUE SCREEN PANEL ───
  const RenderTrackScreen = () => {
    const trackingSteps = [
      { label: 'Token issued', status: 'done' },
      { label: 'Queue joined', status: 'done' },
      { label: 'Almost your turn', status: 'active' },
      { label: 'Called to counter', status: 'pending' }
    ];

    return (
      <div className="space-y-4">
        <div className="bg-white border border-[#E9E7ED] rounded-2xl p-5 text-center shadow-sm">
          <span className="text-[10px] text-[#6B6B6B] tracking-wide uppercase">Your Token</span>
          <div className="text-[44px] font-medium text-[#534AB7] tracking-tight mt-1 leading-none">B-042</div>
          <div className="bg-[#F5F4F7] rounded-full h-1.5 mt-4 overflow-hidden">
            <div className="w-[68%] h-full bg-[#534AB7] rounded-full"></div>
          </div>
        </div>

        <div className="bg-white border border-[#E9E7ED] rounded-2xl p-4 shadow-sm space-y-3.5">
          {trackingSteps.map((step, index) => (
            <div key={index} className="flex items-center gap-3">
              <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                step.status === 'done' ? 'bg-[#EAF3DE] text-[#3B6D11]' : 
                step.status === 'active' ? 'bg-[#EEEDFE] text-[#534AB7]' : 'bg-[#F5F4F7] text-[#6B6B6B]'
              }`}>
                {step.status === 'done' && <CheckCircle2 size={12} />}
                {step.status === 'active' && <Loader2 size={12} className="animate-spin" />}
                {step.status === 'pending' && <Clock size={12} />}
              </div>
              <div className={`text-[12px] ${
                step.status === 'pending' ? 'text-[#6B6B6B] font-normal' : 
                step.status === 'active' ? 'text-[#1A1A1A] font-semibold' : 'text-[#1A1A1A] font-medium'
              }`}>
                {step.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // ─── 3. HISTORY SCREEN PANEL ───
  const RenderHistoryScreen = () => {
    const historicalTokens = [
      { type: 'General Banking', meta: 'Lazimpat · Jun 25', variant: 'Active', badge: 'bg-[#EAF3DE] text-[#3B6D11]' },
      { type: 'General Banking', meta: 'New Road · Jun 20', variant: 'Done', badge: 'bg-[#EAF3DE] text-[#3B6D11]' },
      { type: 'Loans & Credit', meta: 'Lazimpat · Jun 15', variant: 'Done', badge: 'bg-[#EAF3DE] text-[#3B6D11]' },
      { type: 'Account Opening', meta: 'Baneshwor · Jun 10', variant: 'Missed', badge: 'bg-[#FAEEDA] text-[#854F0B]' }
    ];

    return (
      <div className="bg-white border border-[#E9E7ED] rounded-2xl p-1 shadow-sm">
        {historicalTokens.map((item, index) => (
          <div key={index} className={`flex justify-between items-center p-3.5 ${index !== historicalTokens.length - 1 ? 'border-b border-[#E9E7ED]' : ''}`}>
            <div>
              <div className="text-xs font-semibold text-[#1A1A1A]">{item.type}</div>
              <div className="text-[10px] text-[#6B6B6B] mt-0.5">{item.meta}</div>
            </div>
            <span className={`text-[9px] font-medium tracking-wide px-2 py-0.5 rounded-full ${item.badge}`}>
              {item.variant}
            </span>
          </div>
        ))}
      </div>
    );
  };

  // ─── 4. PROFILE SCREEN PANEL ───
  const RenderProfileScreen = () => (
    <div className="bg-white border border-[#E9E7ED] rounded-2xl p-5 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-[#EEEDFE] text-[#3C3489] flex items-center justify-center font-semibold text-sm border border-[#DEDCE4]">
          RP
        </div>
        <div>
          <div className="text-xs font-semibold text-[#1A1A1A]">Ramesh Pandit</div>
          <div className="text-[10px] text-[#6B6B6B] mt-0.5">+977 9845XXXXXX</div>
        </div>
      </div>
      <button className="w-full py-2 rounded-xl border border-[#DEDCE4] hover:bg-[#F6F3EC]/50 font-medium text-[11px] text-[#1A1A1A] transition-colors">
        Edit profile
      </button>
    </div>
  );

  return (
    /* Responsive Wrapper: Centers as a fixed mock smartphone context on desktops, scales perfectly fluid on natural mobile screens */
    <div className="w-full flex justify-center items-center py-4 bg-[#F6F3EC] min-h-screen sm:min-h-0">
      <div className="w-full max-w-md sm:w-[340px] bg-[#EFEEF3] sm:rounded-[24px] border border-[#D9DED3] overflow-hidden flex flex-col shadow-md select-none font-sans">
        
        {/* ─── BRAND HEADER ARCHITECTURE ─── */}
        <div className="bg-white border-b border-[#E9E7ED] px-4 py-2.5 flex justify-between items-center">
          <span className="font-semibold text-sm text-[#1A1A1A] tracking-tight">
            NoQ
          </span>
          <div className="w-6 h-6 rounded-full bg-[#EEEDFE] text-[#3C3489] text-[10px] font-semibold flex items-center justify-center">
            RP
          </div>
        </div>

        {/* ─── TOP APP TAB NAVIGATION ─── */}
        <div className="bg-white border-b border-[#E9E7ED] flex px-2 overflow-x-auto scrollbar-none justify-between sm:justify-start">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`py-2.5 px-2 text-[11px] font-medium transition-all border-b-2 whitespace-nowrap ${
                  isActive 
                    ? 'border-[#534AB7] text-[#534AB7]' 
                    : 'border-transparent text-[#6B6B6B] hover:text-[#1A1A1A]'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* ─── DEVICE PANEL CONTENT BODY ─── */}
        <div className="p-3.5 flex-1 min-h-[380px]">
          {activeTab === 'home' && <RenderHomeScreen />}
          {activeTab === 'book' && <SearchInstitution onSelectInstitution={() => setActiveTab('track')} />}
          {activeTab === 'track' && <RenderTrackScreen />}
          {activeTab === 'history' && <RenderHistoryScreen />}
          {activeTab === 'profile' && <RenderProfileScreen />}
        </div>

        {/* ─── SYSTEM BOTTOM TAB BAR ─── */}
        <div className="bg-white border-t border-[#E9E7ED] flex justify-around py-1.5">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`text-[10px] font-medium px-2 py-1 transition-colors ${
                  isActive ? 'text-[#534AB7]' : 'text-[#6B6B6B]'
                }`}
              >
                {tab.bnav}
              </button>
            );
          })}
        </div>

      </div>
    </div>
  );
}