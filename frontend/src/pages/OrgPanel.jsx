import React, { useState, useEffect, useCallback } from 'react';
import { 
  Building2, 
  Plus, 
  Power, 
  Trash2, 
  User, 
  ChevronRight, 
  Radio,
  RefreshCw,
  X
} from 'lucide-react';

import institutionsService from '../services/institutionServices';
import queueServices from '../services/queueServices';
import tokenServices from '../services/tokenServices';

export default function OrgPanel() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Institution & Dashboard metadata
  const [dashboardData, setDashboardData] = useState(null);

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
  }, [fetchDashboardAndQueues]);

  useEffect(() => {
    if (activeQueueId) {
      fetchActiveQueueTokenData(activeQueueId);
    }
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
    } catch (err) {
      alert(err.message || 'Failed to update queue quota.');
    }
  };

  // 2. Toggle Status (is_active boolean / PATCH toggle-status)
  const handleToggleStatus = async (queueId) => {
    try {
      const response = await queueServices.toggleQueueStatus(queueId);
      setQueues(prev => prev.map(q => q.id === queueId ? { ...q, is_active: response.is_active } : q));
    } catch (err) {
      alert(err.message || 'Failed to toggle queue status.');
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
      } catch (err) {
        alert(err.message || 'Failed to delete queue.');
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
    } catch (err) {
      alert(err.message || 'Failed to create new queue.');
    }
  };

  // 5. Call Next Client (Advance Queue)
  const handleCallNextClient = async () => {
    if (!activeQueueId) return;
    
    if (waitingTokens.length === 0) {
      alert("No more clients waiting in line for this queue!");
      return;
    }

    try {
      await tokenServices.advanceToken(activeQueueId);
      await fetchActiveQueueTokenData(activeQueueId);
      await fetchDashboardAndQueues();
    } catch (err) {
      alert(err.message || 'Failed to call next client.');
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
      <header className="bg-white border-b border-[#EAE9E2] px-8 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#EAF3EE] text-[#0E5C56] flex items-center justify-center border border-[#C8D3CE]">
            <Building2 size={20} />
          </div>
          <div>
            <span className="text-[10px] font-semibold text-[#8A968E] uppercase tracking-widest block">
              🏢 ORGANIZATION DASHBOARD
            </span>
            <h1 className="text-xl font-bold text-[#142B29] leading-tight mt-0.5">
              {dashboardData?.institution_name || 'Organization Panel'}
            </h1>
          </div>
        </div>

        <button 
          onClick={fetchDashboardAndQueues}
          className="bg-white border border-[#D9DED3] rounded-lg px-4 py-2 text-xs font-medium outline-none shadow-sm cursor-pointer flex items-center gap-1.5 hover:bg-[#F6F5F0]"
        >
          <RefreshCw size={14} />
          Refresh Data
        </button>
      </header>

      {error && (
        <div className="max-w-[1400px] mx-auto mt-4 px-8">
          <div className="bg-[#FADCD9] text-[#C93B2B] p-4 rounded-xl text-xs font-semibold">
            {error}
          </div>
        </div>
      )}

      {/* ─── MAIN WORKSPACE ─── */}
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
                <div className="flex items-center gap-2 pt-2 border-t border-[#F5F4F0]">
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
            <div className="bg-white border border-[#EAE9E2] rounded-2xl p-6 text-center shadow-sm space-y-4">
              <div>
                <span className="text-[11px] font-bold tracking-widest text-[#8A968E] uppercase block">
                  NOW SERVING ({activeQueue?.name || 'None Selected'})
                </span>
                <div className="text-4xl font-bold text-[#0E5C56] tracking-tight mt-1">
                  {currentToken?.token_number ? `#${currentToken.token_number}` : 'None'}
                </div>
                <div className="inline-block bg-[#F6F5F0] border border-[#EAE9E2] text-[10px] font-bold tracking-wider text-[#5C6B62] uppercase px-3 py-0.5 rounded mt-2">
                  {currentToken?.status || 'IDLE'}
                </div>
              </div>

              {/* Call Next Client Trigger */}
              <button 
                onClick={handleCallNextClient}
                disabled={!activeQueueId}
                className="w-full bg-[#0E5C56] hover:bg-[#0B4A45] active:scale-[0.99] disabled:opacity-50 text-white py-3.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-md shadow-[#0E5C56]/10 tracking-wide"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                Call next client
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

    </div>
  );
}