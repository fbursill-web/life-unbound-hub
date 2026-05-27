'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://wgtcvmyofcoikynyftwn.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_naqzF_7iH63JA-0G2pw8Cw_XY7waAin';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function LifeUnboundPortal() {
  const [user, setUser] = useState<any>(null);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const [profiles, setProfiles] = useState<any[]>([]);
  const [participants, setParticipants] = useState<any[]>([]);
  const [shifts, setShifts] = useState<any[]>([]);
  const [timesheetHistory, setTimesheetHistory] = useState<any[]>([]);
  const [availabilitySubmissions, setAvailabilitySubmissions] = useState<any[]>([]);

  const [expandedClient, setExpandedClient] = useState<string | null>(null);
  const [calendarScope, setCalendarScope] = useState('combined'); 
  const [selectedCalendarTargetId, setSelectedCalendarTargetId] = useState('');
  const [calendarView, setCalendarView] = useState('month'); 

  const [fortnights, setFortnights] = useState<any[]>([]);
  const [selectedFortnight, setSelectedFortnight] = useState('');

  const [workerName, setWorkerName] = useState('');
  const [workerEmail, setWorkerEmail] = useState('');
  const [workerPhone, setWorkerPhone] = useState('');
  const [workerNotes, setWorkerNotes] = useState('');
  const [generatedPassword, setGeneratedPassword] = useState('');

  const [partName, setPartName] = useState('');
  const [partNdis, setPartNdis] = useState('');
  const [partPhone, setPartPhone] = useState('');
  const [partEmergName, setPartEmergName] = useState('');
  const [partEmergPhone, setPartEmergPhone] = useState('');
  const [partNotes, setPartNotes] = useState('');

  const [shiftTitle, setShiftTitle] = useState('');
  const [shiftWorkerId, setShiftWorkerId] = useState('');
  const [shiftParticipantId, setShiftParticipantId] = useState('');
  const [shiftDate, setShiftDate] = useState('');
  const [shiftStart, setShiftStart] = useState('');
  const [shiftEnd, setShiftEnd] = useState('');
  const [shiftDirectives, setShiftDirectives] = useState('');

  const [timesheetRows, setTimesheetRows] = useState<any[]>([
    { date: '', start: '', end: '', client: '', kmWith: '0', kmWithout: '0', notes: '' }
  ]);
  const [tsNotesChecked, setTsNotesChecked] = useState(false);

  const [availFortnight, setAvailFortnight] = useState('');
  const [availDaysState, setAvailDaysState] = useState<any>({
    Monday: { mode: 'standard', start: '09:00', end: '17:00' },
    Tuesday: { mode: 'standard', start: '09:00', end: '17:00' },
    Wednesday: { mode: 'standard', start: '09:00', end: '17:00' },
    Thursday: { mode: 'standard', start: '09:00', end: '17:00' },
    Friday: { mode: 'standard', start: '09:00', end: '17:00' },
    Saturday: { mode: 'unavailable', start: '', end: '' },
    Sunday: { mode: 'unavailable', start: '', end: '' },
  });

  const workerColors = ['border-sky-500 bg-sky-500/10 text-sky-400', 'border-indigo-500 bg-indigo-500/10 text-indigo-400', 'border-teal-500 bg-teal-500/10 text-teal-400', 'border-fuchsia-500 bg-fuchsia-500/10 text-fuchsia-400'];
  const clientColors = ['border-emerald-500 bg-emerald-500/10 text-emerald-400', 'border-amber-500 bg-amber-500/10 text-amber-400', 'border-cyan-500 bg-cyan-500/10 text-cyan-400', 'border-purple-500 bg-purple-500/10 text-purple-400'];

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  useEffect(() => {
    generateFortnightPayPeriods();
  }, []);

  useEffect(() => {
    if (user) {
      fetchCoreData();
    }
  }, [user]);

  const generateFortnightPayPeriods = () => {
    let periods = [];
    let startPoint = new Date('2026-01-05T00:00:00');
    for (let i = 1; i <= 26; i++) {
      let endPoint = new Date(startPoint.getTime());
      endPoint.setDate(endPoint.getDate() + 13);
      const formatStr = `${startPoint.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })} - ${endPoint.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })}`;
      periods.push({ id: `FN-${i}`, label: `Fortnight ${i} (${formatStr})` });
      startPoint.setDate(startPoint.getDate() + 14);
    }
    setFortnights(periods);
    if (periods.length > 0) {
      setSelectedFortnight(periods[10].id); 
      setAvailFortnight(periods[10].id);
    }
  };

  const fetchCoreData = async () => {
    try {
      const { data: profs } = await supabase.from('profiles').select('*');
      if (profs) setProfiles(profs);
      const { data: parts } = await supabase.from('participants').select('*');
      if (parts) setParticipants(parts);
      const { data: sfts } = await supabase.from('shifts').select('*');
      if (sfts) setShifts(sfts);
    } catch (err) {
      console.error('Data sync error:', err);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', loginEmail.trim())
        .single();

      if (error || !data) {
        showToast('No user profile found matching that email.', 'error');
      } else if (data.password_mock === loginPassword.trim()) {
        setUser(data);
        showToast('Welcome back.', 'success');
        setCurrentTab('dashboard');
      } else {
        showToast('Invalid access password.', 'error');
      }
    } catch (err) {
      showToast('Connection handshake rejected.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterWorker = async (e: React.FormEvent) => {
    e.preventDefault();
    const securePasswordTemplate = 'LU-' + Math.random().toString(36).substring(2, 8).toUpperCase() + '!';
    try {
      const extendedNotesJson = JSON.stringify({ phone: workerPhone.trim(), notes: workerNotes.trim() });
      const { error } = await supabase.from('profiles').insert([
        {
          email: workerEmail.trim(),
          full_name: workerName.trim(),
          role: 'support_worker',
          password_mock: securePasswordTemplate,
          notes: extendedNotesJson
        }
      ]);
      if (error) throw error;
      setGeneratedPassword(securePasswordTemplate);
      showToast(`Account for ${workerName} initialized safely!`, 'success');
      setWorkerName('');
      setWorkerEmail('');
      setWorkerPhone('');
      setWorkerNotes('');
      fetchCoreData();
    } catch (err: any) {
      showToast(err.message || 'Could not insert support worker.', 'error');
    }
  };

  const handleRegisterParticipant = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from('participants').insert([
        {
          name: partName.trim(),
          ndis_number: partNdis.trim(),
          primary_contact_phone: partPhone.trim(),
          emergency_contact_name: partEmergName.trim(),
          emergency_contact_phone: partEmergPhone.trim(),
          about_me_notes: partNotes.trim()
        }
      ]);
      if (error) throw error;
      showToast(`Participant profile for ${partName} registered!`, 'success');
      setPartName('');
      setPartNdis('');
      setPartPhone('');
      setPartEmergName('');
      setPartEmergPhone('');
      setPartNotes('');
      fetchCoreData();
    } catch (err: any) {
      showToast(err.message || 'Error executing participant addition.', 'error');
    }
  };

  const handleCreateShift = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const startIso = `${shiftDate}T${shiftStart}:00`;
      const endIso = `${shiftDate}T${shiftEnd}:00`;
      const { error } = await supabase.from('shifts').insert([
        {
          title: shiftTitle.trim() || 'Standard Roster Care Block',
          staff_id: shiftWorkerId ? shiftWorkerId : null,
          participant_id: shiftParticipantId ? shiftParticipantId : null,
          start_time: startIso,
          end_time: endIso,
          manager_directives: shiftDirectives.trim(),
          status: shiftWorkerId ? 'scheduled' : 'available'
        }
      ]);
      if (error) throw error;
      showToast('Shift deployed to calendar view!', 'success');
      setShiftTitle('');
      setShiftDirectives('');
      setShiftDate('');
      setShiftStart('');
      setShiftEnd('');
      fetchCoreData();
    } catch (err: any) {
      showToast(err.message || 'Database rejected shift allocation structure.', 'error');
    }
  };

  const handleClaimUnclaimedShift = async (id: string) => {
    try {
      const { error } = await supabase
        .from('shifts')
        .update({ staff_id: user.id, status: 'scheduled' })
        .eq('id', id);
      if (error) throw error;
      showToast('Shift assigned cleanly onto your staff roster!', 'success');
      fetchCoreData();
    } catch (err) {
      showToast('Error binding authorization to shift item.', 'error');
    }
  };

  const addTimesheetRow = () => {
    setTimesheetRows([...timesheetRows, { date: '', start: '', end: '', client: '', kmWith: '0', kmWithout: '0', notes: '' }]);
  };

  const updateTimesheetRowValue = (index: number, field: string, value: string) => {
    const updated = [...timesheetRows];
    updated[index][field] = value;
    setTimesheetRows(updated);
  };

  const handleStackedTimesheetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tsNotesChecked) {
      showToast('Verification checkbox acknowledgment is required.', 'error');
      return;
    }
    const payloadId = 'REM-' + Math.random().toString(36).substring(2, 6).toUpperCase();
    let computedHoursTotal = 0;
    timesheetRows.forEach(r => {
      if (r.start && r.end) {
        const sh = parseInt(r.start.split(':')[0]);
        const eh = parseInt(r.end.split(':')[0]);
        computedHoursTotal += Math.max(0, eh - sh);
      }
    });

    const masterLogBlock = {
      id: payloadId,
      fortnightId: selectedFortnight,
      fortnightLabel: fortnights.find(f => f.id === selectedFortnight)?.label || selectedFortnight,
      rowsCount: timesheetRows.length,
      totalHours: computedHoursTotal,
      submittedDate: new Date().toLocaleDateString('en-AU')
    };

    setTimesheetHistory([masterLogBlock, ...timesheetHistory]);
    showToast('Fortnightly timesheet packet filed securely!', 'success');
    setTimesheetRows([{ date: '', start: '', end: '', client: '', kmWith: '0', kmWithout: '0', notes: '' }]);
    setTsNotesChecked(false);
  };

  const updateAvailabilityMode = (day: string, mode: 'standard' | 'allday' | 'unavailable') => {
    const updated = { ...availDaysState };
    updated[day].mode = mode;
    if (mode === 'allday') { updated[day].start = '00:00'; updated[day].end = '23:59'; }
    if (mode === 'unavailable') { updated[day].start = ''; updated[day].end = ''; }
    setAvailDaysState(updated);
  };

  const updateAvailabilityTimes = (day: string, field: 'start' | 'end', val: string) => {
    const updated = { ...availDaysState };
    updated[day][field] = val;
    setAvailDaysState(updated);
  };

  const handleStackedAvailabilitySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const uniqueLogId = 'AV-' + Date.now().toString().substring(8);
    const submissionItem = {
      id: uniqueLogId,
      fortnightId: availFortnight,
      fortnightLabel: fortnights.find(f => f.id === availFortnight)?.label || availFortnight,
      matrix: { ...availDaysState },
      submittedAt: new Date().toLocaleDateString('en-AU')
    };
    const newHistory = [submissionItem, ...availabilitySubmissions];
    setAvailabilitySubmissions(newHistory);
    await supabase.from('profiles').update({ notes: JSON.stringify(newHistory) }).eq('id', user.id);
    showToast('Fortnightly availabilities synchronized successfully!', 'success');
  };

  const getWorkerIndexColor = (id: string) => {
    const idx = profiles.filter(p => p.role === 'support_worker').findIndex(p => p.id === id);
    return workerColors[idx % workerColors.length] || 'border-slate-700 bg-slate-900 text-slate-400';
  };

  const getClientIndexColor = (id: string) => {
    const idx = participants.findIndex(p => p.id === id);
    return clientColors[idx % clientColors.length] || 'border-slate-700 bg-slate-900 text-slate-400';
  };

  const workerList = profiles.filter(p => p.role === 'support_worker');
  const userAllocatedHoursSum = shifts.filter(s => s.staff_id === user.id).length * 8;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col antialiased font-sans selection:bg-sky-500/30">
      
      <header className="bg-slate-900 border-b border-slate-800/80 px-6 py-4 flex items-center justify-between sticky top-0 z-40 backdrop-blur shadow-xl">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 relative flex items-center justify-center rounded-xl bg-slate-950 border border-slate-800 p-1 shadow-inner">
            <img 
              src="/logo.png" 
              alt={"LU Logo"} 
              className="max-h-full max-w-full object-contain rounded-lg"
              onError={(e)=>{ (e.target as HTMLImageElement).src = 'https://wgtcvmyofcoikynyftwn.supabase.co/storage/v1/object/public/assets/logo-fallback.png'; }}
            />
          </div>
          <div>
            <span className="font-black text-base tracking-tight block bg-gradient-to-r from-slate-100 to-slate-300 bg-clip-text text-transparent">LIFE UNBOUND SUPPORT</span>
            <span className="text-[9px] text-sky-400 font-bold tracking-widest uppercase">Internal Operations Portal</span>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          {user && (
            <div className="text-right hidden sm:block">
              <span className="block text-xs font-black text-slate-200 uppercase tracking-wide">{user.full_name}</span>
              <span className="block text-[10px] font-mono text-slate-500">{user.email}</span>
            </div>
          )}
          {user && (
            <button 
              onClick={() => setUser(null)}
              className="bg-slate-950 hover:bg-rose-950/20 hover:text-rose-400 border border-slate-800 hover:border-rose-900/50 text-[10px] font-black uppercase tracking-wider px-3 py-2 rounded-xl transition-all shadow-md active:scale-95"
            >
              Exit Suite
            </button>
          )}
        </div>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row">
        
        {user && (
          <aside className="w-full lg:w-64 bg-slate-900/40 lg:border-r border-slate-800/60 p-4 space-y-1.5 flex flex-row lg:flex-col overflow-x-auto lg:overflow-x-visible items-center lg:items-stretch shadow-2xl">
            <button 
              onClick={() => setCurrentTab('dashboard')}
              className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border flex items-center space-x-3 whitespace-nowrap ${currentTab === 'dashboard' ? 'bg-sky-500/10 text-sky-400 border-sky-500/30 shadow-lg shadow-sky-500/5' : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200 border-transparent'}`}
            >
              📊 Dashboards
            </button>
            {user.role === 'director' && (
              <button 
                onClick={() => setCurrentTab('director')}
                className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border flex items-center space-x-3 whitespace-nowrap ${currentTab === 'director' ? 'bg-sky-500/10 text-sky-400 border-sky-500/30 shadow-lg shadow-sky-500/5' : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200 border-transparent'}`}
              >
                👑 Admin Centre
              </button>
            )}
            <button 
              onClick={() => setCurrentTab('rosters')}
              className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border flex items-center space-x-3 whitespace-nowrap ${currentTab === 'rosters' ? 'bg-sky-500/10 text-sky-400 border-sky-500/30 shadow-lg shadow-sky-500/5' : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200 border-transparent'}`}
            >
              📅 Calendar
            </button>
            <button 
              onClick={() => setCurrentTab('profiles')}
              className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border flex items-center space-x-3 whitespace-nowrap ${currentTab === 'profiles' ? 'bg-sky-500/10 text-sky-400 border-sky-500/30 shadow-lg shadow-sky-500/5' : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200 border-transparent'}`}
            >
              👥 Participant Profiles
            </button>
            <div className="h-px bg-slate-800/80 my-2 hidden lg:block" />
            <button 
              onClick={() => setCurrentTab('availability')}
              className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border flex items-center space-x-3 whitespace-nowrap ${currentTab === 'availability' ? 'bg-sky-500/10 text-sky-400 border-sky-500/30' : 'text-slate-500 hover:bg-slate-900 hover:text-slate-300 border-transparent'}`}
            >
              ⏱️ Availabilities
            </button>
            <button 
              onClick={() => setCurrentTab('timesheets')}
              className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border flex items-center space-x-3 whitespace-nowrap ${currentTab === 'timesheets' ? 'bg-sky-500/10 text-sky-400 border-sky-500/30' : 'text-slate-500 hover:bg-slate-900 hover:text-slate-300 border-transparent'}`}
            >
              📝 Timesheet Submissions
            </button>
          </aside>
        )}

        <main className="flex-1 p-6 sm:p-8 overflow-y-auto w-full mx-auto max-w-7xl">
          
          {notification && (
            <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 max-w-sm w-full px-4">
              <div className={`p-4 rounded-xl border text-xs font-bold shadow-2xl flex items-center space-x-2 bg-slate-900 ${notification.type === 'success' ? 'border-sky-500 text-sky-400' : 'border-rose-500 text-rose-400'}`}>
                <span>⚡</span><span>{notification.message}</span>
              </div>
            </div>
          )}

          {!user && (
            <div className="max-w-md mx-auto my-12 bg-slate-900 border border-slate-800 shadow-2xl rounded-2xl p-8 space-y-6">
              <div className="text-center space-y-1">
                <h2 className="text-xl font-black tracking-tight text-slate-100 uppercase">Authorize Portal Gateway</h2>
                <p className="text-xs text-slate-400 font-medium">Life Unbound Operations Control System</p>
              </div>
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-[9px] font-bold tracking-widest text-slate-400 uppercase mb-1">Corporate Email Address</label>
                  <input 
                    type="email" required placeholder="name@lifeunboundsupport.com.au" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-bold tracking-widest text-slate-400 uppercase mb-1">Access Security Password</label>
                  <input 
                    type="password" required placeholder="••••••••••••" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
                  />
                </div>
                <button type="submit" disabled={loading} className="w-full bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-xs uppercase tracking-wider py-3.5 rounded-xl shadow-lg shadow-sky-500/10 transform active:scale-95 transition-all">
                  Authorize Secure Access Session
                </button>
              </form>
            </div>
          )}

          {user && (
            <div className="space-y-6">
              
              {currentTab === 'dashboard' && (
                <div className="space-y-6">
                  <div className="border-b border-slate-800 pb-4">
                    <h2 className="text-lg font-black uppercase tracking-wide">Dashboards</h2>
                    <p className="text-xs text-slate-400">Real-time summary tracking parameters across active support lines.</p>
                  </div>

                  {user.role === 'support_worker' ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between shadow-xl relative overflow-hidden">
                        <div className="space-y-1">
                          <span className="text-[10px] font-black tracking-widest text-sky-400 uppercase block">My Fortnight Hours</span>
                          <h3 className="text-2xl font-black tracking-tight text-slate-100">{userAllocatedHoursSum} Hours</h3>
                          <p className="text-xs text-slate-400">Total care provider hours scheduled and allocated for your current active fortnight cycle.</p>
                        </div>
                        <div className="w-full bg-slate-950 h-2 rounded-full mt-6 overflow-hidden border border-slate-850">
                          <div className="bg-sky-400 h-full w-2/5 rounded-full" />
                        </div>
                      </div>
                      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:col-span-2 space-y-3 shadow-xl">
                        <h4 className="text-xs font-black tracking-wider text-slate-300 uppercase">My Next Shifts Mapped</h4>
                        <div className="space-y-2">
                          {shifts.filter(s => s.staff_id === user.id).slice(0, 2).map(s => {
                            const clientObj = participants.find(p => p.id === s.participant_id);
                            return (
                              <div key={s.id} className="bg-slate-950 p-4 rounded-xl border border-slate-850 flex items-center justify-between">
                                <div className="space-y-0.5">
                                  <span className="font-bold text-xs text-slate-200 block uppercase tracking-wide">{s.title}</span>
                                  <span className="text-[11px] font-mono text-slate-400 block">Date: {new Date(s.start_time).toLocaleDateString('en-AU')} | Client: {clientObj ? clientObj.name : 'Internal Admin'}</span>
                                </div>
                                <span className="text-[10px] bg-sky-500/10 border border-sky-500/20 text-sky-400 px-3 py-1 rounded-lg font-bold font-mono">
                                  {new Date(s.start_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
                          <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Active Workforce Panel</span>
                          <span className="text-xl font-black text-slate-100 block tracking-tight">{profiles.length} Verified Users</span>
                        </div>
                        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
                          <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Registered Client Accounts</span>
                          <span className="text-xl font-black text-slate-100 block tracking-tight">{participants.length} Active Records</span>
                        </div>
                        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
                          <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Unassigned Shifts Metric</span>
                          <span className="text-xl font-black text-rose-400 block tracking-tight">{shifts.filter(s => s.status === 'available' || !s.staff_id).length} Red Alerts</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {currentTab === 'director' && user.role === 'director' && (
                <div className="space-y-6">
                  <div className="border-b border-slate-800 pb-4">
                    <h2 className="text-lg font-black uppercase tracking-wide">Admin Centre</h2>
                    <p className="text-xs text-slate-400">Onboard support staff, create client profiles, and coordinate framework metadata fields.</p>
                  </div>

                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
                      <h3 className="text-xs font-black tracking-widest text-sky-400 uppercase">Register Support Worker</h3>
                      <form onSubmit={handleRegisterWorker} className="space-y-3">
                        <div>
                          <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Full Legal Name</label>
                          <input 
                            type="text" required value={workerName} onChange={(e) => setWorkerName(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
                            placeholder="Mitchell Andrews"
                          />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Contact Email Address</label>
                            <input 
                              type="email" required value={workerEmail} onChange={(e) => setWorkerEmail(e.target.value)}
                              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
                              placeholder="worker@lifeunboundsupport.com.au"
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Contact Phone Number</label>
                            <input 
                              type="text" required value={workerPhone} onChange={(e) => setWorkerPhone(e.target.value)}
                              className="w-full bg-slate-955 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
                              placeholder="0412 345 678"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Internal Onboarding & Audit Notes</label>
                          <textarea 
                            value={workerNotes} onChange={(e) => setWorkerNotes(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-sky-500 h-16 resize-none"
                            placeholder="Log onboarding tokens, orientation notes..."
                          />
                        </div>
                        <button type="submit" className="w-full bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-xs uppercase tracking-wider py-3 rounded-xl transition-all shadow-md">
                          Generate Profile row & Access Tokens
                        </button>
                      </form>

                      {generatedPassword && (
                        <div className="p-4 bg-sky-500/5 border border-sky-500/20 rounded-xl space-y-1">
                          <span className="block text-[9px] font-bold text-sky-400 uppercase tracking-widest">Access Key Created:</span>
                          <p className="text-xs font-mono font-bold text-slate-100 bg-slate-950 p-2 rounded border border-slate-850 mt-1 select-all">Password: {generatedPassword}</p>
                        </div>
                      )}
                    </div>

                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
                      <h3 className="text-xs font-black tracking-widest text-sky-400 uppercase">Register Participant Account</h3>
                      <form onSubmit={handleRegisterParticipant} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="sm:col-span-2">
                          <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Participant Full Identity Name</label>
                          <input 
                            type="text" required value={partName} onChange={(e) => setPartName(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
                            placeholder="Cameron Davies"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">NDIS Number ID Reference</label>
                          <input 
                            type="text" required value={partNdis} onChange={(e) => setPartNdis(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
                            placeholder="430900111"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Primary Telephone Contact</label>
                          <input 
                            type="text" required value={partPhone} onChange={(e) => setPartPhone(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
                            placeholder="0400 999 111"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Emergency Representative Name</label>
                          <input 
                            type="text" required value={partEmergName} onChange={(e) => setPartEmergName(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
                            placeholder="Guardian / Family Liaison"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Emergency Liaison Phone</label>
                          <input 
                            type="text" required value={partEmergPhone} onChange={(e) => setPartEmergPhone(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
                            placeholder="0400 555 444"
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Strategic Care Notes & Support Parameters</label>
                          <textarea 
                            value={partNotes} onChange={(e) => setPartNotes(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-sky-500 h-16 resize-none"
                            placeholder="Detail triggers, goal structures, communication keys..."
                          />
                        </div>
                        <button type="submit" className="sm:col-span-2 bg-slate-950 border border-slate-800 text-slate-300 hover:text-slate-100 hover:border-slate-700 font-bold text-xs uppercase tracking-wider py-2.5 rounded-xl transition-all transform active:scale-95">
                          Commit Participant Card to Cloud Registry
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              )}

              {currentTab === 'rosters' && (
                <div className="space-y-6">
                  <div className="border-b border-slate-800 pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <h2 className="text-lg font-black uppercase tracking-wide">Calendar</h2>
                      <p className="text-xs text-slate-400">Isolate workflows via dropdown tracks, track unallocated slots highlighted in red, and deploy new shifts inline.</p>
                    </div>
                    <div className="bg-slate-900 border border-slate-800 p-1 rounded-xl flex space-x-1">
                      {['day', 'week', 'month'].map(v => (
                        <button 
                          key={v} onClick={() => setCalendarView(v)}
                          className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all ${calendarView === v ? 'bg-sky-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
                        >
                          {v}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 shadow-xl">
                    <div>
                      <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Calendar Category Dropdown</label>
                      <select 
                        value={calendarScope} 
                        onChange={(e) => { setCalendarScope(e.target.value); setSelectedCalendarTargetId(''); }}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-sky-500"
                      >
                        <option value="combined">🌐 Combined Calendar (Full Matrix View)</option>
                        <option value="admin">💼 Admin Calendar (Internal Operations)</option>
                        <option value="worker">🧑‍💼 Staff Calendars (Isolate Employee)</option>
                        <option value="participant">👥 Participant Calendars (Isolate Client)</option>
                      </select>
                    </div>

                    {calendarScope === 'worker' && (
                      <div>
                        <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Select Employee Profile</label>
                        <select 
                          value={selectedCalendarTargetId} onChange={(e) => setSelectedCalendarTargetId(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-sky-400 focus:outline-none focus:border-sky-500 font-bold"
                        >
                          <option value="">-- Choose Staff Member --</option>
                          {workerList.map(w => (
                            <option key={w.id} value={w.id}>{w.full_name}</option>
                          ))}
                        </select>
                      </div>
                    )}

                    {calendarScope === 'participant' && (
                      <div>
                        <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Select Participant Profile</label>
                        <select 
                          value={selectedCalendarTargetId} onChange={(e) => setSelectedCalendarTargetId(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-emerald-400 focus:outline-none focus:border-sky-500 font-bold"
                        >
                          <option value="">-- Choose Client Profile --</option>
                          {participants.map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>

                  {user.role === 'director' && (
                    <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl space-y-3">
                      <h4 className="text-xs font-black tracking-widest text-sky-400 uppercase">➕ Quick Allocate New Shift Inline</h4>
                      <form onSubmit={handleCreateShift} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                        <input type="text" required placeholder="Activity Summary" value={shiftTitle} onChange={(e) => setShiftTitle(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs focus:border-sky-500 outline-none" />
                        <select value={shiftWorkerId} onChange={(e) => setShiftWorkerId(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs focus:border-sky-500 outline-none">
                          <option value="">Unclaimed Roster</option>
                          {workerList.map(w => <option key={w.id} value={w.id}>{w.full_name}</option>)}
                        </select>
                        <select value={shiftParticipantId} onChange={(e) => setShiftParticipantId(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs focus:border-sky-500 outline-none">
                          <option value="">Corporate Admin</option>
                          {participants.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                        <input type="date" required value={shiftDate} onChange={(e) => setShiftDate(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs focus:border-sky-500 outline-none" />
                        <input type="time" required value={shiftStart} onChange={(e) => setShiftStart(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs focus:border-sky-500 outline-none" />
                        <input type="time" required value={shiftEnd} onChange={(e) => setShiftEnd(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs focus:border-sky-500 outline-none" />
                        <div className="sm:col-span-2 md:col-span-3 lg:col-span-5">
                          <input type="text" placeholder="Manager Shift Directive Reminders..." value={shiftDirectives} onChange={(e) => setShiftDirectives(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs focus:border-sky-500 outline-none" />
                        </div>
                        <button type="submit" className="w-full bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-xs uppercase rounded-xl tracking-wider py-2 transition-all shadow-md transform active:scale-95">Deploy</button>
                      </form>
                    </div>
                  )}

                  <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
                    <div className="p-4 sm:p-6 space-y-3">
                      {shifts
                        .filter(s => {
                          if (calendarScope === 'admin') return !s.participant_id;
                          if (calendarScope === 'worker' && selectedCalendarTargetId) return s.staff_id === selectedCalendarTargetId;
                          if (calendarScope === 'participant' && selectedCalendarTargetId) return s.participant_id === selectedCalendarTargetId;
                          return true;
                        })
                        .map(s => {
                          const isUnclaimed = !s.staff_id || s.status === 'available';
                          const workerMapDetails = profiles.find(p => p.id === s.staff_id);
                          const clientMapDetails = participants.find(p => p.id === s.participant_id);
                          
                          const colorThemeClass = isUnclaimed 
                            ? 'border-rose-500 bg-rose-950/10 text-rose-400 shadow shadow-rose-950/20' 
                            : s.participant_id 
                              ? getClientIndexColor(s.participant_id) 
                              : getWorkerIndexColor(s.staff_id);

                          return (
                            <div key={s.id} className={`border rounded-xl p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4 transition-all ${colorThemeClass}`}>
                              <div className="space-y-1">
                                <div className="flex items-center space-x-2">
                                  <span className={`w-2 h-2 rounded-full ${isUnclaimed ? 'bg-rose-500 animate-pulse' : 'bg-current'}`} />
                                  <h4 className="font-bold text-sm uppercase tracking-wide text-slate-100">{s.title}</h4>
                                  {isUnclaimed && <span className="text-[9px] font-black tracking-widest bg-rose-500 text-slate-950 px-2 py-0.5 rounded uppercase">Unassigned</span>}
                                </div>
                                <p className="text-[11px] opacity-90 font-mono">
                                  📅 {new Date(s.start_time).toLocaleDateString('en-AU')} | ⏱️ {new Date(s.start_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - {new Date(s.end_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                </p>
                                <div className="flex flex-wrap gap-2 text-[10px] pt-1">
                                  <span>Staff: <strong>{workerMapDetails ? workerMapDetails.full_name : 'None Assigned'}</strong></span>
                                  <span>Participant: <strong>{clientMapDetails ? clientMapDetails.name : 'Corporate Admin'}</strong></span>
                                </div>
                                {s.manager_directives && <p className="mt-2 bg-slate-950/40 p-2 rounded text-xs italic border-l border-slate-700 text-slate-300">💡 Instruction: {s.manager_directives}</p>}
                              </div>
                              {isUnclaimed && user.role === 'support_worker' && (
                                <button onClick={() => handleClaimUnclaimedShift(s.id)} className="bg-rose-600 hover:bg-rose-500 text-slate-950 font-black text-xs uppercase tracking-wider px-4 py-2.5 rounded-xl transition-all transform active:scale-95 shadow">Claim</button>
                              )}
                            </div>
                          );
                        })}
                    </div>
                  </div>
                </div>
              )}

              {currentTab === 'profiles' && (
                <div className="space-y-6">
                  <div className="border-b border-slate-800 pb-4">
                    <h2 className="text-lg font-black uppercase tracking-wide">Participant Profiles</h2>
                    <p className="text-xs text-slate-400">Review critical compliance dockets and behavior support frameworks.</p>
                  </div>

                  <div className="space-y-2">
                    {participants.map(p => {
                      const isItemOpen = expandedClient === p.id;
                      return (
                        <div key={p.id} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl transition-all">
                          <div onClick={() => setExpandedClient(isItemOpen ? null : p.id)} className="p-5 flex items-center justify-between cursor-pointer hover:bg-slate-850/60 transition-all select-none">
                            <div className="flex items-center space-x-3">
                              <div className="w-2.5 h-2.5 rounded-full bg-sky-400" />
                              <h3 className="font-black text-xs uppercase tracking-wider text-slate-200">{p.name}</h3>
                            </div>
                            <span className="text-sm font-bold text-sky-400">{isItemOpen ? '▲' : '▼'}</span>
                          </div>

                          {isItemOpen && (
                            <div className="p-6 bg-slate-950/60 border-t border-slate-850 space-y-5">
                              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                <div className="bg-slate-950 p-4 rounded-xl border border-slate-850">
                                  <span className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">Primary Telephone Contact</span>
                                  <p className="text-xs font-mono font-bold text-slate-200">{p.primary_contact_phone || 'Unlisted/Null'}</p>
                                </div>
                                <div className="bg-slate-950 p-4 rounded-xl border border-slate-850">
                                  <span className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">NDIS Identity Key Code</span>
                                  <p className="text-xs font-mono font-bold text-slate-200">{p.ndis_number || 'Unlisted/Null'}</p>
                                </div>
                                <div className="bg-slate-950 p-4 rounded-xl border border-slate-850">
                                  <span className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">Emergency Representative Liaison</span>
                                  <p className="text-xs font-bold text-slate-200 uppercase">{p.emergency_contact_name || 'Not Logged'}</p>
                                  <span className="text-[11px] font-mono text-sky-400">{p.emergency_contact_phone || ''}</span>
                                </div>
                              </div>
                              <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-1">
                                <span className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest">Care Directives Summary notes</span>
                                <p className="text-xs text-slate-300 font-medium leading-relaxed">{p.about_me_notes || 'No notes attached.'}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {currentTab === 'availability' && (
                <div className="space-y-6">
                  <div className="border-b border-slate-800 pb-4">
                    <h2 className="text-lg font-black uppercase tracking-wide">Availabilities</h2>
                    <p className="text-xs text-slate-400">Lock and update your complete fortnightly scheduling parameters all at once.</p>
                  </div>
                  <form onSubmit={handleStackedAvailabilitySubmit} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-2xl">
                    <div className="max-w-xs">
                      <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Target Payroll Fortnight Cycle</label>
                      <select value={availFortnight} onChange={(e) => setAvailFortnight(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-sky-400 font-bold outline-none">
                        {fortnights.map(f => <option key={f.id} value={f.id}>{f.label}</option>)}
                      </select>
                    </div>
                    <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950 divide-y divide-slate-850">
                      {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => {
                        const state = availDaysState[day];
                        return (
                          <div key={day} className="p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-slate-900/40 hover:bg-slate-900/70 transition-all">
                            <span className="text-xs font-black uppercase tracking-wider text-slate-300 w-28">{day}</span>
                            <div className="flex flex-wrap gap-3 items-center">
                              {['standard', 'allday', 'unavailable'].map(m => (
                                <button key={m} type="button" onClick={() => updateAvailabilityMode(day, m as any)} className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border transition-all ${state.mode === m ? 'bg-sky-500/10 border-sky-500 text-sky-400' : 'bg-slate-950 border-slate-800 text-slate-500'}`}>{m === 'standard' ? 'Specific Hours' : m === 'allday' ? 'All Day Available' : 'Unavailable'}</button>
                              ))}
                            </div>
                            {state.mode === 'standard' && (
                              <div className="flex items-center space-x-2">
                                <input type="time" value={state.start} onChange={(e) => updateAvailabilityTimes(day, 'start', e.target.value)} className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-xs text-slate-200 outline-none" />
                                <span className="text-xs text-slate-500 font-mono">TO</span>
                                <input type="time" value={state.end} onChange={(e) => updateAvailabilityTimes(day, 'end', e.target.value)} className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-xs text-slate-200 outline-none" />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    <button type="submit" className="w-full bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-xs uppercase py-3.5 rounded-xl shadow-md transition-all transform active:scale-95">Submit Availabilities Block</button>
                  </form>
                </div>
              )}

              {currentTab === 'timesheets' && (
                <div className="space-y-6">
                  <div className="border-b border-slate-800 pb-4">
                    <h2 className="text-lg font-black uppercase tracking-wide">Timesheet Submissions</h2>
                    <p className="text-xs text-slate-400">File stacked hour structures at the end of your fortnight period for compliance remittance mapping.</p>
                  </div>
                  <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 xl:col-span-2 space-y-4 shadow-xl">
                      <form onSubmit={handleStackedTimesheetSubmit} className="space-y-4">
                        <div className="max-w-xs">
                          <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Payroll Fortnight Range</label>
                          <select value={selectedFortnight} onChange={(e) => setSelectedFortnight(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-sky-400 font-bold outline-none">
                            {fortnights.map(f => <option key={f.id} value={f.id}>{f.label}</option>)}
                          </select>
                        </div>
                        <div className="space-y-3">
                          {timesheetRows.map((row, idx) => (
                            <div key={idx} className="p-4 bg-slate-950 border border-slate-850 rounded-xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                              <input type="date" required value={row.date} onChange={(e) => updateTimesheetRowValue(idx, 'date', e.target.value)} className="bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 outline-none" />
                              <div className="grid grid-cols-2 gap-1">
                                <input type="time" required value={row.start} onChange={(e) => updateTimesheetRowValue(idx, 'start', e.target.value)} className="bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 outline-none" />
                                <input type="time" required value={row.end} onChange={(e) => updateTimesheetRowValue(idx, 'end', e.target.value)} className="bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 outline-none" />
                              </div>
                              <select required value={row.client} onChange={(e) => updateTimesheetRowValue(idx, 'client', e.target.value)} className="bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-400 outline-none">
                                <option value="">-- Choose Participant --</option>
                                {participants.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                              </select>
                              <div className="grid grid-cols-2 gap-1">
                                <input type="number" placeholder="KM Client" value={row.kmWith} onChange={(e) => updateTimesheetRowValue(idx, 'kmWith', e.target.value)} className="bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 outline-none" />
                                <input type="number" placeholder="KM Car" value={row.kmWithout} onChange={(e) => updateTimesheetRowValue(idx, 'kmWithout', e.target.value)} className="bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 outline-none" />
                              </div>
                              <input type="text" required placeholder="Shift note description metrics..." value={row.notes} onChange={(e) => updateTimesheetRowValue(idx, 'notes', e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 sm:col-span-2 lg:col-span-4 outline-none" />
                            </div>
                          ))}
                        </div>
                        <button type="button" onClick={addTimesheetRow} className="bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700 text-[10px] font-black uppercase tracking-wider px-4 py-2.5 rounded-xl">➕ Add Shift Row to Fortnight Stack</button>
                        <div className="flex items-start space-x-3 bg-slate-950 p-4 rounded-xl border border-slate-850">
                          <input type="checkbox" required id="notesCheck" checked={tsNotesChecked} onChange={(e) => setTsNotesChecked(e.target.checked)} className="w-4 h-4 mt-0.5 bg-slate-900 border border-slate-800 rounded accent-sky-500" />
                          <label htmlFor="notesCheck" className="text-[11px] text-slate-400 font-medium">I verify that my comprehensive shift case notes have been officially logged and filed across client management streams.</label>
                        </div>
                        <button type="submit" className="w-full bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-slate-950 font-black text-xs uppercase py-3.5 rounded-xl shadow-md transition-all transform active:scale-95">Transmit Fortnight Timesheet Remittance Package</button>
                      </form>
                    </div>
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 h-fit shadow-xl">
                      <h3 className="text-xs font-black tracking-widest text-slate-400 uppercase">Remittance History Log</h3>
                      <div className="space-y-2">
                        {timesheetHistory.map(ts => (
                          <div key={ts.id} className="bg-slate-950 p-4 rounded-xl border border-slate-850 text-xs">
                            <span className="font-mono text-sky-400 font-bold text-[10px] block border-b border-slate-850 pb-1 mb-1">REFPACK: #{ts.id}</span>
                            <p className="font-bold text-slate-200">{ts.fortnightLabel}</p>
                            <p className="text-slate-400 text-[11px]">Logged Volume: {ts.rowsCount} Days worked (~{ts.totalHours}h)</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>
          )}
        </main>
      </div>
    </div>
  );
}
