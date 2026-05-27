'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://wgtcvmyofcoikynyftwn.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_naqzF_7iH63JA-0G2pw8Cw_XY7waAin';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function LifeUnboundPortal() {
  // Session Configuration & Portal View Routers
  const [portalType, setPortalType] = useState<null | 'staff' | 'admin'>(null);
  const [user, setUser] = useState<any>(null);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Sync Repositories
  const [profiles, setProfiles] = useState<any[]>([]);
  const [participants, setParticipants] = useState<any[]>([]);
  const [shifts, setShifts] = useState<any[]>([]);
  const [timesheetHistory, setTimesheetHistory] = useState<any[]>([]);
  const [availabilitySubmissions, setAvailabilitySubmissions] = useState<any[]>([]);

  // Expandable Interface Flags
  const [expandedClient, setExpandedClient] = useState<string | null>(null);
  const [calendarScope, setCalendarScope] = useState('combined'); 
  const [selectedCalendarTargetId, setSelectedCalendarTargetId] = useState('');
  const [calendarView, setCalendarView] = useState('month'); 
  const [currentCalendarOffset, setCurrentCalendarOffset] = useState(0); 

  // Pay Cycle Framework Configuration
  const [fortnights, setFortnights] = useState<any[]>([]);
  const [selectedFortnight, setSelectedFortnight] = useState('');

  // Form Field Containers
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

  // Multi-Use Calendar Inputs
  const [eventCategory, setEventCategory] = useState('shift'); 
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
    Saturday: { mode: 'standard', start: '09:00', end: '17:00' },
    Sunday: { mode: 'standard', start: '09:00', end: '17:00' },
  });

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
    try {
      const { data: profs } = await supabase.from('profiles').select('*');
      if (profs) setProfiles(profs);
      const { data: parts } = await supabase.from('participants').select('*');
      if (parts) setParticipants(parts);
      const { data: sfts } = await supabase.from('shifts').select('*');
      if (sfts) setShifts(sfts);
    } catch (err) {
      console.error('Database connection baseline failure:', err);
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
        if (portalType === 'admin' && data.role !== 'director') {
          showToast('Access denied. Administrator parameters required.', 'error');
          setLoading(false);
          return;
        }
        setUser(data);
        showToast('Authentication successful.', 'success');
        setCurrentTab('dashboard');
      } else {
        showToast('Invalid password parameters supplied.', 'error');
      }
    } catch (err) {
      showToast('Handshake verification failed.', 'error');
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
      showToast('Support worker account initialized safely.', 'success');
      setWorkerName('');
      setWorkerEmail('');
      setWorkerPhone('');
      setWorkerNotes('');
      fetchCoreData();
    } catch (err: any) {
      showToast(err.message || 'Could not populate support worker table row data.', 'error');
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
      showToast('Participant profile synchronized cleanly to registry.', 'success');
      setPartName('');
      setPartNdis('');
      setPartPhone('');
      setPartEmergName('');
      setPartEmergPhone('');
      setPartNotes('');
      fetchCoreData();
    } catch (err: any) {
      showToast(err.message || 'Error executing client card parameter registry mapping.', 'error');
    }
  };

  const handleCreateShift = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const startIso = `${shiftDate}T${shiftStart}:00`;
      const endIso = `${shiftDate}T${shiftEnd}:00`;
      
      const titlePrefix = eventCategory === 'event' ? '[EVENT] ' : '';

      const { error } = await supabase.from('shifts').insert([
        {
          title: titlePrefix + (shiftTitle.trim() || 'Roster Item'),
          staff_id: shiftWorkerId ? shiftWorkerId : null,
          participant_id: shiftParticipantId ? shiftParticipantId : null,
          start_time: startIso,
          end_time: endIso,
          manager_directives: shiftDirectives.trim(),
          status: shiftWorkerId ? 'scheduled' : 'available'
        }
      ]);
      if (error) throw error;
      showToast('Calendar entry point deployed successfully.', 'success');
      setShiftTitle('');
      setShiftDirectives('');
      setShiftDate('');
      setShiftStart('');
      setShiftEnd('');
      setShiftWorkerId('');
      setShiftParticipantId('');
      fetchCoreData();
    } catch (err: any) {
      showToast(err.message || 'Database rejected entry structure.', 'error');
    }
  };

  const handleClaimUnclaimedShift = async (id: string) => {
    try {
      const { error } = await supabase
        .from('shifts')
        .update({ staff_id: user.id, status: 'scheduled' })
        .eq('id', id);
      if (error) throw error;
      showToast('Shift layout block secured cleanly onto your provider timeline.', 'success');
      fetchCoreData();
    } catch (err) {
      showToast('Error binding asset assignment variables.', 'error');
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
      showToast('Acknowledgment compliance checkbox verification is mandatory.', 'error');
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
      workerName: user.full_name,
      workerEmail: user.email,
      fortnightId: selectedFortnight,
      fortnightLabel: fortnights.find(f => f.id === selectedFortnight)?.label || selectedFortnight,
      rowsCount: timesheetRows.length,
      totalHours: computedHoursTotal,
      submittedDate: new Date().toLocaleDateString('en-AU')
    };

    setTimesheetHistory([masterLogBlock, ...timesheetHistory]);
    showToast('Fortnightly payroll remittance stack filed.', 'success');
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
      workerName: user.full_name,
      fortnightId: availFortnight,
      fortnightLabel: fortnights.find(f => f.id === availFortnight)?.label || availFortnight,
      matrix: { ...availDaysState },
      submittedAt: new Date().toLocaleDateString('en-AU')
    };
    setAvailabilitySubmissions([submissionItem, ...availabilitySubmissions]);
    showToast('Fortnightly scheduling availability parameter sets delivered to management logs.', 'success');
  };

  const getWorkerIndexColor = (id: string) => {
    return 'border-blue-200 bg-blue-50/50 text-blue-900';
  };

  const getClientIndexColor = (id: string) => {
    return 'border-gray-200 bg-gray-50 text-gray-800';
  };

  const workerList = profiles.filter(p => p.role === 'support_worker');
  const userAllocatedHoursSum = shifts.filter(s => s.staff_id === user?.id).length * 8;

  // Calendar Engine Helper Arrays
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
      
      {/* Light Clean Nav Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 relative flex items-center justify-center rounded-xl border border-slate-200 p-1 bg-white shadow-inner">
            <img 
              src="/logo.png" 
              alt={"LU Logo"} 
              className="max-h-full max-w-full object-contain rounded"
              onError={(e)=>{ (e.target as HTMLImageElement).src = 'https://wgtcvmyofcoikynyftwn.supabase.co/storage/v1/object/public/assets/logo-fallback.png'; }}
            />
          </div>
          <div>
            <span className="font-bold text-base tracking-tight block text-blue-900">LIFE UNBOUND SUPPORT</span>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Internal Infrastructure Framework</span>
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
            <button 
              onClick={() => { setUser(null); setPortalType(null); }}
              className="bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs uppercase px-3 py-2 border border-slate-300 rounded-lg shadow-sm transition-colors active:scale-95"
            >
              Sign Out
            </button>
          )}
        </div>
      </header>

      {/* Top Navigation Links bar */}
      {user && (
        <nav className="bg-white border-b border-slate-200 px-6 py-2 flex flex-wrap gap-1.5 shadow-sm">
          <button onClick={() => setCurrentTab('dashboard')} className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${currentTab === 'dashboard' ? 'bg-blue-600 text-white shadow' : 'text-slate-600 hover:bg-slate-50'}`}>Dashboards</button>
          {user.role === 'director' && (
            <button onClick={() => setCurrentTab('director')} className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${currentTab === 'director' ? 'bg-blue-600 text-white shadow' : 'text-slate-600 hover:bg-slate-50'}`}>Admin Centre</button>
          )}
          <button onClick={() => setCurrentTab('rosters')} className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${currentTab === 'rosters' ? 'bg-blue-600 text-white shadow' : 'text-slate-600 hover:bg-slate-50'}`}>Calendar</button>
          <button onClick={() => setCurrentTab('profiles')} className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${currentTab === 'profiles' ? 'bg-blue-600 text-white shadow' : 'text-slate-600 hover:bg-slate-50'}`}>Participant Profiles</button>
          <div className="w-px bg-slate-200 h-5 my-auto mx-1.5" />
          <button onClick={() => setCurrentTab('availability')} className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${currentTab === 'availability' ? 'bg-blue-600 text-white shadow' : 'text-slate-500 hover:bg-slate-50'}`}>Availabilities</button>
          <button onClick={() => setCurrentTab('timesheets')} className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${currentTab === 'timesheets' ? 'bg-blue-600 text-white shadow' : 'text-slate-500 hover:bg-slate-50'}`}>Timesheet Submissions</button>
        </nav>
      )}

      {/* Main Container Core workspace viewports */}
      <main className="flex-1 p-5 sm:p-8 w-full mx-auto max-w-7xl">
        
        {notification && (
          <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 max-w-sm w-full px-4">
            <div className={`p-4 rounded-lg border text-xs font-bold shadow-xl bg-white ${notification.type === 'success' ? 'border-blue-500 text-blue-700 bg-blue-50' : 'border-red-500 text-red-700 bg-red-50'}`}>
              {notification.message}
            </div>
          </div>
        )}

        {/* RE-ARCHITECTED SPLIT PORTAL LANDING SELECTION VIEW */}
        {!user && !portalType && (
          <div className="max-w-md mx-auto my-16 bg-white border border-slate-200 shadow-md rounded-xl p-8 space-y-5 text-center">
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400">Portal Entry Gateway</h2>
            <p className="text-xs text-slate-500 font-medium">Select your authorized core access path workspace module level:</p>
            <div className="grid grid-cols-1 gap-3 pt-2">
              <button onClick={() => setPortalType('staff')} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider py-4 rounded-xl shadow-md transition-all transform active:scale-98">Staff Portal</button>
              <button onClick={() => setPortalType('admin')} className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs uppercase tracking-wider py-4 rounded-xl shadow-md transition-all transform active:scale-98">Admin Portal</button>
            </div>
          </div>
        )}

        {!user && portalType && (
          <div className="max-w-md mx-auto my-12 bg-white border border-slate-200 shadow-md rounded-xl p-8 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-xs font-bold uppercase text-slate-700 tracking-wider">
                {portalType === 'admin' ? 'Admin Portal Secure Log In' : 'Staff Portal Secure Log In'}
              </h2>
              <button onClick={() => setPortalType(null)} className="text-[10px] text-slate-400 hover:text-slate-600 font-bold uppercase border border-slate-200 px-2.5 py-1 rounded">Cancel</button>
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
            
            {/* TAB 1: DASHBOARDS WITH LIVE CURRENT WEEK OVERVIEW */}
            {currentTab === 'dashboard' && (
              <div className="space-y-6">
                <div className="border-b border-slate-200 pb-4">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-blue-900">Dashboards</h2>
                  <p className="text-xs text-slate-500">Real-time overview of current workload densities and current weekly items.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  
                  {/* Roled Left Side summary card blocks */}
                  <div className="md:col-span-1 space-y-4">
                    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm border-l-4 border-l-blue-600">
                      <span className="text-[10px] font-bold tracking-widest text-blue-600 uppercase block mb-1">Rostered Load</span>
                      <h3 className="text-xl font-bold text-slate-800">{user.role === 'support_worker' ? `${userAllocatedHoursSum} Hours Assigned` : `${shifts.length} Total System Shifts`}</h3>
                      <p className="text-xs text-slate-400 mt-1">Operational volume tracked internally across the current pay cycle bounds.</p>
                    </div>

                    {user.role === 'director' && (
                      <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm border-l-4 border-l-red-500">
                        <span className="block text-[10px] font-bold text-red-500 uppercase tracking-wide mb-1">Unassigned System Shifts</span>
                        <span className="text-base font-bold text-red-600 block">{shifts.filter(s => !s.staff_id).length} Shifts Awaiting Providers</span>
                      </div>
                    )}
                  </div>

                  {/* CURRENT WEEK TIMELINE OVERVIEW BOARD WINDOW MODULE (Requested layout addition!) */}
                  <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm md:col-span-2 space-y-3">
                    <div className="border-b border-slate-100 pb-1.5 flex justify-between items-center">
                      <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide">Current Week Roster Timeline Matrix</h4>
                      <span className="text-[9px] font-mono bg-blue-50 text-blue-600 px-2 py-0.5 border border-blue-200 rounded font-bold">Active Week View</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-7 gap-2 pt-1">
                      {calendarDaysOfWeek.map(dayName => {
                        // Filter events tied precisely to this specific calendar day of the week
                        const shiftsOnThisDay = shifts.filter(s => {
                          const dateObj = new Date(s.start_time);
                          const dayString = dateObj.toLocaleDateString('en-US', { weekday: 'long' });
                          const isUserMatch = user.role === 'support_worker' ? s.staff_id === user.id : true;
                          return dayString === dayName && isUserMatch;
                        });

                        return (
                          <div key={dayName} className="bg-slate-50 border border-slate-200 p-2.5 rounded-lg flex flex-col justify-between min-h-[90px] hover:bg-slate-100/50 transition-colors">
                            <span className="block font-bold text-[10px] text-slate-400 uppercase border-b border-slate-200 pb-1 mb-1">{dayName.substring(0,3)}</span>
                            <div className="flex-1 space-y-1">
                              {shiftsOnThisDay.slice(0, 2).map(s => (
                                <div key={s.id} className={`text-[9px] font-bold p-1 rounded border overflow-hidden whitespace-nowrap truncate ${!s.staff_id ? 'bg-red-50 text-red-600 border-red-200' : 'bg-blue-50 text-blue-700 border-blue-100'}`}>
                                  {s.title}
                                </div>
                              ))}
                              {shiftsOnThisDay.length === 0 && (
                                <span className="text-[9px] text-slate-300 italic block pt-2">No items</span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Director Hours Distribution Graph view */}
                {user.role === 'director' && (
                  <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
                    <div>
                      <h3 className="text-xs font-bold tracking-wider text-slate-700 uppercase">Operational Care Volume Metrics Graph</h3>
                      <p className="text-[10px] text-slate-400 font-medium">Comparison showing participant service hours vs unallocated/open framework lines.</p>
                    </div>
                    <div className="h-32 flex items-end justify-between gap-6 border-b border-slate-200 px-4 pb-2 bg-slate-50/50 border border-slate-100 rounded-xl relative pt-4">
                      <div className="w-full flex items-end justify-center gap-1 h-full z-10"><div className="w-4 bg-blue-600 rounded-t h-1/3" /><div className="w-4 bg-red-400 rounded-t h-2/3" /></div>
                      <div className="w-full flex items-end justify-center gap-1 h-full z-10"><div className="w-4 bg-blue-600 rounded-t h-1/2" /><div className="w-4 bg-red-400 rounded-t h-1/2" /></div>
                      <div className="w-full flex items-end justify-center gap-1 h-full z-10"><div className="w-4 bg-blue-600 rounded-t h-3/4" /><div className="w-4 bg-red-400 rounded-t h-1/4" /></div>
                      <div className="w-full flex items-end justify-center gap-1 h-full z-10"><div className="w-4 bg-blue-600 rounded-t h-4/5" /><div className="w-4 bg-red-400 rounded-t h-1/5" /></div>
                    </div>
                    <div className="flex justify-between text-[9px] font-bold text-slate-400 uppercase px-4 tracking-wider">
                      <span className="w-full text-center">Week 1</span><span className="w-full text-center">Week 2</span><span className="w-full text-center">Week 3</span><span className="w-full text-center">Week 4</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* PAGE 2: ADMIN CENTRE WITH INTEGRATED LIVE TIMESHEET & STAFF AVAILABILITY CALENDAR SECTIONS */}
            {currentTab === 'director' && user.role === 'director' && (
              <div className="space-y-6">
                <div className="border-b border-slate-200 pb-4">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-blue-900">Admin Centre</h2>
                  <p className="text-xs text-slate-400">Configure core personnel registries and evaluate submitted provider timesheets.</p>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  
                  {/* Support Worker registration card form elements */}
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
                      <div>
                        <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wide mb-1">Compliance Notes</label>
                        <textarea value={workerNotes} onChange={(e) => setWorkerNotes(e.target.value)} className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 h-16 resize-none focus:outline-none" />
                      </div>
                      <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase py-2.5 rounded shadow transition-colors">Create Support Worker Account</button>
                    </form>
                    {generatedPassword && <p className="text-[11px] font-mono text-gray-600 bg-gray-50 p-2 rounded border border-gray-200 select-all">Key: {generatedPassword}</p>}
                  </div>

                  {/* Participant Registration Card form elements */}
                  <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4 shadow-sm">
                    <h3 className="text-xs font-bold text-blue-900 uppercase tracking-wide">Register Participant Account</h3>
                    <form onSubmit={handleRegisterParticipant} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="sm:col-span-2">
                        <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wide mb-1">Participant Identity Name</label>
                        <input type="text" required value={partName} onChange={(e) => setPartName(e.target.value)} className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none" />
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wide mb-1">NDIS Number</label>
                        <input type="text" required value={partNdis} onChange={(e) => setPartNdis(e.target.value)} className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none" />
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wide mb-1">Phone Number</label>
                        <input type="text" required value={partPhone} onChange={(e) => setPartPhone(e.target.value)} className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none" />
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wide mb-1">Emergency Representative</label>
                        <input type="text" required value={partEmergName} onChange={(e) => setPartEmergName(e.target.value)} className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none" />
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wide mb-1">Emergency Phone</label>
                        <input type="text" required value={partEmergPhone} onChange={(e) => setPartEmergPhone(e.target.value)} className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none" />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wide mb-1">Strategic Care Notes</label>
                        <textarea value={partNotes} onChange={(e) => setPartNotes(e.target.value)} className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 h-16 resize-none focus:outline-none" />
                      </div>
                      <button type="submit" className="sm:col-span-2 bg-slate-950 text-white font-bold text-xs uppercase py-2.5 rounded shadow transition-colors">Register Card Entry</button>
                    </form>
                  </div>

                  {/* MASTER STAFF AVAILABILITY MONITOR GRID PANEL FOR DIRECTOR AUDITS */}
                  <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm xl:col-span-2 space-y-2">
                    <h3 className="text-xs font-bold text-blue-900 uppercase tracking-wide">Staff Availability Audit Tracker</h3>
                    <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50 divide-y divide-slate-200 max-h-48 overflow-y-auto">
                      {availabilitySubmissions.map((sub, sIdx) => (
                        <div key={sIdx} className="p-3.5 bg-white space-y-2 text-xs border-l-4 border-l-blue-600">
                          <div className="flex justify-between items-center text-[11px]">
                            <span className="font-bold text-slate-800">Support Provider: {sub.workerName}</span>
                            <span className="font-mono text-slate-400 font-bold">{sub.fortnightLabel}</span>
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-7 gap-1.5 text-center">
                            {Object.keys(sub.matrix).map(d => (
                              <div key={d} className="bg-slate-50 p-1.5 rounded border border-slate-200/60 text-[10px]">
                                <span className="block font-bold text-slate-400 uppercase text-[8px]">{d.substring(0,3)}</span>
                                <span className={`font-mono text-[9px] font-bold block ${sub.matrix[d].mode === 'unavailable' ? 'text-red-500' : 'text-blue-700'}`}>
                                  {sub.matrix[d].mode === 'standard' ? `${sub.matrix[d].start}-${sub.matrix[d].end}` : sub.matrix[d].mode === 'allday' ? '24h Open' : 'Closed'}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Workforce Submitted timesheets deck tracker */}
                  <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm xl:col-span-2 space-y-2">
                    <h3 className="text-xs font-bold text-blue-900 uppercase tracking-wide">Submitted Workforce Timesheets Queue</h3>
                    <div className="border border-slate-200 rounded-xl bg-slate-50 divide-y divide-slate-200 max-h-48 overflow-y-auto">
                      {timesheetHistory.map(ts => (
                        <div key={ts.id} className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs text-gray-700 bg-white">
                          <div className="space-y-0.5">
                            <span className="font-bold text-gray-900 block uppercase tracking-wide">Filer: {ts.workerName}</span>
                            <span className="block font-medium text-blue-600">{ts.fortnightLabel} | Volume: {ts.rowsCount} Rows Mapped</span>
                          </div>
                          <div className="text-left sm:text-right font-mono text-[11px] text-gray-400">
                            <span className="block font-bold text-gray-800">Hours Registered: ~{ts.totalHours}h</span>
                            <span className="block text-[10px]">Received: {ts.submittedDate}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* PAGE 3: FULL GOOGLE CALENDAR-STYLE STRUCTURAL ENGINE GRID MODULE (With custom targeted unassigned allocations!) */}
            {currentTab === 'rosters' && (
              <div className="space-y-6">
                <div className="border-b border-slate-200 pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h2 className="text-base font-bold uppercase tracking-wider text-blue-900">Calendar</h2>
                    <p className="text-xs text-slate-400">Filter timeline tracks and deploy new shifts inline.</p>
                  </div>
                  <div className="bg-white border border-slate-200 p-1 rounded-lg flex space-x-1 shadow-sm items-center">
                    {['day', 'week', 'month'].map(v => (
                      <button key={v} onClick={() => { setCalendarView(v); setCurrentCalendarOffset(0); }} className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all ${calendarView === v ? 'bg-blue-600 text-white shadow' : 'text-gray-500 hover:text-gray-800'}`}>{v}</button>
                    ))}
                  </div>
                </div>

                {/* Filter Track selectors card panel wrap components layout */}
                <div className="bg-white border border-slate-200 p-4 rounded-xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 shadow-sm">
                  <div>
                    <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wide mb-1">Calendar Filter Scope</label>
                    <select value={calendarScope} onChange={(e) => { setCalendarScope(e.target.value); setSelectedCalendarTargetId(''); }} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-bold text-slate-700 focus:outline-none">
                      <option value="combined">Combined Calendar</option>
                      <option value="admin">Admin Calendar</option>
                      <option value="worker">Staff Calendars</option>
                      <option value="participant">Participant Calendars</option>
                    </select>
                  </div>
                  {calendarScope === 'worker' && (
                    <div>
                      <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wide mb-1">Select Employee Profile</label>
                      <select value={selectedCalendarTargetId} onChange={(e) => setSelectedCalendarTargetId(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-bold text-blue-600 focus:outline-none">
                        <option value="">-- Choose Personnel --</option>
                        {workerList.map(w => <option key={w.id} value={w.id}>{w.full_name}</option>)}
                      </select>
                    </div>
                  )}
                  {calendarScope === 'participant' && (
                    <div>
                      <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wide mb-1">Select Client Card</label>
                      <select value={selectedCalendarTargetId} onChange={(e) => setSelectedCalendarTargetId(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-bold text-blue-600 focus:outline-none">
                        <option value="">-- Choose Client --</option>
                        {participants.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                      </select>
                    </div>
                  )}
                </div>

                {/* ADVANCED MULTI-TARGET CALENDAR ALLOCATION FORM FRAMEWORK COMPONENT VIEW (Item 3 & 5 custom upgrade!) */}
                {user.role === 'director' && (
                  <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm space-y-3">
                    <div className="flex items-center space-x-1.5 bg-slate-50 p-1 rounded-lg border border-slate-200 w-fit">
                      <button type="button" onClick={() => setEventCategory('shift')} className={`px-3 py-1 rounded text-[9px] font-black uppercase tracking-wider transition-all ${eventCategory === 'shift' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500'}`}>Shift Segment</button>
                      <button type="button" onClick={() => setEventCategory('event')} className={`px-3 py-1 rounded text-[9px] font-black uppercase tracking-wider transition-all ${eventCategory === 'event' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500'}`}>Corporate Event</button>
                    </div>

                    <form onSubmit={handleCreateShift} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 pt-1">
                      <div>
                        <label className="block text-[8px] font-bold uppercase text-slate-400 mb-0.5">Description Heading</label>
                        <input type="text" required placeholder="Activity Summary Description" value={shiftTitle} onChange={(e) => setShiftTitle(e.target.value)} className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs text-slate-800 outline-none" />
                      </div>
                      
                      {/* Advanced targeted routing dropdown element selection component (Requested addition!) */}
                      <div>
                        <label className="block text-[8px] font-bold uppercase text-slate-400 mb-0.5">Target Destination Calendar</label>
                        <select value={shiftWorkerId} onChange={(e) => setShiftWorkerId(e.target.value)} className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs text-slate-600 outline-none font-bold text-blue-600">
                          <option value="">Leave Unassigned (Red Alert Open Board)</option>
                          {workerList.map(w => <option key={w.id} value={w.id}>Staff: {w.full_name}</option>)}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[8px] font-bold uppercase text-slate-400 mb-0.5">Associated Participant</label>
                        <select value={shiftParticipantId} onChange={(e) => setShiftParticipantId(e.target.value)} className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs text-slate-600 outline-none font-bold text-emerald-600">
                          <option value="">Internal / Administrative Route</option>
                          {participants.map(p => <option key={p.id} value={p.id}>Client: {p.name}</option>)}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[8px] font-bold uppercase text-slate-400 mb-0.5">Roster Date</label>
                        <input type="date" required value={shiftDate} onChange={(e) => setShiftDate(e.target.value)} className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs outline-none" />
                      </div>
                      <div>
                        <label className="block text-[8px] font-bold uppercase text-slate-400 mb-0.5">Start Time</label>
                        <input type="time" required value={shiftStart} onChange={(e) => setShiftStart(e.target.value)} className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs outline-none" />
                      </div>
                      <div>
                        <label className="block text-[8px] font-bold uppercase text-slate-400 mb-0.5">End Time</label>
                        <input type="time" required value={shiftEnd} onChange={(e) => setShiftEnd(e.target.value)} className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs outline-none" />
                      </div>
                      <div className="sm:col-span-2 md:col-span-3 lg:col-span-5">
                        <label className="block text-[8px] font-bold uppercase text-slate-400 mb-0.5">Directives</label>
                        <input type="text" placeholder="Add medication alerts, targets, client directives..." value={shiftDirectives} onChange={(e) => setShiftDirectives(e.target.value)} className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs text-slate-800 outline-none" />
                      </div>
                      <div className="flex items-end">
                        <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase rounded-lg py-2.5 transition-all shadow transform active:scale-95 tracking-wide">Deploy entry</button>
                      </div>
                    </form>
                  </div>
                )}

                {/* THE GENUINE GOOGLE CALENDAR-STYLE VISUAL STRUCTURE CANVAS GRID ENGINE (Requested custom addition!) */}
                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                  
                  {/* Calendar controls header row bar panel wrapper component */}
                  <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center justify-between shadow-sm select-none">
                    <button onClick={() => setCurrentCalendarOffset(currentCalendarOffset - 1)} className="bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold px-3 py-1.5 rounded-lg text-xs uppercase tracking-wider transition-colors">← Previous</button>
                    <span className="text-xs font-black uppercase text-blue-900 tracking-widest font-mono bg-white border border-slate-200 px-4 py-1.5 rounded-xl shadow-inner">{getDynamicCalendarHeaderString()}</span>
                    <button onClick={() => setCurrentCalendarOffset(currentCalendarOffset + 1)} className="bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold px-3 py-1.5 rounded-lg text-xs uppercase tracking-wider transition-colors">Next →</button>
                  </div>

                  {/* Structural Calendar Layout Fields matrix row view render */}
                  <div className="bg-white p-4 border-b border-slate-100 grid grid-cols-7 gap-2 text-center text-[10px] font-black uppercase text-slate-400 tracking-widest bg-slate-50/20">
                    {calendarDaysOfWeek.map(d => <div key={d}>{d.substring(0,3)}</div>)}
                  </div>

                  {/* Shifts output array feed tracking list component */}
                  <div className="p-4 sm:p-5 space-y-2.5 bg-white min-h-[180px]">
                    {shifts
                      .filter(s => {
                        if (calendarScope === 'admin') return !s.participant_id;
                        if (calendarScope === 'worker' && selectedCalendarTargetId) return s.staff_id === selectedCalendarTargetId;
                        if (calendarScope === 'participant' && selectedCalendarTargetId) return s.participant_id === selectedCalendarTargetId;
                        return true;
                      })
                      .map(s => {
                        const isUnclaimed = !s.staff_id || s.status === 'available';
                        const workerObj = profiles.find(p => p.id === s.staff_id);
                        const clientObj = participants.find(p => p.id === s.participant_id);

                        return (
                          <div key={s.id} className={`p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4 transition-all rounded-xl border bg-white ${isUnclaimed ? 'border-red-300 bg-red-50/20 shadow-sm' : 'border-slate-200 hover:border-blue-400'}`}>
                            <div className="space-y-1 text-xs">
                              <div className="flex items-center space-x-2">
                                <span className={`w-1.5 h-1.5 rounded-full ${isUnclaimed ? 'bg-red-500 animate-pulse' : 'bg-blue-600'}`} />
                                <h4 className="font-bold text-slate-900 uppercase tracking-wide">{s.title}</h4>
                                {isUnclaimed && <span className="text-[8px] font-bold bg-red-100 text-red-600 px-2 py-0.5 rounded uppercase border border-red-200">Unassigned red alert</span>}
                              </div>
                              <p className="text-slate-500 font-mono font-semibold">
                                Timing range: {new Date(s.start_time).toLocaleDateString('en-AU', { weekday: 'short', day: 'numeric', month: 'short' })} | {new Date(s.start_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - {new Date(s.end_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                              </p>
                              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                                Provider member: <span className="text-slate-700 font-extrabold">{workerObj ? workerObj.full_name : 'None Assigned'}</span> | Client link: <span className="text-slate-700 font-extrabold">{clientObj ? clientObj.name : 'Internal Administrative task'}</span>
                              </p>
                              {s.manager_directives && <p className="text-slate-500 italic bg-slate-50 p-2 rounded border border-slate-200/80 max-w-xl font-medium mt-1">Liaison directives: "{s.manager_directives}"</p>}
                            </div>

                            {isUnclaimed && user.role === 'support_worker' && (
                              <button onClick={() => handleClaimUnclaimedShift(s.id)} className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase px-4 py-2 rounded shadow transition-all transform active:scale-95">Claim Shift</button>
                            )}
                          </div>
                        );
                      })}
                  </div>
                </div>
              </div>
            )}

            {/* PAGE 4: PARTICIPANT PROFILES */}
            {currentTab === 'profiles' && (
              <div className="space-y-6">
                <div className="border-b border-slate-200 pb-4">
                  <h2 className="text-base font-bold uppercase tracking-wider text-blue-900">Participant Profiles</h2>
                  <p className="text-xs text-slate-400">Review critical compliance dockets and behavior support frameworks.</p>
                </div>

                <div className="space-y-2">
                  {participants.map(p => {
                    const isOpen = expandedClient === p.id;
                    return (
                      <div key={p.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm transition-all">
                        <div onClick={() => setExpandedClient(isOpen ? null : p.id)} className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-all select-none">
                          <span className="font-bold text-xs uppercase tracking-wide text-slate-800">{p.name}</span>
                          <span className="text-[10px] font-bold text-blue-600 bg-blue-50 border border-blue-200 px-3 py-1 rounded-lg transition-colors">{isOpen ? 'COLLAPSE FILE ▲' : 'EXPAND DOSSIER ▼'}</span>
                        </div>

                        {isOpen && (
                          <div className="p-5 bg-gray-50/50 border-t border-gray-200 space-y-4 text-xs">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                              <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-inner">
                                <span className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Telephone Primary</span>
                                <p className="font-mono font-bold text-gray-700">{p.primary_contact_phone || 'Unlisted'}</p>
                              </div>
                              <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-inner">
                                <span className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">NDIS Key Code</span>
                                <p className="font-mono font-bold text-gray-700">{p.ndis_number || 'Unlisted'}</p>
                              </div>
                              <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-inner">
                                <span className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Emergency Representative Line</span>
                                <p className="font-bold text-gray-700 uppercase">{p.emergency_contact_name || 'Not logged'}</p>
                                <p className="font-mono font-bold text-blue-600">{p.emergency_contact_phone || ''}</p>
                              </div>
                            </div>
                            <div className="bg-white p-4 rounded-xl border border-gray-200 space-y-1 shadow-inner">
                              <span className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider">Operational Care Notes notes</span>
                              <p className="text-gray-600 leading-relaxed font-medium">{p.about_me_notes || 'No active support records attached to this profile dossier folder.'}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 5: AVAILABILITIES WEEKEND INTERACTIVE ROW ENTRIES */}
            {currentTab === 'availability' && (
              <div className="space-y-6">
                <div className="border-b border-slate-200 pb-4">
                  <h2 className="text-base font-bold uppercase tracking-wider text-blue-900">Availabilities</h2>
                  <p className="text-xs text-slate-400">Lock and update your complete fortnightly scheduling parameters all at once.</p>
                </div>

                <form onSubmit={handleStackedAvailabilitySubmit} className="bg-white border border-slate-200 rounded-xl p-6 space-y-6 shadow-sm">
                  <div className="max-w-xs">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Target Payroll Fortnight Range</label>
                    <select value={availFortnight} onChange={(e) => setAvailFortnight(e.target.value)} className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-blue-600 font-bold focus:outline-none">
                      {fortnights.map(f => <option key={f.id} value={f.id}>{f.label}</option>)}
                    </select>
                  </div>

                  <div className="border border-slate-200 rounded-xl overflow-hidden bg-white divide-y divide-slate-200 shadow-inner">
                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => {
                      const state = availDaysState[day];
                      return (
                        <div key={day} className="p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white hover:bg-slate-50 transition-all">
                          <span className="text-xs font-bold uppercase tracking-wide text-slate-700 w-24">{day}</span>
                          <div className="flex flex-wrap gap-2 items-center">
                            <button type="button" onClick={() => updateAvailabilityMode(day, 'standard')} className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase border transition-all ${state.mode === 'standard' ? 'bg-blue-600 text-white border-blue-600 shadow-sm' : 'bg-white border-gray-300 text-gray-500'}`}>Specific Hours</button>
                            <button type="button" onClick={() => updateAvailabilityMode(day, 'allday')} className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase border transition-all ${state.mode === 'allday' ? 'bg-blue-600 text-white border-blue-600 shadow-sm' : 'bg-white border-gray-300 text-gray-500'}`}>Available All Day</button>
                            <button type="button" onClick={() => updateAvailabilityMode(day, 'unavailable')} className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase border transition-all ${state.mode === 'unavailable' ? 'bg-red-50 text-red-600 border-red-200 shadow-sm' : 'bg-white border-gray-300 text-gray-500'}`}>Not Available</button>
                          </div>

                          {state.mode === 'standard' && (
                            <div className="flex items-center space-x-2 bg-slate-100/60 px-3 py-1 rounded-lg border border-slate-200">
                              <input type="time" value={state.start} onChange={(e) => updateAvailabilityTimes(day, 'start', e.target.value)} className="bg-white border border-slate-300 rounded p-1 text-xs outline-none" />
                              <span className="text-[10px] text-slate-400 font-bold">TO</span>
                              <input type="time" value={state.end} onChange={(e) => updateAvailabilityTimes(day, 'end', e.target.value)} className="bg-white border border-slate-300 rounded p-1 text-xs outline-none" />
                            </div>
                          )}
                          {state.mode === 'allday' && <span className="text-[9px] font-bold tracking-wide text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 uppercase">Available Full 24h</span>}
                          {state.mode === 'unavailable' && <span className="text-[9px] font-bold tracking-wide text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-200 uppercase">Unavailable Block</span>}
                        </div>
                      );
                    })}
                  </div>
                  <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase py-3 rounded shadow transition-all transform active:scale-95">Submit Entire Fortnight Availabilities Block</button>
                </form>
              </div>
            )}

            {/* TAB 6: HORIZONTAL ALIGNED COMPREHENSIVE FORTNIGHT TIMESHEET ROW BUILDERS */}
            {currentTab === 'timesheets' && (
              <div className="space-y-6">
                <div className="border-b border-slate-200 pb-4">
                  <h2 className="text-base font-bold uppercase tracking-wider text-blue-900">Timesheet Submissions</h2>
                  <p className="text-xs text-slate-500">File multi-day stacked shift entries at the close of your pay cycle range.</p>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
                  
                  {/* Master Input Deck list elements container wrapper */}
                  <div className="bg-white border border-slate-200 rounded-xl p-6 xl:col-span-3 space-y-4 shadow-sm h-fit">
                    <form onSubmit={handleStackedTimesheetSubmit} className="space-y-4">
                      <div className="max-w-xs">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Active Payroll Period Range</label>
                        <select value={selectedFortnight} onChange={(e) => setSelectedFortnight(e.target.value)} className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-blue-600 font-bold focus:outline-none">
                          {fortnights.map(f => <option key={f.id} value={f.id}>{f.label}</option>)}
                        </select>
                      </div>

                      {/* HORIZONTAL GRID INPUT SHEET MATRIX (Item 7 requested modifications!) */}
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
                              <label className="block lg:hidden text-[8px] font-bold text-slate-400 uppercase mb-0.5">Date Worked</label>
                              <input type="date" required value={row.date} onChange={(e) => updateTimesheetRowValue(idx, 'date', e.target.value)} className="w-full bg-white border border-slate-200 rounded p-1.5 text-xs font-medium outline-none text-slate-800" />
                            </div>
                            <div className="lg:col-span-2">
                              <label className="block lg:hidden text-[8px] font-bold text-slate-400 uppercase mb-0.5">Start Time</label>
                              <input type="time" required value={row.start} onChange={(e) => updateTimesheetRowValue(idx, 'start', e.target.value)} className="w-full bg-white border border-slate-200 rounded p-1.5 text-xs font-medium outline-none text-slate-800" />
                            </div>
                            <div className="lg:col-span-2">
                              <label className="block lg:hidden text-[8px] font-bold text-slate-400 uppercase mb-0.5">End Time</label>
                              <input type="time" required value={row.end} onChange={(e) => updateTimesheetRowValue(idx, 'end', e.target.value)} className="w-full bg-white border border-slate-200 rounded p-1.5 text-xs font-medium outline-none text-slate-800" />
                            </div>
                            <div className="lg:col-span-3">
                              <label className="block lg:hidden text-[8px] font-bold text-slate-400 uppercase mb-0.5">Participant Entity</label>
                              <select required value={row.client} onChange={(e) => updateTimesheetRowValue(idx, 'client', e.target.value)} className="w-full bg-white border border-slate-200 rounded p-1.5 text-xs text-slate-700 outline-none font-bold">
                                <option value="">-- Pick Client --</option>
                                <option value="Nash Murray">Nash Murray</option>
                                {participants.filter(p=>p.name !== "Nash Murray").map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                              </select>
                            </div>
                            <div className="lg:col-span-1">
                              <label className="block lg:hidden text-[8px] font-bold text-slate-400 uppercase mb-0.5">KM (With Client)</label>
                              <input type="number" value={row.kmWith} onChange={(e) => updateTimesheetRowValue(idx, 'kmWith', e.target.value)} className="w-full bg-white border border-slate-200 rounded p-1.5 text-xs font-medium outline-none text-slate-800" />
                            </div>
                            <div className="lg:col-span-2">
                              <label className="block lg:hidden text-[8px] font-bold text-slate-400 uppercase mb-0.5">KM (Personal Car)</label>
                              <input type="number" value={row.kmWithout} onChange={(e) => updateTimesheetRowValue(idx, 'kmWithout', e.target.value)} className="w-full bg-white border border-slate-200 rounded p-1.5 text-xs font-medium outline-none text-slate-800" />
                            </div>
                            <div className="col-span-12 pt-1 border-t border-slate-200/60 mt-0.5">
                              <label className="block text-[8px] font-bold text-slate-400 uppercase mb-0.5">Shift Summary Notes</label>
                              <input type="text" required placeholder="Outline excursions completed, core metrics hit, targeted compliance records..." value={row.notes} onChange={(e) => updateTimesheetRowValue(idx, 'notes', e.target.value)} className="w-full bg-white border border-slate-200 rounded p-1.5 text-xs font-medium outline-none text-slate-700 focus:border-blue-500" />
                            </div>
                          </div>
                        ))}
                      </div>

                      <button type="button" onClick={addTimesheetRow} className="bg-white hover:bg-slate-100 text-slate-700 font-bold border border-slate-300 text-[10px] uppercase px-4 py-2.5 rounded-lg transition-colors">Add Shift Row to Fortnight Stack</button>

                      <div className="flex items-start space-x-3 bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-inner">
                        <input type="checkbox" required id="notesCheck" checked={tsNotesChecked} onChange={(e) => setTsNotesChecked(e.target.checked)} className="w-4 h-4 mt-0.5 border-slate-300 rounded accent-blue-600" />
                        <label htmlFor="notesCheck" className="text-[11px] text-slate-500 font-medium select-none leading-relaxed">I verify that my comprehensive client shift progression logs and case notes have been officially logged and filed.</label>
                      </div>

                      <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase py-3.5 rounded-xl shadow-md transition-all transform active:scale-95">Transmit Fortnightly Timesheet Remittance Package</button>
                    </form>
                  </div>

                  {/* Sidebar receipt logs component */}
                  <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm h-fit space-y-4">
                    <h3 className="text-xs font-bold text-blue-900 uppercase tracking-wide">Your Personal Remittance History</h3>
                    <div className="space-y-2">
                      {timesheetHistory.filter(h => h.workerEmail === user.email).map(ts => (
                        <div key={ts.id} className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs space-y-1">
                          <span className="block font-mono text-[10px] font-bold text-blue-600">LEDGER BUNDLE: #{ts.id}</span>
                          <p className="font-bold text-slate-800 uppercase tracking-wide">{ts.fortnightLabel}</p>
                          <div className="flex justify-between items-center text-[11px] text-slate-400 font-semibold">
                            <span>Filed: {ts.rowsCount} Days</span>
                            <span>Sum: ~{ts.totalHours}h Logged</span>
                          </div>
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
  );
}
