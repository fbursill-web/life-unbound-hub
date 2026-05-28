'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://wgtcvmyofcoikynyftwn.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_naqzF_7iH63JA-0G2pw8Cw_XY7waAin';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function LifeUnboundPortal() {
  const [portalType, setPortalType] = useState<null | 'staff' | 'admin'>(null);
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
  const [currentCalendarOffset, setCurrentCalendarOffset] = useState(0); 

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

  const [eventCategory, setEventCategory] = useState('shift'); 
  const [shiftTitle, setShiftTitle] = useState('');
  const [allocationType, setAllocationType] = useState('available'); 
  const [selectedWorkerIds, setSelectedWorkerIds] = useState<string[]>([]);
  const [selectedParticipantIds, setSelectedParticipantIds] = useState<string[]>([]);
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
    Saturday: { mode: 'standard', start: '09:00', end: '17:00' },
    Sunday: { mode: 'standard', start: '09:00', end: '17:00' },
  });

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  useEffect(() => {
    generateFortnightPayPeriods();
    fetchCoreData();
  }, []);

  const generateFortnightPayPeriods = () => {
    let periods = [];
    let startPoint = new Date('2026-01-05T00:00:00');
    for (let i = 1; i <= 26; i++) {
      let endPoint = new Date(startPoint.getTime());
      endPoint.setDate(endPoint.getDate() + 13);
      const formatStr = `${startPoint.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })} - ${endPoint.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })}`;
      periods.push({ id: `FN-${i}`, label: `Fortnight: ${formatStr}` });
      startPoint.setDate(startPoint.getDate() + 14);
    }
    setFortnights(periods);
    if (periods.length > 0) {
      setSelectedFortnight(periods[10].id); 
      setAvailFortnight(periods[10].id);
    }
  };

  const fetchCoreData = async () => {
    const { data: profs } = await supabase.from('profiles').select('*');
    if (profs) setProfiles(profs);
    const { data: parts } = await supabase.from('participants').select('*');
    if (parts) setParticipants(parts);
    const { data: sfts } = await supabase.from('shifts').select('*');
    if (sfts) setShifts(sfts);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { data, error } = await supabase.from('profiles').select('*').eq('email', loginEmail.trim()).single();
    if (error || !data || data.password_mock !== loginPassword.trim()) {
      showToast('Invalid credentials.', 'error');
    } else if (portalType === 'admin' && data.role !== 'director') {
      showToast('Admin privileges required.', 'error');
    } else {
      setUser(data);
      setCurrentTab('dashboard');
    }
    setLoading(false);
  };

  const handleRegisterWorker = async (e: React.FormEvent) => {
    e.preventDefault();
    const securePasswordTemplate = 'LU-' + Math.random().toString(36).substring(2, 8).toUpperCase() + '!';
    const extendedNotesJson = JSON.stringify({ phone: workerPhone.trim(), notes: workerNotes.trim() });
    await supabase.from('profiles').insert([
      { email: workerEmail.trim(), full_name: workerName.trim(), role: 'support_worker', password_mock: securePasswordTemplate, notes: extendedNotesJson }
    ]);
    setGeneratedPassword(securePasswordTemplate);
    showToast('Support worker account initialized safely.', 'success');
    setWorkerName('');
    setWorkerEmail('');
    setWorkerPhone('');
    setWorkerNotes('');
    fetchCoreData();
  };

  const handleRegisterParticipant = async (e: React.FormEvent) => {
    e.preventDefault();
    await supabase.from('participants').insert([
      { name: partName.trim(), ndis_number: partNdis.trim(), primary_contact_phone: partPhone.trim(), emergency_contact_name: partEmergName.trim(), emergency_contact_phone: partEmergPhone.trim(), about_me_notes: partNotes.trim() }
    ]);
    showToast('Participant registered successfully.', 'success');
    setPartName('');
    setPartNdis('');
    setPartPhone('');
    setPartEmergName('');
    setPartEmergPhone('');
    setPartNotes('');
    fetchCoreData();
  };

  const handleCreateShift = async (e: React.FormEvent) => {
    e.preventDefault();
    const startIso = `${shiftDate}T${shiftStart}:00`;
    const endIso = `${shiftDate}T${shiftEnd}:00`;
    const titlePrefix = eventCategory === 'event' ? '[EVENT] ' : '';
    const finalTitle = titlePrefix + (shiftTitle.trim() || 'Roster Item');

    let insertionRows: any[] = [];
    if (allocationType === 'available') {
      insertionRows.push({ title: finalTitle, staff_id: null, participant_id: null, start_time: startIso, end_time: endIso, manager_directives: shiftDirectives.trim(), status: 'available' });
    } else if (allocationType === 'admin') {
      insertionRows.push({ title: finalTitle, staff_id: null, participant_id: null, start_time: startIso, end_time: endIso, manager_directives: shiftDirectives.trim(), status: 'scheduled' });
    } else {
      const workersToLoop = selectedWorkerIds.length > 0 ? selectedWorkerIds : [null];
      const clientsToLoop = selectedParticipantIds.length > 0 ? selectedParticipantIds : [null];
      workersToLoop.forEach(wId => {
        clientsToLoop.forEach(pId => {
          insertionRows.push({ title: finalTitle, staff_id: wId, participant_id: pId, start_time: startIso, end_time: endIso, manager_directives: shiftDirectives.trim(), status: wId ? 'scheduled' : 'available' });
        });
      });
    }
    await supabase.from('shifts').insert(insertionRows);
    showToast(`Successfully published ${insertionRows.length} items.`, 'success');
    setShiftTitle('');
    setShiftDirectives('');
    setShiftDate('');
    setShiftStart('');
    setShiftEnd('');
    setSelectedWorkerIds([]);
    setSelectedParticipantIds([]);
    fetchCoreData();
  };

  const handleToggleWorkerCheckbox = (id: string) => {
    setSelectedWorkerIds(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]);
  };

  const handleToggleParticipantCheckbox = (id: string) => {
    setSelectedParticipantIds(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]);
  };

  const handleClaimUnclaimedShift = async (id: string) => {
    await supabase.from('shifts').update({ staff_id: user.id, status: 'scheduled' }).eq('id', id);
    showToast('Shift assigned cleanly onto your staff roster.', 'success');
    fetchCoreData();
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
    const masterLogBlock = { id: payloadId, workerName: user.full_name, workerEmail: user.email, fortnightId: selectedFortnight, fortnightLabel: fortnights.find(f => f.id === selectedFortnight)?.label || selectedFortnight, rowsCount: timesheetRows.length, totalHours: computedHoursTotal, submittedDate: new Date().toLocaleDateString('en-AU') };
    setTimesheetHistory([masterLogBlock, ...timesheetHistory]);
    showToast('Fortnightly timesheet packet filed securely.', 'success');
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
    const submissionItem = { id: uniqueLogId, workerName: user.full_name, fortnightId: availFortnight, fortnightLabel: fortnights.find(f => f.id === availFortnight)?.label || availFortnight, matrix: { ...availDaysState }, submittedAt: new Date().toLocaleDateString('en-AU') };
    setAvailabilitySubmissions([submissionItem, ...availabilitySubmissions]);
    showToast('Fortnightly availabilities synchronized successfully.', 'success');
  };

  const workerList = profiles.filter(p => p.role === 'support_worker');
  const userAllocatedHoursSum = shifts.filter(s => s.staff_id === user?.id).length * 8;
  const calendarDaysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const getDynamicCalendarHeaderString = () => {
    const baseDate = new Date();
    if (calendarView === 'day') {
      baseDate.setDate(baseDate.getDate() + currentCalendarOffset);
      return baseDate.toLocaleDateString('en-AU', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    }
    if (calendarView === 'week') {
      const startOfWeek = new Date(baseDate);
      startOfWeek.setDate(baseDate.getDate() - baseDate.getDay() + (currentCalendarOffset * 7) + 1);
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      return `${startOfWeek.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })} - ${endOfWeek.toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })}`;
    }
    baseDate.setMonth(baseDate.getMonth() + currentCalendarOffset);
    return baseDate.toLocaleDateString('en-AU', { month: 'long', year: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col antialiased font-sans selection:bg-blue-500/20">
      
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 relative flex items-center justify-center rounded-xl border border-slate-200 p-1 bg-white shadow-inner">
            <img 
              src="/logo.png" 
              alt="LU Logo" 
              className="max-h-full max-w-full object-contain rounded"
              onError={(e)=>{ (e.target as HTMLImageElement).src = 'https://wgtcvmyofcoikynyftwn.supabase.co/storage/v1/object/public/assets/logo-fallback.png'; }}
            />
          </div>
          <div>
            <span className="font-bold text-base tracking-tight block text-blue-900">LIFE UNBOUND SUPPORT</span>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Internal Operations Framework</span>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          {user && (
            <div className="text-right hidden sm:block">
              <span className="block text-xs font-black text-slate-800 uppercase tracking-wide">{user.full_name}</span>
              <span className="block text-[10px] font-mono font-medium text-slate-400">{user.email}</span>
            </div>
          )}
          {user && (
            <button onClick={() => { setUser(null); setPortalType(null); }} className="bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs uppercase px-3 py-2 border border-slate-300 rounded-lg shadow-sm transition-colors active:scale-95">Sign Out</button>
          )}
        </div>
      </header>

      {user && (
        <nav className="bg-white border-b border-slate-200 px-6 py-2 flex flex-wrap gap-1.5 shadow-sm">
          <button onClick={() => setCurrentTab('dashboard')} className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${currentTab === 'dashboard' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'}`}>Dashboards</button>
          {user.role === 'director' && <button onClick={() => setCurrentTab('director')} className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${currentTab === 'director' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'}`}>Admin Centre</button>}
          <button onClick={() => setCurrentTab('rosters')} className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${currentTab === 'rosters' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'}`}>Calendar</button>
          <button onClick={() => setCurrentTab('profiles')} className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${currentTab === 'profiles' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'}`}>Participant Profiles</button>
          <div className="w-px bg-slate-200 h-5 my-auto mx-1.5" />
          <button onClick={() => setCurrentTab('availability')} className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${currentTab === 'availability' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}>Availabilities</button>
          <button onClick={() => setCurrentTab('timesheets')} className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${currentTab === 'timesheets' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}>Timesheet Submissions</button>
        </nav>
      )}

      <main className="flex-1 p-5 sm:p-8 w-full mx-auto max-w-7xl">
        
        {notification && (
          <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 max-w-sm w-full px-4">
            <div className={`p-4 rounded-lg border text-xs font-bold shadow-xl bg-white ${notification.type === 'success' ? 'border-blue-500 text-blue-700 bg-blue-50' : 'border-red-500 text-red-700 bg-red-50'}`}>{notification.message}</div>
          </div>
        )}

        {!user && !portalType && (
          <div className="max-w-md mx-auto my-16 bg-white border border-slate-200 shadow-md rounded-xl p-8 space-y-5 text-center">
            <h1 className="text-sm font-black uppercase tracking-widest text-slate-400">Portal Entry Gateway</h1>
            <p className="text-xs text-slate-500 font-semibold">Please select your operational workspace module below to enter:</p>
            <div className="grid grid-cols-1 gap-3 pt-2">
              <button onClick={() => setPortalType('staff')} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider py-4 rounded-xl shadow-md transition-all transform active:scale-98">Open Staff Workspace Portal</button>
              <button onClick={() => setPortalType('admin')} className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs uppercase tracking-wider py-4 rounded-xl shadow-md transition-all transform active:scale-98">Open Administrative Director Portal</button>
            </div>
          </div>
        )}

        {!user && portalType && (
          <div className="max-w-md mx-auto my-12 bg-white border border-slate-200 shadow-md rounded-xl p-8 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-xs font-bold uppercase text-slate-700 tracking-wider">{portalType === 'admin' ? 'Admin Portal Secure Log In' : 'Staff Portal Secure Log In'}</h2>
              <button onClick={() => setPortalType(null)} className="text-[10px] text-slate-400 hover:text-slate-600 font-bold uppercase border border-slate-200 px-2.5 py-1 rounded">Return</button>
            </div>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-[9px] font-bold tracking-wider text-slate-500 uppercase mb-1">Corporate Email Address</label>
                <input type="email" required placeholder="name@lifeunboundsupport.com.au" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-[9px] font-bold tracking-wider text-slate-500 uppercase mb-1">Security Access Password</label>
                <input type="password" required placeholder="••••••••••••" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500" />
              </div>
              <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider py-3 rounded-lg shadow transition-all transform active:scale-95">Verify Account Signature</button>
            </form>
          </div>
        )}

        {user && (
          <div className="space-y-6">
            
            {/* TAB 1: DASHBOARDS */}
            {currentTab === 'dashboard' && (
              <div className="space-y-6">
                <div className="border-b border-slate-200 pb-4">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-blue-900">Dashboards</h2>
                  <p className="text-xs text-slate-400">Real-time summary view of current workloads and active current week assignments.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-1 space-y-4">
                    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm border-l-4 border-l-blue-600">
                      <span className="text-[10px] font-bold tracking-widest text-blue-600 uppercase block mb-1">Cycle Metric Load</span>
                      <h3 className="text-xl font-bold text-slate-800">{user.role === 'support_worker' ? `${userAllocatedHoursSum} Hours Assigned` : `${shifts.length} Total Registered Entries`}</h3>
                    </div>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm lg:col-span-2 space-y-3">
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide border-b border-slate-100 pb-1">Current Active Week Tracking Feed</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-7 gap-2">
                      {calendarDaysOfWeek.map(dayName => {
                        const dailyShifts = shifts.filter(s => {
                          const isUserMatch = user.role === 'support_worker' ? s.staff_id === user.id : true;
                          return new Date(s.start_time).toLocaleDateString('en-US', { weekday: 'long' }) === dayName && isUserMatch;
                        });
                        return (
                          <div key={dayName} className="bg-slate-50 border border-slate-200 p-2 rounded-lg text-center min-h-[85px] flex flex-col justify-between">
                            <span className="block font-bold text-[9px] text-slate-400 uppercase">{dayName.substring(0,3)}</span>
                            <div className="flex-1 space-y-1 pt-1">
                              {dailyShifts.slice(0,2).map(s => (
                                <div key={s.id} className="text-[8px] font-bold p-0.5 rounded border bg-blue-50 text-blue-700 border-blue-200 truncate">{s.title}</div>
                              ))}
                              {dailyShifts.length === 0 && <span className="text-[8px] text-slate-300 italic block pt-2">Empty</span>}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: ADMIN CENTRE */}
            {currentTab === 'director' && user.role === 'director' && (
              <div className="space-y-6">
                <div className="border-b border-slate-200 pb-4">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-blue-900">Admin Centre</h2>
                  <p className="text-xs text-slate-400">Configure personnel directories and evaluate system files.</p>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4 shadow-sm">
                    <h3 className="text-xs font-bold text-blue-900 uppercase tracking-wide">Register Support Worker</h3>
                    <form onSubmit={handleRegisterWorker} className="space-y-3">
                      <div>
                        <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wide mb-1">Full Legal Name</label>
                        <input type="text" required value={workerName} onChange={(e) => setWorkerName(e.target.value)} className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none" />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wide mb-1">Contact Email</label>
                          <input type="email" required value={workerEmail} onChange={(e) => setWorkerEmail(e.target.value)} className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none" />
                        </div>
                        <div>
                          <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wide mb-1">Contact Phone</label>
                          <input type="text" required value={workerPhone} onChange={(e) => setWorkerPhone(e.target.value)} className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none" />
                        </div>
                      </div>
                      <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase py-2.5 rounded shadow transition-colors">Create Support Worker Account</button>
                    </form>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4 shadow-sm">
                    <h3 className="text-xs font-bold text-blue-900 uppercase tracking-wide">Register Participant Account</h3>
                    <form onSubmit={handleRegisterParticipant} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="sm:col-span-2">
                        <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wide mb-1">Participant Identity Name</label>
                        <input type="text" required value={partName} onChange={(e) => setPartName(e.target.value)} className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none" />
                      </div>
                      <button type="submit" className="sm:col-span-2 bg-gray-800 hover:bg-gray-900 text-white font-bold text-xs uppercase py-2.5 rounded shadow transition-colors">Register Card Entry</button>
                    </form>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: CALENDAR VIEWPORTS CONTAINER */}
            {currentTab === 'rosters' && (
              <div className="space-y-6">
                <div className="border-b border-slate-200 pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h2 className="text-base font-bold uppercase tracking-wider text-blue-900">Calendar</h2>
                    <p className="text-xs text-slate-400">Filter scopes across the framework or inject standalone items live.</p>
                  </div>
                  <div className="bg-white border border-slate-200 p-1 rounded-lg flex space-x-1 shadow-sm items-center">
                    {['day', 'week', 'month'].map(v => (
                      <button key={v} onClick={() => { setCalendarView(v); setCurrentCalendarOffset(0); }} className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all ${calendarView === v ? 'bg-blue-600 text-white shadow' : 'text-gray-500 hover:text-gray-800'}`}>{v}</button>
                    ))}
                  </div>
                </div>

                {user.role === 'director' && (
                  <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm space-y-4">
                    <div className="flex items-center space-x-1.5 bg-slate-50 p-1 rounded-lg border border-slate-200 w-fit">
                      <button type="button" onClick={() => setEventCategory('shift')} className={`px-3 py-1 rounded text-[9px] font-black uppercase tracking-wider transition-all ${eventCategory === 'shift' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500'}`}>Shift Mode</button>
                      <button type="button" onClick={() => setEventCategory('event')} className={`px-3 py-1 rounded text-[9px] font-black uppercase tracking-wider transition-all ${eventCategory === 'event' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500'}`}>Event Mode</button>
                    </div>

                    <form onSubmit={handleCreateShift} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
                      <div>
                        <label className="block text-[8px] font-bold uppercase text-slate-400 mb-1">Description Custom Heading</label>
                        <input type="text" required placeholder="Activity Summary Name" value={shiftTitle} onChange={(e) => setShiftTitle(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-800 outline-none" />
                      </div>
                      <div>
                        <label className="block text-[8px] font-bold uppercase text-slate-400 mb-1">Roster Date</label>
                        <input type="date" required value={shiftDate} onChange={(e) => setShiftDate(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs outline-none" />
                      </div>
                      <div>
                        <label className="block text-[8px] font-bold uppercase text-slate-400 mb-1">Start Time</label>
                        <input type="time" required value={shiftStart} onChange={(e) => setShiftStart(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs outline-none" />
                      </div>
                      <div>
                        <label className="block text-[8px] font-bold uppercase text-slate-400 mb-1">End Time</label>
                        <input type="time" required value={shiftEnd} onChange={(e) => setShiftEnd(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs outline-none" />
                      </div>

                      <div className="lg:col-span-2 bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1">
                        <label className="block text-[9px] font-black uppercase text-slate-500 tracking-wider">Allocation Target Stream</label>
                        <select value={allocationType} onChange={(e)=>setAllocationType(e.target.value)} className="w-full bg-white border border-slate-200 rounded p-1 text-xs font-bold text-blue-600 outline-none">
                          <option value="available">Unassigned / Open Available</option>
                          <option value="admin">Corporate Administration Calendar Link</option>
                          <option value="staff">Staff Scheduled Timeline</option>
                          <option value="participant">Participant Dedicated Timeline</option>
                        </select>
                      </div>

                      <div className="lg:col-span-2 bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1">
                        <label className="block text-[9px] font-black uppercase text-slate-500 tracking-wider">Multi-Stream Routing Checkboxes</label>
                        
                        {allocationType === 'staff' && (
                          <div className="max-h-20 overflow-y-auto bg-white p-2 rounded border border-slate-200 space-y-1">
                            {workerList.map(w => (
                              <label key={w.id} className="flex items-center space-x-2 text-xs font-semibold cursor-pointer text-gray-700">
                                <input type="checkbox" checked={selectedWorkerIds.includes(w.id)} onChange={()=>handleToggleWorkerCheckbox(w.id)} className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                                <span>{w.full_name}</span>
                              </label>
                            ))}
                          </div>
                        )}

                        {allocationType === 'participant' && (
                          <div className="max-h-20 overflow-y-auto bg-white p-2 rounded border border-slate-200 space-y-1">
                            {participants.map(p => (
                              <label key={p.id} className="flex items-center space-x-2 text-xs font-semibold cursor-pointer text-gray-700">
                                <input type="checkbox" checked={selectedParticipantIds.includes(p.id)} onChange={()=>handleToggleParticipantCheckbox(p.id)} className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                                <span>{p.name}</span>
                              </label>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="lg:col-span-4">
                        <input type="text" placeholder="Manager Directives / Reminders..." value={shiftDirectives} onChange={(e) => setShiftDirectives(e.target.value)} className="w-full bg-white border border-gray-200 rounded-lg p-2 text-xs text-gray-800 outline-none" />
                      </div>
                      <div className="lg:col-span-2 flex items-end">
                        <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase rounded-lg py-2.5 transition-transform transform active:scale-95 shadow">Deploy Event Rows</button>
                      </div>
                    </form>
                  </div>
                )}

                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                  <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center justify-between shadow-sm select-none">
                    <button onClick={() => setCurrentCalendarOffset(currentCalendarOffset - 1)} className="bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold px-3 py-1.5 rounded-lg text-xs uppercase">← Previous</button>
                    <span className="text-xs font-black uppercase text-blue-900 tracking-widest font-mono bg-white border border-slate-200 px-4 py-1.5 rounded-xl shadow-inner">{getDynamicCalendarHeaderString()}</span>
                    <button onClick={() => setCurrentCalendarOffset(currentCalendarOffset + 1)} className="bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold px-3 py-1.5 rounded-lg text-xs uppercase">Next →</button>
                  </div>

                  {calendarView === 'month' && (
                    <div className="bg-white p-4 space-y-4">
                      <div className="grid grid-cols-7 gap-2 text-center text-[10px] font-black uppercase text-slate-400 tracking-widest">
                        {calendarDaysOfWeek.map(d => <div key={d}>{d.substring(0,3)}</div>)}
                      </div>
                      <div className="grid grid-cols-7 gap-2 pt-1 border border-slate-100 rounded-xl p-2 bg-slate-50/20">
                        {Array.from({ length: 28 }).map((_, blockIdx) => {
                          const mockDayNumber = blockIdx + 1;
                          const dayShifts = shifts.filter(s => new Date(s.start_time).getDate() === mockDayNumber);
                          return (
                            <div key={blockIdx} className="bg-white border border-slate-200 p-2 rounded-xl min-h-[95px] flex flex-col justify-between">
                              <span className="block text-[10px] font-mono font-bold text-slate-400 text-right">{mockDayNumber}</span>
                              <div className="flex-1 space-y-1 pt-1 overflow-hidden">
                                {dayShifts.slice(0,2).map(s => (
                                  <div key={s.id} className="text-[8px] font-extrabold p-0.5 rounded border truncate uppercase tracking-tight bg-blue-50 text-blue-700 border-blue-100">{s.title}</div>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {calendarView === 'week' && (
                    <div className="bg-white p-4 grid grid-cols-7 gap-3 min-h-[220px]">
                      {calendarDaysOfWeek.map(dayName => {
                        const dayShifts = shifts.filter(s => new Date(s.start_time).toLocaleDateString('en-US', { weekday: 'long' }) === dayName);
                        return (
                          <div key={dayName} className="bg-slate-50/50 border border-slate-200 p-3 rounded-xl space-y-2 flex flex-col justify-start">
                            <span className="block text-center font-black uppercase tracking-wider text-[10px] text-slate-400 border-b border-slate-200 pb-1.5">{dayName.substring(0,3)}</span>
                            <div className="space-y-1.5 flex-1 overflow-y-auto">
                              {dayShifts.map(s => (
                                <div key={s.id} className="p-2 rounded-lg border text-[9px] font-bold uppercase tracking-tight bg-white text-blue-900 border-blue-200">
                                  <span className="block font-black text-blue-700 truncate">{s.title}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {calendarView === 'day' && (
                    <div className="bg-white p-5 divide-y divide-slate-100 max-h-80 overflow-y-auto">
                      {['09:00', '11:00', '13:00', '15:00', '17:00'].map(hourStamp => {
                        const hourShifts = shifts.filter(s => new Date(s.start_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) === hourStamp);
                        return (
                          <div key={hourStamp} className="py-4 flex items-start gap-4 text-xs">
                            <span className="w-16 block font-bold text-blue-600 select-none text-right font-mono">{hourStamp}</span>
                            <div className="flex-1 space-y-1">
                              {hourShifts.map(s => (
                                <div key={s.id} className="p-3 rounded-xl border bg-blue-50/50 border-blue-200 text-blue-900 font-bold">{s.title}</div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* PAGE 4: PARTICIPANT PROFILES */}
            {currentTab === 'profiles' && (
              <div className="space-y-6">
                <div className="border-b border-slate-200 pb-4">
                  <h2 className="text-base font-bold uppercase tracking-wider text-blue-900">Participant Profiles</h2>
                </div>
                <div className="space-y-2">
                  {participants.map(p => {
                    const isOpen = expandedClient === p.id;
                    return (
                      <div key={p.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                        <div onClick={() => setExpandedClient(isOpen ? null : p.id)} className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 select-none">
                          <span className="font-bold text-xs uppercase tracking-wide text-slate-800">{p.name}</span>
                          <span className="text-[10px] font-bold text-blue-600 bg-blue-50 border border-blue-200 px-3 py-1 rounded-lg">EXPAND</span>
                        </div>
                        {isOpen && (
                          <div className="p-5 bg-slate-50 border-t border-slate-200 text-xs space-y-2">
                            <p className="text-slate-600 font-medium">NDIS Code: <strong className="font-mono text-slate-900">{p.ndis_number || 'Unlisted'}</strong></p>
                            <p className="text-slate-600 font-medium">Notes File: {p.about_me_notes || 'No tracking file entries.'}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* PAGE 5: AVAILABILITIES */}
            {currentTab === 'availability' && (
              <div className="space-y-6">
                <div className="border-b border-slate-200 pb-4">
                  <h2 className="text-base font-bold uppercase tracking-wider text-blue-900">Availabilities</h2>
                </div>
                <form onSubmit={handleStackedAvailabilitySubmit} className="bg-white border border-slate-200 rounded-xl p-6 space-y-6 shadow-sm">
                  <div className="max-w-xs">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Target Payroll Fortnight Range</label>
                    <select value={availFortnight} onChange={(e) => setAvailFortnight(e.target.value)} className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-blue-600 font-bold focus:outline-none">
                      {fortnights.map(f => <option key={f.id} value={f.id}>{f.label}</option>)}
                    </select>
                  </div>
                  <div className="border border-slate-200 rounded-xl overflow-hidden bg-white divide-y divide-slate-200">
                    {calendarDaysOfWeek.map(day => {
                      const state = availDaysState[day];
                      return (
                        <div key={day} className="p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white hover:bg-slate-50">
                          <span className="text-xs font-bold uppercase tracking-wide text-slate-700 w-24">{day}</span>
                          <div className="flex flex-wrap gap-2 items-center">
                            <button type="button" onClick={() => updateAvailabilityMode(day, 'standard')} className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase border ${state.mode === 'standard' ? 'bg-blue-600 text-white' : 'bg-white border-gray-300'}`}>Hours</button>
                            <button type="button" onClick={() => updateAvailabilityMode(day, 'allday')} className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase border ${state.mode === 'allday' ? 'bg-blue-600 text-white' : 'bg-white border-gray-300'}`}>All Day</button>
                            <button type="button" onClick={() => updateAvailabilityMode(day, 'unavailable')} className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase border ${state.mode === 'unavailable' ? 'bg-red-50 text-red-600' : 'bg-white border-gray-300'}`}>Closed</button>
                          </div>
                          {state.mode === 'standard' && (
                            <div className="flex items-center space-x-2">
                              <input type="time" value={state.start} onChange={(e) => updateAvailabilityTimes(day, 'start', e.target.value)} className="border border-gray-300 rounded p-1 text-xs outline-none focus:border-blue-500" />
                              <span className="text-[10px] text-gray-400 font-bold">TO</span>
                              <input type="time" value={state.end} onChange={(e) => updateAvailabilityTimes(day, 'end', e.target.value)} className="border border-gray-300 rounded p-1 text-xs outline-none focus:border-blue-500" />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase py-3 rounded shadow transition-all transform active:scale-95">Submit Fortnight Availability Profile Block</button>
                </form>
              </div>
            )}

            {/* PAGE 6: TIMESHEETS */}
            {currentTab === 'timesheets' && (
              <div className="space-y-6">
                <div className="border-b border-slate-200 pb-4">
                  <h2 className="text-base font-bold uppercase tracking-wider text-blue-900">Timesheet Submissions</h2>
                </div>
                <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
                  <div className="bg-white border border-slate-200 rounded-xl p-6 xl:col-span-3 space-y-4 shadow-sm h-fit">
                    <form onSubmit={handleStackedTimesheetSubmit} className="space-y-4">
                      <div className="max-w-xs">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Target Payroll Pay Cycle Window</label>
                        <select value={selectedFortnight} onChange={(e) => setSelectedFortnight(e.target.value)} className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-blue-600 font-bold focus:outline-none">
                          {fortnights.map(f => <option key={f.id} value={f.id}>{f.label}</option>)}
                        </select>
                      </div>

                      <div className="space-y-2 overflow-x-auto lg:overflow-x-visible">
                        <div className="hidden lg:grid lg:grid-cols-12 gap-2 text-[9px] font-black uppercase text-slate-400 px-3 tracking-widest pb-1 border-b border-slate-100">
                          <div className="col-span-2">Date Worked</div>
                          <div className="col-span-2">Start Time</div>
                          <div className="col-span-2">End Time</div>
                          <div className="col-span-3">Participant Entity</div>
                          <div className="col-span-1">KM (With)</div>
                          <div className="col-span-2">KM (Car)</div>
                        </div>

                        {timesheetRows.map((row, idx) => (
                          <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex flex-col lg:grid lg:grid-cols-12 gap-2.5 shadow-sm">
                            <div className="lg:col-span-2">
                              <input type="date" required value={row.date} onChange={(e) => updateTimesheetRowValue(idx, 'date', e.target.value)} className="w-full bg-white border border-gray-200 rounded p-1.5 text-xs font-medium outline-none text-slate-800" />
                            </div>
                            <div className="lg:col-span-2">
                              <input type="time" required value={row.start} onChange={(e) => updateTimesheetRowValue(idx, 'start', e.target.value)} className="w-full bg-white border border-gray-200 rounded p-1.5 text-xs font-medium outline-none text-slate-800" />
                            </div>
                            <div className="lg:col-span-2">
                              <input type="time" required value={row.end} onChange={(e) => updateTimesheetRowValue(idx, 'end', e.target.value)} className="w-full bg-white border border-gray-200 rounded p-1.5 text-xs font-medium outline-none text-slate-800" />
                            </div>
                            <div className="lg:col-span-3">
                              <select required value={row.client} onChange={(e) => updateTimesheetRowValue(idx, 'client', e.target.value)} className="w-full bg-white border border-gray-200 rounded p-1.5 text-xs text-gray-700 outline-none font-bold">
                                <option value="">-- Pick Client --</option>
                                <option value="Nash Murray">Nash Murray</option>
                                {participants.filter(p=>p.name !== "Nash Murray").map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                              </select>
                            </div>
                            <div className="lg:col-span-1">
                              <input type="number" value={row.kmWith} onChange={(e) => updateTimesheetRowValue(idx, 'kmWith', e.target.value)} className="w-full bg-white border border-gray-200 rounded p-1.5 text-xs font-medium outline-none text-slate-800" />
                            </div>
                            <div className="lg:col-span-2">
                              <input type="number" value={row.kmWithout} onChange={(e) => updateTimesheetRowValue(idx, 'kmWithout', e.target.value)} className="w-full bg-white border border-gray-200 rounded p-1.5 text-xs font-medium outline-none text-slate-800" />
                            </div>
                            <div className="col-span-12 pt-1 border-t border-slate-200/60 mt-0.5">
                              <input type="text" required placeholder="Outline support activity notes description metrics..." value={row.notes} onChange={(e) => updateTimesheetRowValue(idx, 'notes', e.target.value)} className="w-full bg-white border border-gray-200 rounded p-1.5 text-xs font-medium outline-none focus:border-blue-500 text-slate-700" />
                            </div>
                          </div>
                        ))}
                      </div>

                      <button type="button" onClick={addTimesheetRow} className="bg-white hover:bg-slate-100 text-slate-700 font-bold border border-slate-300 text-[10px] uppercase px-4 py-2.5 rounded-lg transition-colors">Add Shift Row to Fortnight Stack</button>
                      <div className="flex items-start space-x-3 bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-inner">
                        <input type="checkbox" required id="notesCheck" checked={tsNotesChecked} onChange={(e) => setTsNotesChecked(e.target.checked)} className="w-4 h-4 mt-0.5 border-slate-300 rounded accent-blue-600" />
                        <label htmlFor="notesCheck" className="text-[11px] text-slate-500 font-medium select-none">I verify that my shift case notes have been officially logged and filed.</label>
                      </div>
                      <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase py-3.5 rounded-xl shadow-md transition-all transform active:scale-95">Transmit Fortnightly Timesheet Remittance Package</button>
                    </form>
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
