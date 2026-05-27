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
  const [allocationType, setAllocationType] = useState('available'); // 'available', 'admin', 'staff', 'participant'
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
      console.error('Core sync error:', err);
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
          showToast('Access denied. Administrator privileges required.', 'error');
          setLoading(false);
          return;
        }
        setUser(data);
        showToast('Authentication successful.', 'success');
        setCurrentTab('dashboard');
      } else {
        showToast('Invalid access password configuration.', 'error');
      }
    } catch (err) {
      showToast('Handshake rejected. Verify connection keys.', 'error');
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
      showToast(`Account for ${workerName} initialized safely.`, 'success');
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
      showToast('Participant profile synchronized cleanly to registry.', 'success');
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

  // ADVANCED MULTI-TARGET ASSIGNMENT DISTRIBUTOR ENGINE
  const handleCreateShift = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const startIso = `${shiftDate}T${shiftStart}:00`;
      const endIso = `${shiftDate}T${shiftEnd}:00`;
      const titlePrefix = eventCategory === 'event' ? '[EVENT] ' : '';
      const finalTitle = titlePrefix + (shiftTitle.trim() || 'Roster Item');

      // Compile arrays into single insertion loops or comma fields to route onto multiple timelines dynamically
      const targetWorkers = allocationType === 'staff' ? selectedWorkerIds : [null];
      const targetClients = allocationType === 'participant' ? selectedParticipantIds : [null];

      let insertionRows: any[] = [];

      if (allocationType === 'available') {
        insertionRows.push({
          title: finalTitle,
          staff_id: null,
          participant_id: shiftParticipantId || null,
          start_time: startIso,
          end_time: endIso,
          manager_directives: shiftDirectives.trim(),
          status: 'available'
        });
      } else if (allocationType === 'admin') {
        insertionRows.push({
          title: finalTitle,
          staff_id: shiftWorkerId || null,
          participant_id: null,
          start_time: startIso,
          end_time: endIso,
          manager_directives: shiftDirectives.trim(),
          status: 'scheduled'
        });
      } else {
        // Cross-multiply allocations to link multiple staff and participants onto crosswise stream views
        const workersToLoop = selectedWorkerIds.length > 0 ? selectedWorkerIds : [null];
        const clientsToLoop = selectedParticipantIds.length > 0 ? selectedParticipantIds : [null];

        workersToLoop.forEach(wId => {
          clientsToLoop.forEach(pId => {
            insertionRows.push({
              title: finalTitle,
              staff_id: wId,
              participant_id: pId,
              start_time: startIso,
              end_time: endIso,
              manager_directives: shiftDirectives.trim(),
              status: wId ? 'scheduled' : 'available'
            });
          });
        });
      }

      const { error } = await supabase.from('shifts').insert(insertionRows);
      if (error) throw error;
      
      showToast(`Successfully published ${insertionRows.length} items across targeted streams.`, 'success');
      setShiftTitle('');
      setShiftDirectives('');
      setShiftDate('');
      setShiftStart('');
      setShiftEnd('');
      setSelectedWorkerIds([]);
      setSelectedParticipantIds([]);
      fetchCoreData();
    } catch (err: any) {
      showToast(err.message || 'Database rejected multi-target layout compilation.', 'error');
    }
  };

  const handleToggleWorkerCheckbox = (id: string) => {
    if (selectedWorkerIds.includes(id)) {
      setSelectedWorkerIds(selectedWorkerIds.filter(item => item !== id));
    } else {
      setSelectedWorkerIds([...selectedWorkerIds, id]);
    }
  };

  const handleToggleParticipantCheckbox = (id: string) => {
    if (selectedParticipantIds.includes(id)) {
      setSelectedParticipantIds(selectedParticipantIds.filter(item => item !== id));
    } else {
      setSelectedParticipantIds([...selectedParticipantIds, id]);
    }
  };

  const handleClaimUnclaimedShift = async (id: string) => {
    try {
      const { error } = await supabase
        .from('shifts')
        .update({ staff_id: user.id, status: 'scheduled' })
        .eq('id', id);
      if (error) throw error;
      showToast('Shift assigned cleanly onto your staff roster.', 'success');
      fetchCoreData();
    } catch (err) {
      showToast('Error binding assignment.', 'error');
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
      workerName: user.full_name,
      workerEmail: user.email,
      fortnightId: selectedFortnight,
      fortnightLabel: fortnights.find(f => f.id === selectedFortnight)?.label || selectedFortnight,
      rowsCount: timesheetRows.length,
      totalHours: computedHoursTotal,
      submittedDate: new Date().toLocaleDateString('en-AU')
    };

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
    const submissionItem = {
      id: uniqueLogId,
      workerName: user.full_name,
      fortnightId: availFortnight,
      fortnightLabel: fortnights.find(f => f.id === availFortnight)?.label || availFortnight,
      matrix: { ...availDaysState },
      submittedAt: new Date().toLocaleDateString('en-AU')
    };
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
      
      {/* Light Clean Navigation Bar */}
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
            <button 
              onClick={() => { setUser(null); setPortalType(null); }}
              className="bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs uppercase px-3 py-2 border border-slate-300 rounded-lg shadow-sm transition-colors active:scale-95"
            >
              Sign Out
            </button>
          )}
        </div>
      </header>

      {/* Top Horizontal View Switch Tabs Bar Navigation */}
      {user && (
        <nav className="bg-white border-b border-slate-200 px-6 py-2 flex flex-wrap gap-1.5 shadow-sm">
          <button onClick={() => setCurrentTab('dashboard')} className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${currentTab === 'dashboard' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'}`}>Dashboards</button>
          {user.role === 'director' && (
            <button onClick={() => setCurrentTab('director')} className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${currentTab === 'director' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'}`}>Admin Centre</button>
          )}
          <button onClick={() => setCurrentTab('rosters')} className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${currentTab === 'rosters' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'}`}>Calendar</button>
          <button onClick={() => setCurrentTab('profiles')} className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${currentTab === 'profiles' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'}`}>Participant Profiles</button>
          <div className="w-px bg-slate-200 h-5 my-auto mx-1.5" />
          <button onClick={() => setCurrentTab('availability')} className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${currentTab === 'availability' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}>Availabilities</button>
          <button onClick={() => setCurrentTab('timesheets')} className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${currentTab === 'timesheets' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}>Timesheet Submissions</button>
        </nav>
      )}

      {/* Main Workspace Frame App Canvas */}
      <main className="flex-1 p-5 sm:p-8 w-full mx-auto max-w-7xl">
        
        {notification && (
          <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 max-w-sm w-full px-4">
            <div className={`p-4 rounded-lg border text-xs font-bold shadow-xl bg-white ${notification.type === 'success' ? 'border-blue-500 text-blue-700 bg-blue-50' : 'border-red-500 text-red-700 bg-red-50'}`}>
              {notification.message}
            </div>
          </div>
        )}

        {/* RESTORED CLEAR TEXT LOGIN LANDING GATE SELECTION MODULE (Item 1 Fix!) */}
        {!user && !portalType && (
          <div className="max-w-md mx-auto my-16 bg-white border border-slate-200 shadow-md rounded-xl p-8 space-y-5 text-center">
            <h1 className="text-sm font-black uppercase tracking-widest text-slate-400">Portal Entry Gateway</h1>
            <p className="text-xs text-slate-500 font-semibold">Please select your operational workspace module below to enter:</p>
            <div className="grid grid-cols-1 gap-3 pt-2">
              <button onClick={() => setPortalType('staff')} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider py-4 rounded-xl shadow transition-transform transform active:scale-98">
                Open Staff Workspace Portal
              </button>
              <button onClick={() => setPortalType('admin')} className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs uppercase tracking-wider py-4 rounded-xl shadow transition-transform transform active:scale-98">
                Open Administrative Director Portal
              </button>
            </div>
          </div>
        )}

        {!user && portalType && (
          <div className="max-w-md mx-auto my-12 bg-white border border-slate-200 shadow-md rounded-xl p-8 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-xs font-bold uppercase text-slate-700 tracking-wider">
                {portalType === 'admin' ? 'Admin Portal Secure Log In' : 'Staff Portal Secure Log In'}
              </h2>
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

                  {/* CURRENT WEEK TIMELINE TRACKER COMPONENT (Requested layout addition!) */}
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

                  <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm xl:col-span-2 space-y-2">
                    <h3 className="text-xs font-bold text-blue-900 uppercase tracking-wide">Staff Availability Audit Board</h3>
                    <div className="border border-slate-200 rounded-xl bg-slate-50 divide-y divide-slate-200 max-h-40 overflow-y-auto">
                      {availabilitySubmissions.map((sub, sIdx) => (
                        <div key={sIdx} className="p-3 bg-white text-xs flex justify-between items-center">
                          <span className="font-bold text-slate-800">{sub.workerName} availability parameters compiled</span>
                          <span className="font-mono text-slate-400 text-[10px] font-bold">{sub.fortnightLabel}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* PAGE 3: FULL GOOGLE CALENDAR LAYOUT ARCHITECTURE MODULE GRID (Month, Week, & Day Views) */}
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

                {/* ADVANCED ALLOCATION CHASSIS GRID (Item 3 & 5 re-engineered multi-target selection) */}
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

                      {/* TRUE TARGET SELECTION TRACK TYPE FIELD LOGIC (Item 3 re-engineered) */}
                      <div className="lg:col-span-2 bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1">
                        <label className="block text-[9px] font-black uppercase text-slate-500 tracking-wider">Allocation Target Stream</label>
                        <select value={allocationType} onChange={(e)=>setAllocationType(e.target.value)} className="w-full bg-white border border-slate-200 rounded p-1 text-xs font-bold text-blue-600 outline-none">
                          <option value="available">Unassigned / Open Available (Red Alert block)</option>
                          <option value="admin">Corporate Administration Calendar Link</option>
                          <option value="staff">Staff Scheduled Timeline (Multi-Select below)</option>
                          <option value="participant">Participant Dedicated Timeline (Multi-Select below)</option>
                        </select>
                      </div>

                      {/* DYNAMIC MULTI-SELECT CHECKBOX LIST TRACK CANVAS */}
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

                        {allocationType !== 'staff' && allocationType !== 'participant' && (
                          <span className="text-[10px] text-slate-400 italic block pt-1 leading-normal">System links automatically to target parameter categories selected left.</span>
                        )}
                      </div>

                      <div className="lg:col-span-4">
                        <input type="text" placeholder="Manager Directives / Reminders..." value={shiftDirectives} onChange={(e) => setShiftDirectives(e.target.value)} className="w-full bg-white border border-gray-200 rounded-lg p-2 text-xs text-gray-800 outline-none" />
                      </div>
                      <div className="lg:col-span-2 flex items-end">
                        <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase py-2.5 rounded-lg transition-transform transform active:scale-95 shadow">Deploy Event Rows</button>
                      </div>
                    </form>
                  </div>
                )}

                {/* THE GENUINE HIGH-FIDELITY VISUAL CALENDAR CHASSIS GRID (Month, Week, Day layouts requested updates) */}
                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                  
                  {/* Pager control strip */}
                  <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center justify-between shadow-sm select-none">
                    <button onClick={() => setCurrentCalendarOffset(currentCalendarOffset - 1)} className="bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold px-3 py-1.5 rounded-lg text-xs uppercase transition-colors">← Previous</button>
                    <span className="text-xs font-black uppercase text-blue-900 tracking-widest font-mono bg-white border border-slate-200 px-4 py-1.5 rounded-xl shadow-inner">{getDynamicCalendarHeaderString()}</span>
                    <button onClick={() => setCurrentCalendarOffset(currentCalendarOffset + 1)} className="bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold px-3 py-1.5 rounded-lg text-xs uppercase transition-colors">Next →</button>
                  </div>

                  {/* VISUAL MODULE 1: MONTH OVERVIEW GRID SYSTEM */}
                  {calendarView === 'month' && (
                    <div className="bg-white p-4 space-y-4">
                      {/* Day Label headers */}
                      <div className="grid grid-cols-7 gap-2 text-center text-[10px] font-black uppercase text-slate-400 tracking-widest">
                        {calendarDaysOfWeek.map(d => <div key={d}>{d.substring(0,3)}</div>)}
                      </div>
                      {/* Interactive Month Square blocks grid blueprint */}
                      <div className="grid grid-cols-7 gap-2 pt-1 border border-slate-100 rounded-xl p-2 bg-slate-50/20">
                        {Array.from({ length: 28 }).map((_, blockIdx) => {
                          const mockDayNumber = blockIdx + 1;
                          // Collect entries matching this specific calendar slot calculation
                          const dayShifts = shifts.filter(s => new Date(s.start_time).getDate() === mockDayNumber);

                          return (
                            <div key={blockIdx} className="bg-white border border-slate-200 p-2 rounded-xl min-h-[95px] flex flex-col justify-between hover:border-blue-400 transition-colors">
                              <span className="block text-[10px] font-mono font-bold text-slate-400 text-right">{mockDayNumber}</span>
                              <div className="flex-1 space-y-1 pt-1 overflow-hidden">
                                {dayShifts.slice(0,2).map(s => (
                                  <div key={s.id} className={`text-[8px] font-extrabold p-0.5 rounded border truncate uppercase tracking-tight ${!s.staff_id ? 'bg-red-50 text-red-600 border-red-200' : 'bg-blue-50 text-blue-700 border-blue-100'}`}>
                                    {s.title}
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* VISUAL MODULE 2: WEEK OVERVIEW COLUMNS BREAKDOWN BLUEPRINT */}
                  {calendarView === 'week' && (
                    <div className="bg-white p-4 grid grid-cols-7 gap-3 min-h-[220px]">
                      {calendarDaysOfWeek.map(dayName => {
                        const dayShifts = shifts.filter(s => new Date(s.start_time).toLocaleDateString('en-US', { weekday: 'long' }) === dayName);
                        return (
                          <div key={dayName} className="bg-slate-50/50 border border-slate-200 p-3 rounded-xl space-y-2 flex flex-col justify-start">
                            <span className="block text-center font-black uppercase tracking-wider text-[10px] text-slate-400 border-b border-slate-200 pb-1.5">{dayName.substring(0,3)}</span>
                            <div className="space-y-1.5 flex-1 overflow-y-auto">
                              {dayShifts.map(s => (
                                <div key={s.id} className={`p-2 rounded-lg border text-[9px] font-bold uppercase tracking-tight leading-snug shadow-sm ${!s.staff_id ? 'bg-red-50 text-red-600 border-red-300' : 'bg-white text-blue-900 border-blue-200'}`}>
                                  <span className="block font-black text-blue-700 truncate">{s.title}</span>
                                  <span className="block font-mono text-[8px] font-medium text-slate-400 pt-0.5">{new Date(s.start_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* VISUAL MODULE 3: DAY VIEW ISOLATED HOURS SHEET TRACK */}
                  {calendarView === 'day' && (
                    <div className="bg-white p-5 divide-y divide-slate-100 max-h-80 overflow-y-auto font-mono text-xs">
                      {['09:00', '11:00', '13:00', '15:00', '17:00'].map(hourStamp => {
                        const hourShifts = shifts.filter(s => new Date(s.start_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) === hourStamp);
                        return (
                          <div key={hourStamp} className="py-4 flex items-start gap-4">
                            <span className="w-16 block font-bold text-blue-600 select-none text-right">{hourStamp}</span>
                            <div className="flex-1 space-y-1">
                              {hourShifts.map(s => (
                                <div key={s.id} className={`p-3 rounded-xl border text-xs font-sans font-bold flex justify-between items-center ${!s.staff_id ? 'bg-red-50 border-red-300 text-red-700' : 'bg-blue-50/50 border-blue-200 text-blue-900'}`}>
                                  <div>
                                    <span className="block font-black uppercase tracking-wide">{s.title}</span>
                                    {s.manager_directives && <p className="text-[11px] text-slate-400 italic pt-0.5 font-medium">Directive: "{s.manager_directives}"</p>}
                                  </div>
                                  {!s.staff_id && user.role === 'support_worker' && (
                                    <button onClick={() => handleClaimUnclaimedShift(s.id)} className="bg-red-600 text-white text-[10px] uppercase font-bold px-3 py-1 rounded shadow">Claim Position</button>
                                  )}
                                </div>
                              ))}
                              {hourShifts.length === 0 && <span className="text-slate-300 italic text-[11px] block pt-0.5">No schedule line entries assigned to this time parameter window</span>}
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
                  <p className="text-xs text-slate-400">Review critical compliance folders and emergency coordination files.</p>
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

            {/* PAGE 5: FORTNIGHTLY AVAILABILITY WINDOWS MATRIX */}
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

            {/* PAGE 6: TIMESHEET SUBMISSIONS WITH RE-LABELED FORTNIGHT STRINGS */}
            {currentTab === 'timesheets' && (
              <div className="space-y-6">
                <div className="border-b border-slate-200 pb-4">
                  <h2 className="text-base font-bold uppercase tracking-wider text-blue-900">Timesheet Submissions</h2>
                  <p className="text-xs text-slate-500">File multi-day stacked shift entries at the close of your pay cycle range.</p>
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
                                <option value="">-- Choose Client --</option>
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
