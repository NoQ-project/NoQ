import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Building2, 
  Plus, 
  Power, 
  Trash2, 
  User, 
  ChevronRight, 
  Radio,
  RefreshCw,
  X,
  Save,
  Shield,
  CheckCircle2,
  Loader2,
  Bell,
  CheckCheck,
  Trash,
  Info,
  AlertTriangle,
  UserCheck,
  ListPlus,
  ListX,
  ToggleLeft,
  SlidersHorizontal,
  PhoneCall,
  Clock
} from 'lucide-react';

import institutionsService from '../services/institutionServices';
import queueServices from '../services/queueServices';
import tokenServices from '../services/tokenServices';

export default function OrgPanel() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'profile' | 'notifications'

  // ─── WORKING HOURS STATE ───
  const [isWorkingHoursModalOpen, setIsWorkingHoursModalOpen] = useState(false);
  const [selectedQueueForHours, setSelectedQueueForHours] = useState(null);
  const [workingHours, setWorkingHours] = useState([]);
  const [workingHoursSaving, setWorkingHoursSaving] = useState(false);

  // ─── WORKING HOURS LOGIC ───
  const openWorkingHoursModal = async (queue) => {
    setSelectedQueueForHours(queue);
    setIsWorkingHoursModalOpen(true);
    setWorkingHoursSaving(false);
    try {
      const hours = await queueServices.getWorkingHours(queue.id);
      
      // Initialize 7 days if empty
      const defaultHours = Array.from({ length: 7 }, (_, i) => {
        const existing = hours.find(h => h.day_of_week === i);
        return existing || {
          day_of_week: i,
          opening_time: '09:00:00',
          closing_time: '17:00:00',
          isActive: !!existing // UI only property to toggle day
        };
      });
      setWorkingHours(defaultHours);
    } catch (err) {
      console.error('Failed to load working hours', err);
      addNotification('error', 'Error', `Failed to load working hours for ${queue.name}.`, 'AlertTriangle');
    }
  };

  const handleWorkingHoursChange = (dayIndex, field, value) => {
    setWorkingHours(prev => prev.map((h, i) => i === dayIndex ? { ...h, [field]: value } : h));
  };

  const saveWorkingHours = async () => {
    setWorkingHoursSaving(true);
    try {
      const activeHours = workingHours.filter(h => h.isActive).map(h => ({
        day_of_week: h.day_of_week,
        opening_time: h.opening_time.length === 5 ? h.opening_time + ':00' : h.opening_time,
        closing_time: h.closing_time.length === 5 ? h.closing_time + ':00' : h.closing_time
      }));
      
      await queueServices.updateWorkingHours(selectedQueueForHours.id, { hours: activeHours });
      addNotification('success', 'Working Hours Saved', `Working hours updated for ${selectedQueueForHours.name}.`, 'ListPlus');
      setIsWorkingHoursModalOpen(false);
    } catch (err) {
      console.error('Failed to save working hours', err);
      addNotification('error', 'Save Failed', 'Could not save working hours.', 'AlertTriangle');
    } finally {
      setWorkingHoursSaving(false);
    }
  };

  // ─── DATA FETCHING ───
  const [notifications, setNotifications] = useState([]);
  const notifIdRef = useRef(0);

  const addNotification = useCallback((type, title, message, icon) => {
    const id = ++notifIdRef.current;
    setNotifications(prev => [
      {
        id,
        type,       // 'success' | 'info' | 'warning' | 'error'
        title,
        message,
        icon,
        timestamp: new Date(),
        read: false,
      },
      ...prev
    ]);
  }, []);

  const markAllRead = () =>
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));

  const clearAll = () => setNotifications([]);

  const dismissNotification = (id) =>
    setNotifications(prev => prev.filter(n => n.id !== id));

  const unreadCount = notifications.filter(n => !n.read).length;

  // Institution & Dashboard metadata
  const [dashboardData, setDashboardData] = useState(null);

  // Profile state
  const [profile, setProfile] = useState({ name: '', description: '', address: '', phone: '', email: '', website: '' });
  const [tempProfile, setTempProfile] = useState({ ...profile });
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileSaveStatus, setProfileSaveStatus] = useState(null); // null|'saving'|'success'|'error'
  const [profileSaveError, setProfileSaveError] = useState('');

  // Queues list
  const [queues, setQueues] = useState([]);
  const [activeQueueId, setActiveQueueId] = useState(null);

  // Live Token Tracking per Queue
  const [currentToken, setCurrentToken] = useState(null);
  const [waitingTokens, setWaitingTokens] = useState([]);

  // Modal state for creating new queue (replaces window.prompt)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newQueueForm, setNewQueueForm] = useState({
    name: '',
    daily_limit: 50,
    avg_service_time: 10
  });

  // Fetch top-level institution dashboard and queue list
  const fetchDashboardAndQueues = useCallback(async () => {
    try {
      setError(null);
      
      const dash = await institutionsService.getDashboard();
      setDashboardData(dash);

      const queueList = await institutionsService.fetchQueues();
      setQueues(queueList);

      if (queueList.length > 0 && !activeQueueId) {
        setActiveQueueId(queueList[0].id);
      }
    } catch (err) {
      setError(err.message || 'Failed to load organization data.');
    } finally {
      setLoading(false);
    }
  }, [activeQueueId]);

  // Fetch own institution profile
  const fetchMyProfile = useCallback(async () => {
    try {
      const data = await institutionsService.getMyProfile();
      const p = {
        name: data.name || '',
        description: data.description || '',
        address: data.address || '',
        phone: data.phone || '',
        email: data.email || '',
        website: data.website || '',
      };
      setProfile(p);
      setTempProfile(p);
    } catch (err) {
      console.error('Failed to fetch institution profile:', err);
    }
  }, []);

  // Handle profile save
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setProfileSaveStatus('saving');
    setProfileSaveError('');
    try {
      const updated = await institutionsService.updateMyProfile({
        name: tempProfile.name || undefined,
        description: tempProfile.description || undefined,
        address: tempProfile.address || undefined,
        phone: tempProfile.phone || undefined,
        website: tempProfile.website || undefined,
      });
      const p = {
        name: updated.name || '',
        description: updated.description || '',
        address: updated.address || '',
        phone: updated.phone || '',
        email: updated.email || profile.email,
        website: updated.website || '',
      };
      setProfile(p);
      setTempProfile(p);
      setIsEditingProfile(false);
      setProfileSaveStatus('success');
      // Also refresh header name
      setDashboardData(prev => prev ? { ...prev, institution_name: updated.name } : prev);
      setTimeout(() => setProfileSaveStatus(null), 3000);
      addNotification(
        'success',
        'Profile Updated',
        `Organization profile for "${updated.name || tempProfile.name}" was updated successfully.`,
        'UserCheck'
      );
    } catch (err) {
      setProfileSaveStatus('error');
      setProfileSaveError(err.message || 'Failed to save profile.');
      addNotification('error', 'Profile Update Failed', err.message || 'Failed to save organization profile.', 'AlertTriangle');
    }
  };

  // Fetch current token and waiting list for active queue tab
  const fetchActiveQueueTokenData = useCallback(async (queueId) => {
    if (!queueId) return;
    try {
      const [curr, waiting] = await Promise.all([
        tokenServices.getCurrentToken(queueId).catch(() => null),
        tokenServices.getWaitingTokens(queueId).catch(() => [])
      ]);
      setCurrentToken(curr);
      setWaitingTokens(Array.isArray(waiting) ? waiting : []);
    } catch (err) {
      console.error('Error fetching token data:', err);
    }
  }, []);

  useEffect(() => {
    fetchDashboardAndQueues();
    fetchMyProfile();
  }, [fetchDashboardAndQueues, fetchMyProfile]);

  useEffect(() => {
    if (activeQueueId) {
      fetchActiveQueueTokenData(activeQueueId);
    }
  }, [activeQueueId, fetchActiveQueueTokenData]);

  // Auto-refresh live token data every 12 seconds when on dashboard
  useEffect(() => {
    if (!activeQueueId) return;
    const interval = setInterval(() => {
      fetchActiveQueueTokenData(activeQueueId);
    }, 12000);
    return () => clearInterval(interval);
  }, [activeQueueId, fetchActiveQueueTokenData]);

  // 1. Quota input modifications
  const handleQuotaChange = async (queue, newLimit) => {
    const updatedLimit = parseInt(newLimit) || 0;
    try {
      await queueServices.updateQueue(queue.id, {
        name: queue.name,
        description: queue.description || null,
        daily_limit: updatedLimit,
        avg_service_time: queue.avg_service_time || 10,
        is_active: queue.is_active
      });

      setQueues(prev => prev.map(q => q.id === queue.id ? { ...q, daily_limit: updatedLimit } : q));
      addNotification(
        'info',
        'Quota Updated',
        `Daily quota for queue "${queue.name}" changed to ${updatedLimit}.`,
        'SlidersHorizontal'
      );
    } catch (err) {
      alert(err.message || 'Failed to update queue quota.');
      addNotification('error', 'Quota Update Failed', err.message || `Failed to update quota for "${queue.name}".`, 'AlertTriangle');
    }
  };

  // 2. Toggle Status (is_active boolean / PATCH toggle-status)
  const handleToggleStatus = async (queueId) => {
    const queue = queues.find(q => q.id === queueId);
    try {
      const response = await queueServices.toggleQueueStatus(queueId);
      setQueues(prev => prev.map(q => q.id === queueId ? { ...q, is_active: response.is_active } : q));
      const newStatus = response.is_active ? 'opened' : 'closed';
      addNotification(
        response.is_active ? 'success' : 'warning',
        `Queue ${response.is_active ? 'Opened' : 'Closed'}`,
        `Queue "${queue?.name || queueId}" has been ${newStatus}.`,
        'ToggleLeft'
      );
    } catch (err) {
      alert(err.message || 'Failed to toggle queue status.');
      addNotification('error', 'Status Toggle Failed', err.message || `Failed to toggle status for "${queue?.name}".`, 'AlertTriangle');
    }
  };

  // 3. Delete Queue Category
  const handleDeleteQueue = async (queueId, queueName) => {
    if (window.confirm(`Are you sure you want to delete the ${queueName} queue?`)) {
      try {
        await queueServices.deleteQueue(queueId);
        const remaining = queues.filter(q => q.id !== queueId);
        setQueues(remaining);
        
        if (activeQueueId === queueId) {
          setActiveQueueId(remaining.length > 0 ? remaining[0].id : null);
        }
        addNotification(
          'warning',
          'Queue Deleted',
          `Queue "${queueName}" has been permanently deleted.`,
          'ListX'
        );
      } catch (err) {
        alert(err.message || 'Failed to delete queue.');
        addNotification('error', 'Delete Failed', err.message || `Failed to delete queue "${queueName}".`, 'AlertTriangle');
      }
    }
  };

  // 4. Create New Queue Submit (QueueCreateSchema)
  const handleCreateQueueSubmit = async (e) => {
    e.preventDefault();
    const cleanName = newQueueForm.name.trim();

    if (!cleanName) {
      alert("Queue name cannot be empty!");
      return;
    }

    if (queues.some(q => q.name.toLowerCase() === cleanName.toLowerCase())) {
      alert("This queue name already exists!");
      return;
    }

    const payload = {
      name: cleanName,
      description: null,
      daily_limit: parseInt(newQueueForm.daily_limit) || 50,
      avg_service_time: parseInt(newQueueForm.avg_service_time) || 10
    };

    try {
      const newQueue = await queueServices.createQueue(payload);
      setQueues(prev => [...prev, newQueue]);
      setActiveQueueId(newQueue.id);
      setIsModalOpen(false);
      setNewQueueForm({ name: '', daily_limit: 50, avg_service_time: 10 });
      addNotification(
        'success',
        'Queue Created',
        `New queue "${cleanName}" was created with a daily limit of ${payload.daily_limit} and ${payload.avg_service_time} min avg service time.`,
        'ListPlus'
      );
    } catch (err) {
      alert(err.message || 'Failed to create new queue.');
      addNotification('error', 'Queue Creation Failed', err.message || `Failed to create queue "${cleanName}".`, 'AlertTriangle');
    }
  };

  // 5a. Mark current client as COMPLETED → serve next
  const handleMarkCompleted = async () => {
    if (!activeQueueId) return;
    try {
      const res = await tokenServices.advanceToken(activeQueueId, 'COMPLETED');
      await fetchActiveQueueTokenData(activeQueueId);
      await fetchDashboardAndQueues();
      addNotification(
        'success',
        'Client Served',
        `Token #${res?.completed_token?.token_number ?? '?'} marked as completed. Next client called.`,
        'UserCheck'
      );
    } catch (err) {
      addNotification('error', 'Error', err.message || 'Failed to mark as completed.', 'AlertTriangle');
    }
  };

  // 5b. Mark current client as MISSED (no-show) → serve next
  const handleMarkMissed = async () => {
    if (!activeQueueId) return;
    if (!currentToken) {
      addNotification('warning', 'No Active Token', 'No token is currently being served.', 'AlertTriangle');
      return;
    }
    try {
      const res = await tokenServices.advanceToken(activeQueueId, 'MISSED');
      await fetchActiveQueueTokenData(activeQueueId);
      await fetchDashboardAndQueues();
      addNotification(
        'warning',
        'Token Missed',
        `Token #${res?.completed_token?.token_number ?? '?'} marked as missed. Next client called.`,
        'AlertTriangle'
      );
    } catch (err) {
      addNotification('error', 'Error', err.message || 'Failed to mark as missed.', 'AlertTriangle');
    }
  };

  // 5c. Call Next Client (no current serving — first call of the day)
  const handleCallNextClient = async () => {
    if (!activeQueueId) return;
    if (waitingTokens.length === 0 && !currentToken) {
      addNotification('warning', 'Queue Empty', 'No clients are waiting in this queue.', 'AlertTriangle');
      return;
    }
    try {
      const res = await tokenServices.advanceToken(activeQueueId, 'COMPLETED');
      await fetchActiveQueueTokenData(activeQueueId);
      await fetchDashboardAndQueues();
      addNotification(
        'info',
        'Next Client Called',
        `Token #${res?.serving_token?.token_number ?? '?'} is now being served.`,
        'PhoneCall'
      );
    } catch (err) {
      addNotification('error', 'Advance Failed', err.message || 'Failed to call next client.', 'AlertTriangle');
    }
  };

  // 5d. Close day — cancel all remaining WAITING tokens, notify users
  const handleCloseDay = async () => {
    if (!activeQueueId) return;
    if (!window.confirm('Close the day for this queue? All remaining waiting tokens will be cancelled and users notified.')) return;
    try {
      const res = await tokenServices.closeDay(activeQueueId);
      await fetchActiveQueueTokenData(activeQueueId);
      await fetchDashboardAndQueues();
      addNotification(
        'warning',
        'Day Closed',
        res?.message || 'Remaining tokens cancelled. Users notified.',
        'Power'
      );
    } catch (err) {
      addNotification('error', 'Close Day Failed', err.message || 'Failed to close day.', 'AlertTriangle');
    }
  };


  const activeQueue = queues.find(q => q.id === activeQueueId);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F6F5F0] flex items-center justify-center font-sans text-[#142B29]">
        <div className="flex items-center gap-2 font-semibold">
          <RefreshCw className="animate-spin" size={20} />
          Loading Organization Panel...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F6F5F0] font-sans text-[#142B29] antialiased">
      
      {/* ─── NAV HEADER ─── */}
      <header className="bg-white border-b border-[#EAE9E2] px-6 py-4 flex flex-wrap justify-between items-center gap-3">
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="w-10 h-10 rounded-xl bg-[#EAF3EE] text-[#0E5C56] flex items-center justify-center border border-[#C8D3CE] flex-shrink-0">
            <Building2 size={20} />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-semibold text-[#8A968E] uppercase tracking-widest block">
              🏢 ORGANIZATION DASHBOARD
            </span>
            <h1 className="text-xl font-bold !text-black leading-tight mt-0.5 truncate max-w-[280px] sm:max-w-none">
              {dashboardData?.institution_name || 'Organization Panel'}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold border transition-all ${
              activeTab === 'dashboard'
                ? 'bg-[#0E5C56] text-white border-[#0E5C56]'
                : 'bg-white text-[#5C6B62] border-[#D9DED3] hover:bg-[#F6F5F0]'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => { setActiveTab('profile'); setIsEditingProfile(false); setProfileSaveStatus(null); }}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold border transition-all ${
              activeTab === 'profile'
                ? 'bg-[#0E5C56] text-white border-[#0E5C56]'
                : 'bg-white text-[#5C6B62] border-[#D9DED3] hover:bg-[#F6F5F0]'
            }`}
          >
            <User size={13} /> Profile
          </button>
          {/* Notifications Tab */}
          <button
            onClick={() => { setActiveTab('notifications'); markAllRead(); }}
            className={`relative flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold border transition-all ${
              activeTab === 'notifications'
                ? 'bg-[#0E5C56] text-white border-[#0E5C56]'
                : 'bg-white text-[#5C6B62] border-[#D9DED3] hover:bg-[#F6F5F0]'
            }`}
          >
            <Bell size={13} />
            Notifications
            {unreadCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] bg-[#C93B2B] text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 shadow">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
          <button
            onClick={fetchDashboardAndQueues}
            className="bg-white border border-[#D9DED3] rounded-lg px-4 py-2 text-xs font-medium outline-none shadow-sm cursor-pointer flex items-center gap-1.5 hover:bg-[#F6F5F0]"
          >
            <RefreshCw size={14} />
            Refresh Data
          </button>
        </div>
      </header>

      {error && (
        <div className="max-w-[1400px] mx-auto mt-4 px-8">
          <div className="bg-[#FADCD9] text-[#C93B2B] p-4 rounded-xl text-xs font-semibold">
            {error}
          </div>
        </div>
      )}

      {/* ─── PROFILE TAB ─── */}
      {activeTab === 'profile' && (
        <main className="max-w-[860px] mx-auto p-8">
          <div className="bg-white border border-[#EAE9E2] rounded-2xl shadow-sm overflow-hidden">
            {/* Profile header strip */}
            <div className="bg-[#EAF3EE] px-8 py-6 flex items-center gap-5 border-b border-[#D9DED3]">
              <div className="w-16 h-16 rounded-2xl bg-[#0E5C56] text-white text-xl font-bold flex items-center justify-center flex-shrink-0">
                {profile.name ? profile.name.split(' ').map(n => n[0]).join('').toUpperCase() : <Building2 size={24} />}
              </div>
              <div>
                <h2 className="text-lg font-bold text-[#142B29]">{profile.name || 'Organization Name'}</h2>
                <p className="text-xs text-[#5C6B62] mt-0.5">{profile.email}</p>
                <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-semibold text-[#0E5C56] bg-[#C8F0E8] px-2 py-0.5 rounded-full">
                  <Shield size={10} /> Verified Organization
                </span>
              </div>
            </div>

            {/* Profile form */}
            <form onSubmit={handleSaveProfile} className="px-8 py-6 space-y-5">
              {/* Organization Name */}
              <div>
                <label className="block text-xs font-bold text-[#5C6B62] uppercase tracking-wider mb-1.5">Organization Name</label>
                <input
                  type="text"
                  value={tempProfile.name}
                  onChange={(e) => setTempProfile({ ...tempProfile, name: e.target.value })}
                  disabled={!isEditingProfile}
                  className="w-full bg-[#F6F5F0] border border-[#D9DED3] rounded-xl px-4 py-2.5 text-sm text-[#142B29] outline-none focus:border-[#0E5C56] disabled:opacity-60"
                />
              </div>

              {/* Phone + Website row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#5C6B62] uppercase tracking-wider mb-1.5">Phone Number</label>
                  <input
                    type="text"
                    value={tempProfile.phone}
                    onChange={(e) => setTempProfile({ ...tempProfile, phone: e.target.value })}
                    disabled={!isEditingProfile}
                    className="w-full bg-[#F6F5F0] border border-[#D9DED3] rounded-xl px-4 py-2.5 text-sm text-[#142B29] outline-none focus:border-[#0E5C56] disabled:opacity-60"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#5C6B62] uppercase tracking-wider mb-1.5">Website</label>
                  <input
                    type="text"
                    value={tempProfile.website}
                    onChange={(e) => setTempProfile({ ...tempProfile, website: e.target.value })}
                    disabled={!isEditingProfile}
                    placeholder="https://"
                    className="w-full bg-[#F6F5F0] border border-[#D9DED3] rounded-xl px-4 py-2.5 text-sm text-[#142B29] outline-none focus:border-[#0E5C56] disabled:opacity-60"
                  />
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="block text-xs font-bold text-[#5C6B62] uppercase tracking-wider mb-1.5">Address</label>
                <input
                  type="text"
                  value={tempProfile.address}
                  onChange={(e) => setTempProfile({ ...tempProfile, address: e.target.value })}
                  disabled={!isEditingProfile}
                  className="w-full bg-[#F6F5F0] border border-[#D9DED3] rounded-xl px-4 py-2.5 text-sm text-[#142B29] outline-none focus:border-[#0E5C56] disabled:opacity-60"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-[#5C6B62] uppercase tracking-wider mb-1.5">Description</label>
                <textarea
                  value={tempProfile.description}
                  onChange={(e) => setTempProfile({ ...tempProfile, description: e.target.value })}
                  disabled={!isEditingProfile}
                  rows={3}
                  className="w-full bg-[#F6F5F0] border border-[#D9DED3] rounded-xl px-4 py-2.5 text-sm text-[#142B29] outline-none focus:border-[#0E5C56] disabled:opacity-60 resize-none"
                />
              </div>

              {/* Email — read only */}
              <div>
                <label className="block text-xs font-bold text-[#5C6B62] uppercase tracking-wider mb-1.5">Email Address <span className="normal-case font-normal text-[#8A968E]">(cannot be changed)</span></label>
                <input
                  type="email"
                  value={profile.email}
                  disabled
                  className="w-full bg-[#F6F5F0] border border-[#D9DED3] rounded-xl px-4 py-2.5 text-sm text-[#8A968E] outline-none opacity-60"
                />
              </div>

              {/* Footer actions */}
              <div className="flex items-center justify-between pt-4 border-t border-[#F5F4F0]">
                <span className="text-xs text-[#8A968E] flex items-center gap-1">
                  <Shield size={12} className="text-[#0E5C56]" /> Changes are saved to your organization profile
                </span>
                {isEditingProfile ? (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => { setIsEditingProfile(false); setTempProfile({ ...profile }); setProfileSaveStatus(null); }}
                      className="px-4 py-2 rounded-xl text-xs font-semibold text-[#5C6B62] bg-[#F6F5F0] border border-[#D9DED3] hover:bg-[#EAE9E2] transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={profileSaveStatus === 'saving'}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-[#0E5C56] hover:bg-[#0B4A45] disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-sm"
                    >
                      {profileSaveStatus === 'saving'
                        ? <Loader2 size={13} className="animate-spin" />
                        : <Save size={13} />}
                      Save Changes
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsEditingProfile(true)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-[#0E5C56] hover:bg-[#0B4A45] transition-all shadow-sm"
                  >
                    <User size={13} /> Edit Details
                  </button>
                )}
              </div>

              {/* Feedback messages */}
              {profileSaveStatus === 'success' && (
                <div className="flex items-center gap-2 text-xs font-semibold text-[#166534] bg-[#ecfdf5] border border-[#bbf7d0] rounded-xl px-4 py-3">
                  <CheckCircle2 size={14} /> Organization profile updated successfully!
                </div>
              )}
              {profileSaveStatus === 'error' && (
                <div className="flex items-center gap-2 text-xs font-semibold text-[#991b1b] bg-[#fef2f2] border border-[#fecaca] rounded-xl px-4 py-3">
                  {profileSaveError || 'Failed to save. Please try again.'}
                </div>
              )}
            </form>
          </div>
        </main>
      )}

      {/* ─── NOTIFICATIONS TAB ─── */}
      {activeTab === 'notifications' && (
        <main className="max-w-[860px] mx-auto p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#EAF3EE] text-[#0E5C56] flex items-center justify-center border border-[#C8D3CE]">
                <Bell size={18} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-[#142B29]">Notifications</h2>
                <p className="text-xs text-[#8A968E] mt-0.5">
                  {notifications.length === 0
                    ? 'No activity yet'
                    : `${notifications.length} event${notifications.length !== 1 ? 's' : ''} recorded`}
                </p>
              </div>
            </div>
            {notifications.length > 0 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={markAllRead}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-[#D9DED3] bg-white text-[#5C6B62] hover:bg-[#F6F5F0] transition-all"
                >
                  <CheckCheck size={13} /> Mark all read
                </button>
                <button
                  onClick={clearAll}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-[#FADCD9] bg-white text-[#C93B2B] hover:bg-[#FDF2F1] transition-all"
                >
                  <Trash size={13} /> Clear all
                </button>
              </div>
            )}
          </div>

          {/* Notification list */}
          {notifications.length === 0 ? (
            <div className="bg-white border border-[#EAE9E2] rounded-2xl p-12 text-center shadow-sm">
              <div className="w-16 h-16 bg-[#F6F5F0] rounded-2xl flex items-center justify-center mx-auto mb-4 border border-[#EAE9E2]">
                <Bell size={28} className="text-[#C8D3CE]" />
              </div>
              <h3 className="text-sm font-bold text-[#8A968E]">No notifications yet</h3>
              <p className="text-xs text-[#A3AEA6] mt-1.5 max-w-xs mx-auto">
                Activity in the dashboard — like creating queues, updating your profile, or calling the next client — will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((notif) => {
                const typeStyles = {
                  success: {
                    bg: 'bg-[#F0FDF4]',
                    border: 'border-[#BBF7D0]',
                    iconBg: 'bg-[#DCFCE7]',
                    iconColor: 'text-[#16A34A]',
                    dot: 'bg-[#16A34A]',
                    label: 'bg-[#DCFCE7] text-[#16A34A]',
                    labelText: 'Success',
                  },
                  info: {
                    bg: 'bg-[#EFF6FF]',
                    border: 'border-[#BFDBFE]',
                    iconBg: 'bg-[#DBEAFE]',
                    iconColor: 'text-[#2563EB]',
                    dot: 'bg-[#2563EB]',
                    label: 'bg-[#DBEAFE] text-[#2563EB]',
                    labelText: 'Info',
                  },
                  warning: {
                    bg: 'bg-[#FFFBEB]',
                    border: 'border-[#FDE68A]',
                    iconBg: 'bg-[#FEF3C7]',
                    iconColor: 'text-[#D97706]',
                    dot: 'bg-[#D97706]',
                    label: 'bg-[#FEF3C7] text-[#D97706]',
                    labelText: 'Warning',
                  },
                  error: {
                    bg: 'bg-[#FFF1F2]',
                    border: 'border-[#FECDD3]',
                    iconBg: 'bg-[#FFE4E6]',
                    iconColor: 'text-[#E11D48]',
                    dot: 'bg-[#E11D48]',
                    label: 'bg-[#FFE4E6] text-[#E11D48]',
                    labelText: 'Error',
                  },
                };
                const s = typeStyles[notif.type] || typeStyles.info;

                const iconMap = {
                  UserCheck: <UserCheck size={15} />,
                  ListPlus: <ListPlus size={15} />,
                  ListX: <ListX size={15} />,
                  ToggleLeft: <ToggleLeft size={15} />,
                  SlidersHorizontal: <SlidersHorizontal size={15} />,
                  PhoneCall: <PhoneCall size={15} />,
                  AlertTriangle: <AlertTriangle size={15} />,
                  Info: <Info size={15} />,
                };

                const now = new Date();
                const diffMs = now - notif.timestamp;
                const diffMins = Math.floor(diffMs / 60000);
                const diffHrs = Math.floor(diffMs / 3600000);
                const timeLabel =
                  diffMins < 1 ? 'just now'
                  : diffMins < 60 ? `${diffMins}m ago`
                  : diffHrs < 24 ? `${diffHrs}h ago`
                  : notif.timestamp.toLocaleDateString();

                return (
                  <div
                    key={notif.id}
                    className={`relative flex gap-4 p-4 rounded-2xl border shadow-sm transition-all ${
                      s.bg
                    } ${
                      s.border
                    } ${
                      !notif.read ? 'ring-1 ring-offset-0 ring-[#0E5C56]/20' : ''
                    }`}
                  >
                    {/* Unread dot */}
                    {!notif.read && (
                      <span className={`absolute top-4 left-[-5px] w-2.5 h-2.5 rounded-full border-2 border-white shadow ${s.dot}`} />
                    )}

                    {/* Icon */}
                    <div className={`w-9 h-9 rounded-xl ${s.iconBg} ${s.iconColor} flex items-center justify-center flex-shrink-0 border border-white/60`}>
                      {iconMap[notif.icon] || <Info size={15} />}
                    </div>

                    {/* Body */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-bold text-[#142B29]">{notif.title}</span>
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wide ${s.label}`}>
                              {s.labelText}
                            </span>
                          </div>
                          <p className="text-xs text-[#5C6B62] mt-1 leading-relaxed">{notif.message}</p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="text-[10px] text-[#A3AEA6] font-medium whitespace-nowrap">{timeLabel}</span>
                          <button
                            onClick={() => dismissNotification(notif.id)}
                            className="text-[#A3AEA6] hover:text-[#142B29] transition-colors"
                            title="Dismiss"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      </div>
                      <p className="text-[10px] text-[#A3AEA6] mt-1.5 font-medium">
                        {notif.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })} &bull; {notif.timestamp.toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      )}

      {/* ─── MAIN WORKSPACE (Dashboard) ─── */}
      {activeTab === 'dashboard' && (
      <main className="max-w-[1400px] mx-auto p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* ─── LEFT SIDE COLUMN: QUEUE CONFIGURATION ─── */}
        <section className="lg:col-span-5 space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold text-[#8A968E] uppercase tracking-wider flex items-center gap-1.5">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M4 10h12M4 6h16M4 14h8M4 18h12"/></svg>
              QUEUE CONFIGURATION ({queues.length})
            </span>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-1.5 bg-white border border-[#D9DED3] text-[#142B29] px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-[#F6F5F0] active:scale-95 transition-all shadow-sm"
            >
              <Plus size={14} strokeWidth={2.5} />
              Add queue
            </button>
          </div>

          {queues.length === 0 ? (
            <div className="bg-white border border-[#EAE9E2] rounded-2xl p-6 text-center text-xs text-[#8A968E]">
              No queues registered. Click "Add queue" to get started.
            </div>
          ) : (
            queues.map((queue) => (
              <div key={queue.id} className="bg-white border border-[#EAE9E2] rounded-2xl p-5 shadow-sm space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-bold text-[#142B29] leading-snug">{queue.name}</h3>
                    <p className="text-sm font-medium text-[#8A968E] mt-0.5">
                      Avg Time: <span className="text-[#0E5C56] font-semibold">{queue.avg_service_time || 10} mins</span>
                    </p>
                  </div>
                  <span className={`flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border ${
                    queue.is_active 
                      ? 'bg-[#EAF3EE] text-[#0E5C56] border-[#C8D3CE]/30' 
                      : 'bg-[#FAEEDA] text-[#854F0B] border-[#F5E6D3]'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${queue.is_active ? 'bg-[#0E5C56]' : 'bg-[#854F0B]'}`}></span>
                    {queue.is_active ? 'OPEN' : 'CLOSED'}
                  </span>
                </div>

                {/* Quota Interaction */}
                <div className="flex items-center gap-3">
                  <label className="text-xs text-[#5C6B62] font-medium w-12">Quota</label>
                  <input
                    type="number"
                    value={queue.daily_limit}
                    onChange={(e) => handleQuotaChange(queue, e.target.value)}
                    className="w-24 bg-white border border-[#D9DED3] rounded-lg px-3 py-1.5 text-xs font-semibold text-[#142B29] outline-none text-right focus:border-[#C8D3CE]"
                  />
                  <span className="text-xs text-[#8A968E] font-medium ml-1">
                    (Max daily limit)
                  </span>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#F5F4F0]">
                  <button 
                    onClick={() => openWorkingHoursModal(queue)}
                    className="flex items-center gap-1.5 bg-white border border-[#D9DED3] text-[#142B29] px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-[#F6F5F0] transition-all shadow-sm"
                  >
                    <Clock size={13} />
                    Hours
                  </button>
                  <button 
                    onClick={() => handleToggleStatus(queue.id)}
                    className="flex items-center gap-1.5 bg-white border border-[#D9DED3] text-[#142B29] px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-[#F6F5F0] transition-all shadow-sm"
                  >
                    <Power size={13} strokeWidth={2.5} className="rotate-180" />
                    {queue.is_active ? 'Close' : 'Open'}
                  </button>
                  <button 
                    onClick={() => handleDeleteQueue(queue.id, queue.name)}
                    className="flex items-center gap-1.5 bg-white border border-[#FADCD9] text-[#C93B2B] px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-[#FDF2F1] transition-all shadow-sm"
                  >
                    <Trash2 size={13} />
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </section>

        {/* ─── RIGHT SIDE COLUMN: LIVE DISPLAY CONTROL CENTRE ─── */}
        <section className="lg:col-span-7 space-y-6">
          
          <div className="space-y-3">
            <span className="text-[10px] font-bold text-[#8A968E] uppercase tracking-wider flex items-center gap-1.5">
              <Radio size={12} className="text-[#0E5C56]" />
              LIVE COUNTER
            </span>

            {/* Department Navigation Tabs */}
            <div className="flex flex-wrap gap-2">
              {queues.map((tab) => {
                const isActive = activeQueueId === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveQueueId(tab.id)}
                    className={`px-4 py-2 rounded-full text-xs font-semibold border transition-all ${
                      isActive 
                        ? 'bg-[#0E5C56] text-white border-[#0E5C56] shadow-sm'
                        : 'bg-white text-[#5C6B62] border-[#D9DED3] hover:border-[#C8D3CE]'
                    }`}
                  >
                    {tab.name}
                  </button>
                );
              })}
            </div>

            {/* Current Active Serving Card */}
            <div className="bg-white border border-[#EAE9E2] rounded-2xl p-6 shadow-sm space-y-4">
              <div className="text-center">
                <span className="text-[11px] font-bold tracking-widest text-[#8A968E] uppercase block">
                  NOW SERVING ({activeQueue?.name || 'None Selected'})
                </span>
                <div className="text-5xl font-bold text-[#0E5C56] tracking-tight mt-2">
                  {currentToken?.token_number ? `#${currentToken.token_number}` : '—'}
                </div>
                <div className={`inline-block text-[10px] font-bold tracking-wider uppercase px-3 py-0.5 rounded mt-2 ${
                  currentToken ? 'bg-[#EAF3EE] text-[#0E5C56] border border-[#C8D3CE]/30' : 'bg-[#F6F5F0] border border-[#EAE9E2] text-[#5C6B62]'
                }`}>
                  {currentToken ? 'SERVING' : 'IDLE'}
                </div>
              </div>

              {/* Action buttons */}
              {currentToken ? (
                <div className="flex gap-2">
                  {/* Call Next (marks current as COMPLETED) */}
                  <button
                    onClick={handleMarkCompleted}
                    disabled={!activeQueueId}
                    className="flex-1 bg-[#0E5C56] hover:bg-[#0B4A45] active:scale-[0.99] disabled:opacity-50 text-white py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-md shadow-[#0E5C56]/10"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                    Call Next
                  </button>
                  {/* Missed button */}
                  <button
                    onClick={handleMarkMissed}
                    disabled={!activeQueueId}
                    className="bg-[#FDF2F1] border border-[#FADCD9] text-[#C93B2B] hover:bg-[#FADCD9] active:scale-[0.99] disabled:opacity-50 px-4 py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    Missed
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleCallNextClient}
                  disabled={!activeQueueId || waitingTokens.length === 0}
                  className="w-full bg-[#0E5C56] hover:bg-[#0B4A45] active:scale-[0.99] disabled:opacity-50 text-white py-3.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-md shadow-[#0E5C56]/10"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                  Call First Client
                </button>
              )}


              {/* Close Day */}
              <button
                onClick={handleCloseDay}
                disabled={!activeQueueId || waitingTokens.length === 0}
                title={waitingTokens.length === 0 ? 'No waiting tokens to cancel' : 'Cancel all remaining waiting tokens and close the day'}
                className="w-full bg-white border border-[#FADCD9] text-[#C93B2B] hover:bg-[#FDF2F1] active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                Close Day &amp; Cancel Remaining
              </button>
            </div>

          </div>

          {/* ─── UP NEXT QUEUE LIST ─── */}
          <div className="space-y-3">
            <span className="text-[10px] font-bold text-[#8A968E] uppercase tracking-wider block">
              UP NEXT ({waitingTokens.length})
            </span>

            <div className="bg-white border border-[#EAE9E2] rounded-2xl overflow-hidden shadow-sm">
              {waitingTokens.length > 0 ? (
                waitingTokens.map((client, index) => (
                  <div 
                    key={client.token_number} 
                    className={`flex items-center justify-between p-4 transition-colors ${
                      index !== waitingTokens.length - 1 ? 'border-b border-[#F5F4F0]' : ''
                    }`}
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <span className="text-xs font-medium text-[#A3AEA6] w-4 text-center">
                        {index + 1}
                      </span>
                      <div className="w-8 h-8 rounded-full bg-[#EAF3EE] text-[#0E5C56] flex items-center justify-center border border-[#C8D3CE]/40 flex-shrink-0">
                        <User size={14} />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-bold text-[#142B29] tracking-tight">
                          Token #{client.token_number}
                        </h4>
                        <p className="text-xs font-medium text-[#8A968E] mt-0.5">
                          Status: {client.status}
                        </p>
                      </div>
                    </div>
                    {index === 0 && <ChevronRight size={16} className="text-[#8A968E]" />}
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-xs text-[#8A968E] bg-white">
                  No clients waiting in line for this counter.
                </div>
              )}
            </div>
          </div>

        </section>
      </main>
      )}

      {/* ─── CREATE QUEUE MODAL ─── */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-[#EAE9E2] rounded-2xl p-6 w-full max-w-md shadow-xl space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-[#F5F4F0]">
              <h3 className="text-lg font-bold text-[#142B29]">Add New Queue</h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-[#8A968E] hover:text-[#142B29]"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateQueueSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#5C6B62] uppercase tracking-wider mb-1">
                  Queue Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Account Opening"
                  value={newQueueForm.name}
                  onChange={(e) => setNewQueueForm({ ...newQueueForm, name: e.target.value })}
                  className="w-full bg-[#F6F5F0] border border-[#D9DED3] rounded-lg px-3 py-2 text-sm text-[#142B29] outline-none focus:border-[#0E5C56]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#5C6B62] uppercase tracking-wider mb-1">
                  Daily Quota Limit
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={newQueueForm.daily_limit}
                  onChange={(e) => setNewQueueForm({ ...newQueueForm, daily_limit: e.target.value })}
                  className="w-full bg-[#F6F5F0] border border-[#D9DED3] rounded-lg px-3 py-2 text-sm text-[#142B29] outline-none focus:border-[#0E5C56]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#5C6B62] uppercase tracking-wider mb-1">
                  Average Service Time (mins)
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={newQueueForm.avg_service_time}
                  onChange={(e) => setNewQueueForm({ ...newQueueForm, avg_service_time: e.target.value })}
                  className="w-full bg-[#F6F5F0] border border-[#D9DED3] rounded-lg px-3 py-2 text-sm text-[#142B29] outline-none focus:border-[#0E5C56]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-[#5C6B62] bg-[#F6F5F0] hover:bg-[#EAE9E2]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-[#0E5C56] hover:bg-[#0B4A45]"
                >
                  Create Queue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── WORKING HOURS MODAL ─── */}
      {isWorkingHoursModalOpen && selectedQueueForHours && (
        <div className="fixed inset-0 bg-[#081110]/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 w-full max-w-lg shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-bold text-[#142B29]">Working Hours</h3>
                <p className="text-xs text-[#8A968E] mt-0.5">Configure schedule for {selectedQueueForHours.name}</p>
              </div>
              <button 
                onClick={() => setIsWorkingHoursModalOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-[#F6F5F0] text-[#5C6B62] hover:bg-[#EAE9E2] transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 max-h-[60vh] overflow-y-auto px-1 py-1">
              {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day, index) => {
                const hourData = workingHours[index];
                if (!hourData) return null;
                
                return (
                  <div key={day} className="flex items-center justify-between p-3 rounded-xl border border-[#EAE9E2] bg-[#F6F5F0]/50 hover:bg-[#F6F5F0] transition-colors">
                    <div className="flex items-center gap-3 w-1/3">
                      <input 
                        type="checkbox"
                        checked={hourData.isActive}
                        onChange={(e) => handleWorkingHoursChange(index, 'isActive', e.target.checked)}
                        className="w-4 h-4 rounded text-[#0E5C56] focus:ring-[#0E5C56]"
                      />
                      <span className={`text-sm font-semibold ${hourData.isActive ? 'text-[#142B29]' : 'text-[#A3AEA6]'}`}>{day}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 w-2/3 justify-end">
                      <input
                        type="time"
                        disabled={!hourData.isActive}
                        value={hourData.opening_time.substring(0,5)}
                        onChange={(e) => handleWorkingHoursChange(index, 'opening_time', e.target.value)}
                        className="w-28 bg-white border border-[#D9DED3] rounded-lg px-2 py-1.5 text-xs font-semibold text-[#142B29] outline-none disabled:opacity-50"
                      />
                      <span className="text-xs text-[#8A968E] font-medium">to</span>
                      <input
                        type="time"
                        disabled={!hourData.isActive}
                        value={hourData.closing_time.substring(0,5)}
                        onChange={(e) => handleWorkingHoursChange(index, 'closing_time', e.target.value)}
                        className="w-28 bg-white border border-[#D9DED3] rounded-lg px-2 py-1.5 text-xs font-semibold text-[#142B29] outline-none disabled:opacity-50"
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end gap-2 pt-6 mt-4 border-t border-[#F5F4F0]">
              <button
                type="button"
                onClick={() => setIsWorkingHoursModalOpen(false)}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-[#5C6B62] bg-[#F6F5F0] hover:bg-[#EAE9E2] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveWorkingHours}
                disabled={workingHoursSaving}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white bg-[#0E5C56] hover:bg-[#0B4A45] disabled:opacity-60 transition-colors"
              >
                {workingHoursSaving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
                Save Hours
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}