import React, { useState } from 'react';
import { 
  Building2, 
  Plus, 
  Power, 
  Trash2, 
  User, 
  ChevronRight, 
  Radio 
} from 'lucide-react';

export default function OrgPanel() {

  const [activeCounterTab, setActiveCounterTab] = useState('Account Opening');
  
  // Real data state for dynamic rendering
  const [queues, setQueues] = useState([
    { id: 1, name: 'Account Opening', prefix: 'CB-ACC', waiting: 5, quota: 60, leftToday: 36, status: 'OPEN' },
    { id: 2, name: 'Demat Services', prefix: 'CB-DEMAT', waiting: 2, quota: 40, leftToday: 22, status: 'OPEN' },
    { id: 3, name: 'Cash Deposit', prefix: 'CB-CASH', waiting: 6, quota: 100, leftToday: 59, status: 'OPEN' }
  ]);

  // Queue tracking system per category type
  const [servingTickets, setServingTickets] = useState({
    'Account Opening': { number: 'CB-ACC-020', type: 'STANDARD' },
    'Demat Services': { number: 'CB-DEMAT-008', type: 'STANDARD' },
    'Cash Deposit': { number: 'CB-CASH-045', type: 'STANDARD' }
  });

  const [upNextLists, setUpNextLists] = useState({
    'Account Opening': [
      { position: 1, number: 'CB-ACC-025', type: 'Senior citizen', interactive: true },
      { position: 2, number: 'CB-ACC-021', type: 'Standard', interactive: false },
      { position: 3, number: 'CB-ACC-022', type: 'Standard', interactive: false },
      { position: 4, number: 'CB-ACC-023', type: 'Standard', interactive: false },
      { position: 5, number: 'CB-ACC-024', type: 'Standard', interactive: false }
    ],
    'Demat Services': [
      { position: 1, number: 'CB-DEMAT-009', type: 'Standard', interactive: true },
      { position: 2, number: 'CB-DEMAT-010', type: 'Standard', interactive: false }
    ],
    'Cash Deposit': [
      { position: 1, number: 'CB-CASH-046', type: 'Standard', interactive: true },
      { position: 2, number: 'CB-CASH-047', type: 'Standard', interactive: false },
      { position: 3, number: 'CB-CASH-048', type: 'Senior citizen', interactive: false }
    ]
  });

  // ─── FUNCTIONAL INTERACTION HANDLERS ───

  // 1. Quota input modifications
  const handleQuotaChange = (id, newQuota) => {
    setQueues(queues.map(q => q.id === id ? { ...q, quota: parseInt(newQuota) || 0 } : q));
  };

  // 2. Toggle Status (Open/Close)
  const toggleQueueStatus = (id) => {
    setQueues(queues.map(q => q.id === id ? { ...q, status: q.status === 'OPEN' ? 'CLOSED' : 'OPEN' } : q));
  };

  // 3. Delete Queue Category
  const deleteQueue = (id, name) => {
    if (window.confirm(`Are you sure you want to delete the ${name} department queue?`)) {
      setQueues(queues.filter(q => q.id !== id));
      if (activeCounterTab === name) {
        const remaining = queues.filter(q => q.id !== id);
        if (remaining.length > 0) setActiveCounterTab(remaining[0].name);
      }
    }
  };

  // 4. Create New Department Queue
  const addNewQueue = () => {
    const name = prompt("Enter Department Name (e.g., Loan Assistance):");
    if (!name) return;
    const prefix = prompt("Enter Ticket Prefix Code (e.g., CB-LOAN):") || "CB-GEN";
    
    const newId = Date.now();
    const newDept = {
      id: newId,
      name,
      prefix: prefix.toUpperCase(),
      waiting: 0,
      quota: 50,
      leftToday: 50,
      status: 'OPEN'
    };

    setQueues([...queues, newDept]);
    setServingTickets(prev => ({ ...prev, [name]: { number: 'None', type: '---' } }));
    setUpNextLists(prev => ({ ...prev, [name]: [] }));
    setActiveCounterTab(name);
  };

  // 5. Advanced Counter Lifecycle (Call Next Client Logic)
  const callNextClient = () => {
    const currentList = upNextLists[activeCounterTab] || [];
    if (currentList.length === 0) {
      alert(`No more clients waiting in the ${activeCounterTab} queue!`);
      return;
    }

    // Pull first item from array list
    const nextClient = currentList[0];
    const updatedList = currentList.slice(1).map((item, index) => ({
      ...item,
      position: index + 1,
      interactive: index === 0 // Make new first item interactive
    }));

    // Update serving display states
    setServingTickets(prev => ({
      ...prev,
      [activeCounterTab]: { number: nextClient.number, type: nextClient.type.toUpperCase() }
    }));

    // Mutate list values
    setUpNextLists(prev => ({ ...prev, [activeCounterTab]: updatedList }));

    // Decrement current waiting balance metric
    setQueues(queues.map(q => q.name === activeCounterTab ? { 
      ...q, 
      waiting: Math.max(0, q.waiting - 1),
      leftToday: Math.max(0, q.leftToday - 1)
    } : q));
  };

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
            <h1 className="text-xl font-bold text-[#142B29] leading-tight mt-0.5">City Bank</h1>
          </div>
        </div>

        <select className="bg-white border border-[#D9DED3] rounded-lg px-4 py-2 text-xs font-medium outline-none shadow-sm cursor-pointer">
          <option>City Bank (Lazimpat)</option>
        </select>
      </header>

      {/* ─── MAIN WORKSPACE ─── */}
      <main className="max-w-[1400px] mx-auto p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* ─── LEFT SIDE COLUMN: QUEUE CONFIGURATION ─── */}
        <section className="lg:col-span-5 space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold text-[#8A968E] uppercase tracking-wider flex items-center gap-1.5">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M4 10h12M4 6h16M4 14h8M4 18h12"/></svg>
              QUEUE CONFIGURATION
            </span>
            <button 
              onClick={addNewQueue}
              className="flex items-center gap-1.5 bg-white border border-[#D9DED3] text-[#142B29] px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-[#F6F5F0] active:scale-95 transition-all shadow-sm"
            >
              <Plus size={14} strokeWidth={2.5} />
              Add queue
            </button>
          </div>

          {queues.map((queue) => (
            <div key={queue.id} className="bg-white border border-[#EAE9E2] rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-bold text-[#142B29] leading-snug">{queue.name}</h3>
                  <p className="text-sm font-medium text-[#8A968E] mt-0.5">
                    {queue.prefix} &middot; <span className="text-[#0E5C56] font-semibold">{queue.waiting} waiting</span>
                  </p>
                </div>
                <span className={`flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border ${
                  queue.status === 'OPEN' 
                    ? 'bg-[#EAF3EE] text-[#0E5C56] border-[#C8D3CE]/30' 
                    : 'bg-[#FAEEDA] text-[#854F0B] border-[#F5E6D3]'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${queue.status === 'OPEN' ? 'bg-[#0E5C56]' : 'bg-[#854F0B]'}`}></span>
                  {queue.status}
                </span>
              </div>

              {/* Quota Interaction */}
              <div className="flex items-center gap-3">
                <label className="text-xs text-[#5C6B62] font-medium w-12">Quota</label>
                <input
                  type="number"
                  value={queue.quota}
                  onChange={(e) => handleQuotaChange(queue.id, e.target.value)}
                  className="w-24 bg-white border border-[#D9DED3] rounded-lg px-3 py-1.5 text-xs font-semibold text-[#142B29] outline-none text-right focus:border-[#C8D3CE]"
                />
                <span className="text-xs text-[#8A968E] font-medium ml-1">
                  ({queue.leftToday} left today)
                </span>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-2 border-t border-[#F5F4F0]">
                <button 
                  onClick={() => toggleQueueStatus(queue.id)}
                  className="flex items-center gap-1.5 bg-white border border-[#D9DED3] text-[#142B29] px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-[#F6F5F0] transition-all shadow-sm"
                >
                  <Power size={13} strokeWidth={2.5} className="rotate-180" />
                  {queue.status === 'OPEN' ? 'Close' : 'Open'}
                </button>
                <button 
                  onClick={() => deleteQueue(queue.id, queue.name)}
                  className="flex items-center gap-1.5 bg-white border border-[#FADCD9] text-[#C93B2B] px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-[#FDF2F1] transition-all shadow-sm"
                >
                  <Trash2 size={13} />
                  Delete
                </button>
              </div>
            </div>
          ))}
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
                const isActive = activeCounterTab === tab.name;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveCounterTab(tab.name)}
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
                  NOW SERVING ({activeCounterTab})
                </span>
                <div className="text-4xl font-bold text-[#0E5C56] tracking-tight mt-1">
                  {servingTickets[activeCounterTab]?.number || 'None'}
                </div>
                <div className="inline-block bg-[#F6F5F0] border border-[#EAE9E2] text-[10px] font-bold tracking-wider text-[#5C6B62] uppercase px-3 py-0.5 rounded mt-2">
                  {servingTickets[activeCounterTab]?.type || '---'}
                </div>
              </div>

              {/* Functional Dynamic Click Trigger */}
              <button 
                onClick={callNextClient}
                className="w-full bg-[#0E5C56] hover:bg-[#0B4A45] active:scale-[0.99] text-white py-3.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-md shadow-[#0E5C56]/10 tracking-wide"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                Call next client
              </button>
            </div>
          </div>

          {/* ─── UP NEXT QUEUE LIST ─── */}
          <div className="space-y-3">
            <span className="text-[10px] font-bold text-[#8A968E] uppercase tracking-wider block">
              UP NEXT ({(upNextLists[activeCounterTab] || []).length})
            </span>

            <div className="bg-white border border-[#EAE9E2] rounded-2xl overflow-hidden shadow-sm">
              {(upNextLists[activeCounterTab] || []).length > 0 ? (
                (upNextLists[activeCounterTab] || []).map((client, index) => (
                  <div 
                    key={client.number} 
                    className={`flex items-center justify-between p-4 transition-colors ${
                      index !== (upNextLists[activeCounterTab] || []).length - 1 ? 'border-b border-[#F5F4F0]' : ''
                    }`}
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <span className="text-xs font-medium text-[#A3AEA6] w-4 text-center">
                        {client.position}
                      </span>
                      <div className="w-8 h-8 rounded-full bg-[#EAF3EE] text-[#0E5C56] flex items-center justify-center border border-[#C8D3CE]/40 flex-shrink-0">
                        <User size={14} />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-bold text-[#142B29] tracking-tight">
                          {client.number}
                        </h4>
                        <p className="text-xs font-medium text-[#8A968E] mt-0.5">
                          {client.type}
                        </p>
                      </div>
                    </div>
                    {client.interactive && <ChevronRight size={16} className="text-[#8A968E]" />}
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
    </div>
  );
}