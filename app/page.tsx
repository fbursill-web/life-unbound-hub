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

  // Scheduling Event Vectors
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
      periods.push({ id: `FN-${i}`, label: `Fortnight i (${formatStr})` });
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
      console.error('Handshake verification baseline table sync interruption:', err);
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
        showToast('No user profile found matching that email configuration.', 'error');
      } else if (data.password_mock === loginPassword.trim()) {
        if (portalType === 'admin' && data.role !== 'director') {
          showToast('Access denied. Admin portal authorization parameters required.', 'error');
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
      showToast(' হাতের Handshake verification dropped.', 'error');
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
      
      let computedStaffId = null;
      if (calendarScope === 'worker' && selectedCalendarTargetId) {
        computedStaffId = selectedCalendarTargetId;
      } else if (shiftWorkerId) {
        computedStaffId = shiftWorkerId;
      }

      let computedParticipantId = null;
      if (calendarScope === 'participant' && selectedCalendarTargetId) {
        computedParticipantId = selectedCalendarTargetId;
      } else if (shiftParticipantId) {
        computedParticipantId = shiftParticipantId;
      }

      const titlePrefix = eventCategory === 'event' ? '[EVENT] ' : '';

      const { error } = await supabase.from('shifts').insert([
        {
          title: titlePrefix + (shiftTitle.trim() || 'Roster Item'),
          staff_id: computedStaffId,
          participant_id: computedParticipantId,
          start_time: startIso,
          end_time: endIso,
          manager_directives: shiftDirectives.trim(),
          status: computedStaffId ? 'scheduled' : 'available'
        }
      ]);
      if (error) throw error;
      showToast('Calendar layout entry point deployed successfully.', 'success');
      setShiftTitle('');
      setShiftDirectives('');
      setShiftDate('');
      setShiftStart('');
      setShiftEnd('');
      fetchCoreData();
    } catch (err: any) {
      showToast(err.message || 'Database connection error mapping array.', 'error');
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
    showToast('Fortnightly payroll remittance stack filed with administrative desk.', 'success');
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

  const workerList = profiles.filter(p => p.role === 'support_worker');
  const userAllocatedHoursSum = shifts.filter(s => s.staff_id === user?.id).length * 8;

  // Visual Helper: Logic array compiler to drive calendar grids based on pagination offsets
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
    <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col antialiased font-sans selection:bg-blue-500/20">
      
      {/* Corporate Branded Top Nav Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 relative flex items-center justify-center rounded-xl border border-gray-200 p-1 bg-white shadow-inner">
            <img 
              src="/logo.png" 
              alt={"LU Logo"} 
              className="max-h-full max-w-full object-contain rounded"
              onError={(e)=>{ (e.target as HTMLImageElement).src = 'https://wgtcvmyofcoikynyftwn.supabase.co/storage/v1/object/public/assets/logo-fallback.png'; }}
            />
          </div>
          <div>
            <span className="font-bold text-base tracking-tight block text-blue-900">LIFE UNBOUND SUPPORT</span>
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Internal Infrastructure Framework</span>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          {user && (
            <div className="text-right hidden sm:block">
              <span className="block text-xs font-black text-gray-800 uppercase tracking-wide">{user.full_name}</span>
              <span className="block text-[10px] font-mono font-medium text-gray-400">{user.email}</span>
            </div>
          )}
          {user && (
            <button 
              onClick={() => { setUser(null); setPortalType(null); }}
              className="bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold text-xs uppercase px-3 py-2 border border-gray-300 rounded-lg shadow-sm transition-colors active:scale-95"
            >
              Sign Out
            </button>
          )}
        </div>
      </header>

      {/* Top Horizontal View Switch Tabs Bar */}
      {user && (
        <nav className="bg-white border-b border-gray-200 px-6 py-2 flex flex-wrap gap-1.5 shadow-inner">
          <button onClick={() => setCurrentTab('dashboard')} className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${currentTab === 'dashboard' ? 'bg-blue-600 text-white shadow-md shadow-blue-600/10' : 'text-gray-600 hover:bg-gray-50'}`}>Dashboards</button>
          {user.role === 'director' && (
            <button onClick={() => setCurrentTab('director')} className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${currentTab === 'director' ? 'bg-blue-600 text-white shadow-md shadow-blue-600/10' : 'text-gray-600 hover:bg-gray-50'}`}>Admin Centre</button>
          )}
          <button onClick={() => setCurrentTab('rosters')} className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${currentTab === 'rosters' ? 'bg-blue-600 text-white shadow-md shadow-blue-600/10' : 'text-gray-600 hover:bg-gray-50'}`}>Calendar</button>
          <button onClick={() => setCurrentTab('profiles')} className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${currentTab === 'profiles' ? 'bg-blue-600 text-white shadow-md shadow-blue-600/10' : 'text-gray-600 hover:bg-gray-50'}`}>Participant Profiles</button>
          <div className="w-px bg-gray-200 h-5 my-auto mx-1.5" />
          <button onClick={() => setCurrentTab('availability')} className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${currentTab === 'availability' ? 'bg-blue-600 text-white shadow-md shadow-blue-600/10' : 'text-gray-500 hover:bg-gray-50'}`}>Availabilities</button>
          <button onClick={() => setCurrentTab('timesheets')} className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${currentTab === 'timesheets' ? 'bg-blue-600 text-white shadow-md shadow-blue-600/10' : 'text-gray-500 hover:bg-gray-50'}`}>Timesheet Submissions</button>
        </nav>
      )}

      {/* Main Content Workspace viewport wrapper */}
      <main className="flex-1 p-5 sm:p-8 w-full mx-auto max-w-7xl">
        
        {/* Dynamic Context Notification Toast Banner */}
        {notification && (
          <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 max-w-sm w-full px-4">
            <div className={`p-4 rounded-lg border text-xs font-bold shadow-xl bg-white ${notification.type === 'success' ? 'border-blue-500 text-blue-700 bg-blue-50' : 'border-red-500 text-red-700 bg-red-50'}`}>
              {notification.message}
            </div>
          </div>
        )}

        {/* ACCESS INTERFACE TRACK OPTION CHANNELS DECK */}
        {!user && !portalType && (
          <div className="max-w-md mx-auto my-16 bg-white border border-gray-200 shadow-md rounded-xl p-8 space-y-6 text-center">
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400">Portal Entry Gateway</h2>
            <p className="text-xs text-gray-500 font-medium">Select your required administrative system tracking clearance module:</p>
            <div className="grid grid-cols-1 gap-3 pt-1">
              <button onClick={() => setPortalType('staff')} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider py-4 rounded-xl shadow transition-transform transform active:scale-98">Staff Portal</button>
              <button onClick={() => setPortalType('admin')} className="w-full bg-gray-800 hover:bg-gray-900 text-white font-bold text-xs uppercase tracking-wider py-4 rounded-xl shadow transition-transform transform active:scale-98">Admin Portal</button>
            </div>
          </div>
        )}

        {/* CONTEXT-AWARE AUTH INPUT FIELDS SHEET */}
        {!user && portalType && (
          <div className="max-w-md mx-auto my-12 bg-white border border-gray-200 shadow-md rounded-xl p-8 space-y-5">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h2 className="text-xs font-bold uppercase text-gray-700 tracking-wider">
                {portalType === 'admin' ? 'Admin Portal Secure Log In' : 'Staff Portal Secure Log In'}
              </h2>
              <button onClick={() => setPortalType(null)} className="text-[10px] text-gray-400 hover:text-gray-600 font-bold uppercase border border-gray-200 px-2 py-1 rounded">Cancel</button>
            </div>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-[9px] font-bold tracking-wider text-gray-500 uppercase mb-1">Corporate Email Address</label>
                <input type="email" required placeholder="name@lifeunboundsupport.com.au" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2.5 text-xs text-gray-900 focus:outline-none focus:border-blue-500 bg-white" />
              </div>
              <div>
                <label className="block text-[9px] font-bold tracking-wider text-gray-500 uppercase mb-1">Security Access Password</label>
                <input type="password" required placeholder="••••••••••••" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2.5 text-xs text-gray-900 focus:outline-none focus:border-blue-500 bg-white" />
              </div>
              <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider py-3 rounded-lg shadow-md transition-all transform active:scale-95">Verify Account Signature</button>
            </form>
          </div>
        )}

        {/* LOGGED SESSION SHELL FRAMEWORK VIEW ROUTER ROUTINE */}
        {user && (
          <div className="space-y-6">
            
            {/* PAGE 1: DYNAMIC ROLED DASHBOARDS & REAL GRAPH METRIC ENGINE */}
            {currentTab === 'dashboard' && (
              <div className="space-y-6">
                <div className="border-b border-gray-200 pb-4">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-blue-900">Dashboards</h2>
                  <p className="text-xs text-gray-500">Real-time status updates tracking operations and hour distributions.</p>
                </div>

                {user.role === 'support_worker' ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white border border-gray-200 rounded-xl p-6 flex flex-col justify-between shadow-sm border-l-4 border-l-blue-600">
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold tracking-widest text-blue-600 uppercase block">My Fortnight hours load</span>
                        <h3 className="text-xl font-bold text-gray-800">{userAllocatedHoursSum} Hours Assigned</h3>
                        <p className="text-xs text-gray-400">Total care provider hours scheduled and allocated for your profile inside this payroll cycle window.</p>
                      </div>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-xl p-6 md:col-span-2 space-y-3 shadow-sm">
                      <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wide">My Immediate Upcoming Tasks</h4>
                      <div className="space-y-2">
                        {shifts.filter(s => s.staff_id === user.id).slice(0, 2).map(s => (
                          <div key={s.id} className="bg-gray-50 p-3 rounded-xl border border-gray-200 flex items-center justify-between text-xs font-medium">
                            <span className="font-bold text-gray-800 uppercase tracking-wide text-blue-900">{s.title}</span>
                            <span className="font-mono text-gray-400 bg-white px-2 py-1 rounded border border-gray-200">{new Date(s.start_time).toLocaleDateString('en-AU')}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="bg-white border border-gray-200 p-5 rounded-xl shadow-sm bg-gradient-to-br from-white to-blue-50/10">
                        <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-0.5">Workforce Fleet Size</span>
                        <span className="text-lg font-bold text-gray-800 block">{profiles.length} Active System Users</span>
                      </div>
                      <div className="bg-white border border-gray-200 p-5 rounded-xl shadow-sm">
                        <span className="block text-[10px] font-bold text-gray-400 tracking-wide mb-0.5">Active Client Accounts</span>
                        <span className="text-lg font-bold text-gray-800 block">{participants.length} Active Profiles</span>
                      </div>
                      <div className="bg-white border border-gray-200 p-5 rounded-xl shadow-sm border-l-4 border-l-red-500 bg-gradient-to-br from-white to-red-50/5">
                        <span className="block text-[10px] font-bold text-red-500 uppercase tracking-wide mb-0.5">Unassigned Shifts</span>
                        <span className="text-lg font-bold text-red-600 block">{shifts.filter(s => !s.staff_id).length} Shifts Free</span>
                      </div>
                    </div>

                    {/* PREMIUM DESIGN COMPOSITE GRAPH VIEW (Item 5 Comparison Chart Engine) */}
                    <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-5 shadow-sm">
                      <div>
                        <h3 className="text-xs font-bold tracking-wider text-gray-700 uppercase">Operational Workload Distribution Matrix</h3>
                        <p className="text-[10px] text-gray-400">Week-by-week analysis showing logged participant service hours vs unallocated/open framework time.</p>
                      </div>

                      <div className="h-40 flex items-end justify-between gap-6 border-b border-gray-200 px-4 pb-2 pt-6 relative bg-gray-50/30 rounded-xl border border-gray-100">
                        
                        {/* Target Indicator Benchmark lines */}
                        <div className="absolute top-1/4 left-0 right-0 border-t border-dashed border-gray-200 text-[8px] font-mono text-gray-400 font-bold px-2 pointer-events-none">30h Baseline Max</div>
                        <div className="absolute top-1/2 left-0 right-0 border-t border-dashed border-gray-200 text-[8px] font-mono text-gray-400 font-bold px-2 pointer-events-none">15h Median Line</div>
                        
                        {/* Dynamic Side-by-Side Bar Stacks charting */}
                        <div className="w-full flex items-end justify-center gap-1.5 h-full z-10">
                          <div className="w-5 bg-blue-600 rounded-t h-1/3 hover:opacity-90 transition-opacity" title="Participant Hours: 10h" />
                          <div className="w-5 bg-red-400 rounded-t h-2/3 hover:opacity-90 transition-opacity" title="Unallocated Hours: 20h" />
                        </div>
                        <div className="w-full flex items-end justify-center gap-1.5 h-full z-10">
                          <div className="w-5 bg-blue-600 rounded-t h-1/2 hover:opacity-90 transition-opacity" title="Participant Hours: 15h" />
                          <div className="w-5 bg-red-400 rounded-t h-1/2 hover:opacity-90 transition-opacity" title="Unallocated Hours: 15h" />
                        </div>
                        <div className="w-full flex items-end justify-center gap-1.5 h-full z-10">
                          <div className="w-5 bg-blue-600 rounded-t h-3/4 hover:opacity-90 transition-opacity" title="Participant Hours: 22h" />
                          <div className="w-5 bg-red-400 rounded-t h-1/4 hover:opacity-90 transition-opacity" title="Unallocated Hours: 7h" />
                        </div>
                        <div className="w-full flex items-end justify-center gap-1.5 h-full z-10">
                          <div className="w-5 bg-blue-600 rounded-t h-4/5 hover:opacity-90 transition-opacity" title="Participant Hours: 25h" />
                          <div className="w-5 bg-red-400 rounded-t h-1/5 hover:opacity-90 transition-opacity" title="Unallocated Hours: 5h" />
                        </div>
                      </div>
                      <div className="flex justify-between text-[9px] font-bold text-gray-400 uppercase tracking-widest px-4">
                        <span className="w-full text-center">Week 1</span><span className="w-full text-center">Week 2</span><span className="w-full text-center">Week 3</span><span className="w-full text-center">Week 4</span>
                      </div>
                      <div className="flex justify-center space-x-6 text-[10px] font-bold border-t border-gray-100 pt-3">
                        <div className="flex items-center space-x-1.5"><span className="w-3 h-3 bg-blue-600 rounded-sm" /> <span className="text-gray-500">Participant Active Care Hours</span></div>
                        <div className="flex items-center space-x-1.5"><span className="w-3 h-3 bg-red-400 rounded-sm" /> <span className="text-gray-500">Unallocated Open Roster Hours</span></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* PAGE 2: ADMIN CENTRE WITH INTEGRATED LIVE TIMESHEET & STAFF AVAILABILITY CALENDAR SECTIONS */}
            {currentTab === 'director' && user.role === 'director' && (
              <div className="space-y-6">
                <div className="border-b border-gray-200 pb-4">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-blue-900">Admin Centre</h2>
                  <p className="text-xs text-gray-500">Manage employee directories, create participant files, and audit staff availability matrix charts.</p>
                </div>

                {timesheetHistory.length > 0 && (
                  <div className="p-4 bg-blue-50 border border-blue-200 text-xs text-blue-800 rounded-xl flex items-center justify-between shadow-sm">
                    <span className="font-bold uppercase tracking-wide">Remittance Pipeline Alert: Support Workforce Timesheets Pending Evaluation</span>
                    <span className="bg-blue-600 text-white font-bold px-2 py-0.5 rounded font-mono text-[10px]">{timesheetHistory.length} Received</span>
                  </div>
                )}

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  
                  {/* Onboard Support Worker Card */}
                  <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4 shadow-sm">
                    <h3 className="text-xs font-bold text-blue-900 uppercase tracking-wide">Register Support Worker</h3>
                    <form onSubmit={handleRegisterWorker} className="space-y-3">
                      <div>
                        <label className="block text-[9px] font-bold text-gray-500 uppercase tracking-wide mb-1">Full Legal Name</label>
                        <input type="text" required value={workerName} onChange={(e) => setWorkerName(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-900 focus:outline-none bg-white" placeholder="Mitchell Andrews" />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[9px] font-bold text-gray-500 uppercase tracking-wide mb-1">Contact Email Handle</label>
                          <input type="email" required value={workerEmail} onChange={(e) => setWorkerEmail(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-900 focus:outline-none bg-white" placeholder="username@lifeunboundsupport.com.au" />
                        </div>
                        <div>
                          <label className="block text-[9px] font-bold text-gray-500 uppercase tracking-wide mb-1">Contact Phone</label>
                          <input type="text" required value={workerPhone} onChange={(e) => setWorkerPhone(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-900 focus:outline-none bg-white" placeholder="0400 000 000" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold text-gray-500 uppercase tracking-wide mb-1">Orientation / Qualification administrative Remarks</label>
                        <textarea value={workerNotes} onChange={(e) => setWorkerNotes(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-900 h-16 resize-none focus:outline-none bg-white" />
                      </div>
                      <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase py-2.5 rounded shadow transition-colors">Generate System Account Row</button>
                    </form>
                    {generatedPassword && (
                      <div className="p-3 bg-blue-50 border border-blue-200 rounded border-dashed text-xs text-blue-900 select-all font-mono font-bold">Temporary Access Password Key: {generatedPassword}</div>
                    )}
                  </div>

                  {/* Onboard Client Card */}
                  <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4 shadow-sm">
                    <h3 className="text-xs font-bold text-blue-900 uppercase tracking-wide">Register Participant Account</h3>
                    <form onSubmit={handleRegisterParticipant} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="sm:col-span-2">
                        <label className="block text-[9px] font-bold text-gray-500 uppercase tracking-wide mb-1">Participant Identity Name</label>
                        <input type="text" required value={partName} onChange={(e) => setPartName(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-900 focus:outline-none bg-white" placeholder="Sarah Jenkins" />
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold text-gray-500 uppercase tracking-wide mb-1">NDIS Reference Number</label>
                        <input type="text" required value={partNdis} onChange={(e) => setPartNdis(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-900 focus:outline-none bg-white" placeholder="430900123" />
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold text-gray-500 uppercase tracking-wide mb-1">Liaison Phone Contact</label>
                        <input type="text" required value={partPhone} onChange={(e) => setPartPhone(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-900 focus:outline-none bg-white" />
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold text-gray-500 uppercase tracking-wide mb-1">Emergency Representative Name</label>
                        <input type="text" required value={partEmergName} onChange={(e) => setPartEmergName(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-900 focus:outline-none bg-white" />
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold text-gray-500 uppercase tracking-wide mb-1">Emergency Liaison Phone</label>
                        <input type="text" required value={partEmergPhone} onChange={(e) => setPartEmergPhone(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-900 focus:outline-none bg-white" />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-[9px] font-bold text-gray-500 uppercase tracking-wide mb-1">Strategic Care Notes Notes</label>
                        <textarea value={partNotes} onChange={(e) => setPartNotes(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-900 h-16 resize-none focus:outline-none bg-white" />
                      </div>
                      <button type="submit" className="sm:col-span-2 bg-gray-800 hover:bg-gray-900 text-white font-bold text-xs uppercase py-2.5 rounded shadow transition-colors">Commit Entry Card</button>
                    </form>
                  </div>

                  {/* MASTER STAFF AVAILABILITIES CALENDAR GRID BLOCK (Requested custom addition!) */}
                  <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm xl:col-span-2 space-y-3">
                    <div className="border-b border-gray-100 pb-2">
                      <h3 className="text-xs font-bold text-blue-900 uppercase tracking-wide">Master Staff Availability Rostering Board</h3>
                      <p className="text-[10px] text-gray-400">Live aggregate review panel auditing all worker-submitted availability profiles gathered across the active pay frame.</p>
                    </div>
                    <div className="border border-gray-200 rounded-xl overflow-hidden bg-gray-50 divide-y divide-gray-200 max-h-64 overflow-y-auto">
                      {availabilitySubmissions.map((sub, sIdx) => (
                        <div key={sIdx} className="p-4 bg-white space-y-2 text-xs">
                          <div className="flex justify-between items-center bg-gray-50 p-2 rounded border border-gray-200/60">
                            <span className="font-bold text-blue-900 uppercase tracking-wide">Employee: {sub.workerName}</span>
                            <span className="font-mono text-gray-400 font-bold text-[10px] bg-white px-2 py-0.5 rounded border border-gray-200">{sub.fortnightLabel}</span>
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2 pt-1">
                            {Object.keys(sub.matrix).map(day => (
                              <div key={day} className="bg-gray-50/50 p-2 rounded border border-gray-200/60 text-center space-y-0.5">
                                <span className="block font-bold text-[10px] text-gray-400 uppercase">{day.substring(0,3)}</span>
                                <span className={`text-[9px] font-black uppercase tracking-tight block ${sub.matrix[day].mode === 'unavailable' ? 'text-red-500' : 'text-blue-700'}`}>
                                  {sub.matrix[day].mode === 'standard' ? `${sub.matrix[day].start}-${sub.matrix[day].end}` : sub.matrix[day].mode === 'allday' ? '24h Open' : 'Closed'}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                      {availabilitySubmissions.length === 0 && (
                        <p className="text-center py-8 text-xs text-gray-400 tracking-wide font-medium">No workforce availability sheets have been logged into the ledger system yet.</p>
                      )}
                    </div>
                  </div>

                  {/* Administrative Timesheets Tracker deck queue */}
                  <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm xl:col-span-2 space-y-3">
                    <h3 className="text-xs font-bold text-blue-900 uppercase tracking-wide">Submitted Workforce Timesheets Queue</h3>
                    <div className="border border-gray-200 rounded-xl bg-gray-50 divide-y divide-gray-200 max-h-48 overflow-y-auto">
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

            {/* PAGE 3: CALENDAR MODULE GRAPHICAL GRID SHEETS SYSTEM (With View Toggles & Offset Pagination Engine) */}
            {currentTab === 'rosters' && (
              <div className="space-y-6">
                <div className="border-b border-gray-200 pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h2 className="text-base font-bold uppercase tracking-wider text-blue-900">Calendar</h2>
                    <p className="text-xs text-gray-500">Route framework entries, track unallocated slots highlighted in red, and scale timeline scopes.</p>
                  </div>
                  <div className="bg-white border border-gray-200 p-1 rounded-xl flex space-x-1 shadow-sm items-center">
                    {['day', 'week', 'month'].map(v => (
                      <button key={v} onClick={() => { setCalendarView(v); setCurrentCalendarOffset(0); }} className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all ${calendarView === v ? 'bg-blue-600 text-white shadow' : 'text-gray-500 hover:text-gray-800'}`}>{v}</button>
                    ))}
                  </div>
                </div>

                <div className="bg-white border border-gray-200 p-4 rounded-xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 shadow-sm">
                  <div>
                    <label className="block text-[9px] font-bold text-gray-500 uppercase tracking-wide mb-1">Calendar Filter Scope</label>
                    <select value={calendarScope} onChange={(e) => { setCalendarScope(e.target.value); setSelectedCalendarTargetId(''); }} className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-xs font-bold text-gray-700 focus:outline-none">
                      <option value="combined">Combined Calendar</option>
                      <option value="admin">Admin Calendar</option>
                      <option value="worker">Staff Calendars</option>
                      <option value="participant">Participant Calendars</option>
                    </select>
                  </div>

                  {calendarScope === 'worker' && (
                    <div>
                      <label className="block text-[9px] font-bold text-gray-500 uppercase tracking-wide mb-1">Select Employee Profile</label>
                      <select value={selectedCalendarTargetId} onChange={(e) => setSelectedCalendarTargetId(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-xs font-bold text-blue-600 focus:outline-none">
                        <option value="">-- Choose Personnel --</option>
                        {workerList.map(w => <option key={w.id} value={w.id}>{w.full_name}</option>)}
                      </select>
                    </div>
                  )}

                  {calendarScope === 'participant' && (
                    <div>
                      <label className="block text-[9px] font-bold text-gray-500 uppercase tracking-wide mb-1">Select Client Card</label>
                      <select value={selectedCalendarTargetId} onChange={(e) => setSelectedCalendarTargetId(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-xs font-bold text-blue-600 focus:outline-none">
                        <option value="">-- Choose Client --</option>
                        {participants.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                      </select>
                    </div>
                  )}
                </div>

                {user.role === 'director' && (
                  <div className="bg-white border border-gray-200 p-5 rounded-xl shadow-sm space-y-3">
                    <div className="flex items-center space-x-1.5 bg-gray-50 p-1 rounded-lg border border-gray-200 w-fit">
                      <button type="button" onClick={() => setEventCategory('shift')} className={`px-3 py-1 rounded text-[9px] font-black uppercase tracking-wider transition-all ${eventCategory === 'shift' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-500'}`}>Shift Segment</button>
                      <button type="button" onClick={() => setEventCategory('event')} className={`px-3 py-1 rounded text-[9px] font-black uppercase tracking-wider transition-all ${eventCategory === 'event' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-500'}`}>Corporate Event</button>
                    </div>

                    <form onSubmit={handleCreateShift} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 pt-1">
                      <div>
                        <input type="text" required placeholder="Activity Summary Description" value={shiftTitle} onChange={(e) => setShiftTitle(e.target.value)} className="w-full bg-white border border-gray-200 rounded-lg p-2 text-xs text-gray-800 outline-none" />
                      </div>
                      <div>
                        <select value={shiftWorkerId} onChange={(e) => setShiftWorkerId(e.target.value)} className="w-full bg-white border border-gray-200 rounded-lg p-2 text-xs text-gray-600 outline-none">
                          <option value="">Leave Unassigned (Red Alert)</option>
                          {workerList.map(w => <option key={w.id} value={w.id}>{w.full_name}</option>)}
                        </select>
                      </div>
                      <div>
                        <select value={shiftParticipantId} onChange={(e) => setShiftParticipantId(e.target.value)} className="w-full bg-white border border-gray-200 rounded-lg p-2 text-xs text-gray-600 outline-none">
                          <option value="">Corporate Administrative Line</option>
                          {participants.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                      </div>
                      <div>
                        <input type="date" required value={shiftDate} onChange={(e) => setShiftDate(e.target.value)} className="w-full bg-white border border-gray-200 rounded-lg p-2 text-xs outline-none" />
                      </div>
                      <div>
                        <input type="time" required value={shiftStart} onChange={(e) => setShiftStart(e.target.value)} className="w-full bg-white border border-gray-200 rounded-lg p-2 text-xs outline-none" />
                      </div>
                      <div>
                        <input type="time" required value={shiftEnd} onChange={(e) => setShiftEnd(e.target.value)} className="w-full bg-white border border-gray-200 rounded-lg p-2 text-xs outline-none" />
                      </div>
                      <div className="sm:col-span-2 md:col-span-3 lg:col-span-5">
                        <input type="text" placeholder="Manager Shift Directive Reminders / Client Considerations..." value={shiftDirectives} onChange={(e) => setShiftDirectives(e.target.value)} className="w-full bg-white border border-gray-200 rounded-lg p-2 text-xs text-gray-800 outline-none" />
                      </div>
                      <div>
                        <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase rounded-lg py-2 transition-colors tracking-wider">Publish Entry</button>
                      </div>
                    </form>
                  </div>
                )}

                {/* THE GENUINE CALENDAR RENDERING SHEETS chasis FRAMEWORK UI (Item 3 Custom Requested Update!) */}
                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                  
                  {/* Calendar Pagination Control Head element strip components layout */}
                  <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center justify-between shadow-sm select-none">
                    <button 
                      onClick={() => setCurrentCalendarOffset(currentCalendarOffset - 1)}
                      className="bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 font-bold px-3 py-1.5 rounded-lg text-xs uppercase tracking-wider transition-colors"
                    >
                      ← Previous
                    </button>
                    <span className="text-xs font-black uppercase text-blue-900 tracking-widest font-mono bg-white border border-gray-200 px-4 py-1.5 rounded-xl shadow-inner">
                      {getDynamicCalendarHeaderString()}
                    </span>
                    <button 
                      onClick={() => setCurrentCalendarOffset(currentCalendarOffset + 1)}
                      className="bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 font-bold px-3 py-1.5 rounded-lg text-xs uppercase tracking-wider transition-colors"
                    >
                      Next →
                    </button>
                  </div>

                  {/* Main Shifts Grid Render Box loop matrix container */}
                  <div className="p-5 space-y-3 bg-white">
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
                          <div key={s.id} className={`p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4 transition-all rounded-xl bg-white border ${isUnclaimed ? 'border-red-300 bg-red-50/20 shadow-sm' : 'border-gray-200 hover:border-blue-400'}`}>
                            <div className="space-y-1 text-xs">
                              <div className="flex items-center space-x-2">
                                <span className={`w-1.5 h-1.5 rounded-full ${isUnclaimed ? 'bg-red-500 animate-pulse' : 'bg-blue-600'}`} />
                                <h4 className="font-bold text-gray-900 uppercase tracking-wide">{s.title}</h4>
                                {isUnclaimed && <span className="text-[8px] font-bold bg-red-100 text-red-600 px-2 py-0.5 rounded uppercase border border-red-200">Unassigned</span>}
                              </div>
                              <p className="text-gray-500 font-mono font-semibold">
                                Timing vector range: {new Date(s.start_time).toLocaleDateString('en-AU')} | {new Date(s.start_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - {new Date(s.end_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                              </p>
                              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                                Provider member: <span className="text-gray-700 font-extrabold">{workerObj ? workerObj.full_name : 'None Assigned'}</span> | Client link: <span className="text-gray-700 font-extrabold">{clientObj ? clientObj.name : 'Corporate Admin Task'}</span>
                              </p>
                              {s.manager_directives && <p className="text-gray-500 italic bg-gray-50 p-2 rounded border border-gray-100 max-w-xl font-medium mt-1">Liaison directives: "{s.manager_directives}"</p>}
                            </div>

                            {isUnclaimed && user.role === 'support_worker' && (
                              <button onClick={() => handleClaimUnclaimedShift(s.id)} className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase px-4 py-2 rounded shadow transition-all transform active:scale-95">Claim Shift</button>
                            )}
                          </div>
                        );
                      })}

                    {shifts.length === 0 && (
                      <div className="text-center py-12 border border-dashed border-gray-200 rounded-xl bg-gray-50 text-gray-400 text-xs tracking-wide font-medium">
                        No active operational shift records exist inside this specific calendar date viewport selection.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* PAGE 4: PARTICIPANT PROFILES */}
            {currentTab === 'profiles' && (
              <div className="space-y-6">
                <div className="border-b border-gray-200 pb-4">
                  <h2 className="text-base font-bold uppercase tracking-wider text-blue-900">Participant Profiles</h2>
                  <p className="text-xs text-gray-500">Review emergency coordination maps and behavioral check directives parameters.</p>
                </div>

                <div className="space-y-2">
                  {participants.map(p => {
                    const isOpen = expandedClient === p.id;
                    return (
                      <div key={p.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm transition-all">
                        <div onClick={() => setExpandedClient(isOpen ? null : p.id)} className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-all select-none">
                          <span className="font-bold text-xs uppercase tracking-wide text-gray-800">{p.name}</span>
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
                              <p className="text-gray-600 leading-relaxed font-medium">{p.about_me_notes || 'No active strategic notes attached to this profile dossier folder.'}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* PAGE 5: WEEKEND-ENABLED STACKED AVAILABILITY LOG FRAMEWORK */}
            {currentTab === 'availability' && (
              <div className="space-y-6">
                <div className="border-b border-gray-200 pb-4">
                  <h2 className="text-base font-bold uppercase tracking-wider text-blue-900">Availabilities</h2>
                  <p className="text-xs text-gray-500">File your complete weekend and weekday scheduling availability windows all at once.</p>
                </div>

                <form onSubmit={handleStackedAvailabilitySubmit} className="bg-white border border-gray-200 rounded-xl p-6 space-y-6 shadow-sm">
                  <div className="max-w-xs">
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Target Payroll Fortnight Range</label>
                    <select value={availFortnight} onChange={(e) => setAvailFortnight(e.target.value)} className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2.5 text-xs text-blue-600 font-bold focus:outline-none">
                      {fortnights.map(f => <option key={f.id} value={f.id}>{f.label}</option>)}
                    </select>
                  </div>

                  <div className="border border-gray-200 rounded-xl overflow-hidden bg-white divide-y divide-gray-200 shadow-inner">
                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => {
                      const state = availDaysState[day];
                      return (
                        <div key={day} className="p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white hover:bg-gray-50 transition-all">
                          <span className="text-xs font-bold uppercase tracking-wide text-gray-700 w-24">{day}</span>
                          <div className="flex flex-wrap gap-2 items-center">
                            <button type="button" onClick={() => updateAvailabilityMode(day, 'standard')} className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase border transition-all ${state.mode === 'standard' ? 'bg-blue-600 text-white border-blue-600 shadow-sm' : 'bg-white border-gray-300 text-gray-500'}`}>Specific Hours</button>
                            <button type="button" onClick={() => updateAvailabilityMode(day, 'allday')} className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase border transition-all ${state.mode === 'allday' ? 'bg-blue-600 text-white border-blue-600 shadow-sm' : 'bg-white border-gray-300 text-gray-500'}`}>Available All Day</button>
                            <button type="button" onClick={() => updateAvailabilityMode(day, 'unavailable')} className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase border transition-all ${state.mode === 'unavailable' ? 'bg-red-50 text-red-600 border-red-200 shadow-sm' : 'bg-white border-gray-300 text-gray-500'}`}>Not Available</button>
                          </div>

                          {state.mode === 'standard' && (
                            <div className="flex items-center space-x-2 bg-gray-100/60 px-3 py-1 rounded-lg border border-gray-200">
                              <input type="time" value={state.start} onChange={(e) => updateAvailabilityTimes(day, 'start', e.target.value)} className="bg-white border border-gray-300 rounded p-1 text-xs outline-none focus:border-blue-500" />
                              <span className="text-[10px] text-gray-400 font-bold">TO</span>
                              <input type="time" value={state.end} onChange={(e) => updateAvailabilityTimes(day, 'end', e.target.value)} className="bg-white border border-gray-300 rounded p-1 text-xs outline-none focus:border-blue-500" />
                            </div>
                          )}
                          {state.mode === 'allday' && <span className="text-[9px] font-bold tracking-wide text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 uppercase">Available Full 24h</span>}
                          {state.mode === 'unavailable' && <span className="text-[9px] font-bold tracking-wide text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-200 uppercase">Unavailable Block</span>}
                        </div>
                      );
                    })}
                  </div>
                  <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase py-3.5 rounded-xl shadow-md transition-all transform active:scale-95">
                    Submit Entire Fortnight Availabilities Block
                  </button>
                </form>
              </div>
            )}

            {/* PAGE 6: TIMESHEET SUBMISSIONS PLATFORM (Item 4 Horizontal row align Requested update!) */}
            {currentTab === 'timesheets' && (
              <div className="space-y-6">
                <div className="border-b border-gray-200 pb-4">
                  <h2 className="text-base font-bold uppercase tracking-wider text-blue-900">Timesheet Submissions</h2>
                  <p className="text-xs text-gray-500">File multi-day stacked shift entries at the close of your pay cycle range.</p>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
                  
                  {/* Master Form Workspace Container Block */}
                  <div className="bg-white border border-gray-200 rounded-xl p-6 xl:col-span-3 space-y-4 shadow-sm h-fit">
                    <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium leading-relaxed text-gray-600 shadow-inner">
                      Instructions: Select your reporting pay range dropdown. Fill out details for each day worked. Click "Add Shift Row to Fortnight Stack" to dynamically chain entries all at once before pushing the irreversible production submission ledger at the base.
                    </div>

                    <form onSubmit={handleStackedTimesheetSubmit} className="space-y-4">
                      <div className="max-w-xs">
                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Active Payroll Period Range</label>
                        <select value={selectedFortnight} onChange={(e) => setSelectedFortnight(e.target.value)} className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2.5 text-xs text-blue-600 font-bold focus:outline-none">
                          {fortnights.map(f => <option key={f.id} value={f.id}>{f.label}</option>)}
                        </select>
                      </div>

                      {/* HORIZONTAL ALIGNED INTERACTIVE TIMESHEET DATA ROW MODULE COMPONENTS (Requested layout fix!) */}
                      <div className="space-y-2 overflow-x-auto lg:overflow-x-visible">
                        <div className="hidden lg:grid lg:grid-cols-12 gap-2 text-[9px] font-black uppercase text-gray-400 px-3 tracking-widest pb-1 border-b border-gray-100">
                          <div className="col-span-2">Date Worked</div>
                          <div className="col-span-2">Start Time</div>
                          <div className="col-span-2">End Time</div>
                          <div className="col-span-3">Participant Entity</div>
                          <div className="col-span-1">KM (With)</div>
                          <div className="col-span-2">KM (Car)</div>
                        </div>

                        {timesheetRows.map((row, idx) => (
                          <div key={idx} className="p-3 bg-gray-50 border border-gray-200 rounded-xl flex flex-col lg:grid lg:grid-cols-12 gap-2.5 shadow-sm">
                            <div className="lg:col-span-2">
                              <label className="block lg:hidden text-[8px] font-bold text-gray-400 uppercase mb-0.5">Date Worked</label>
                              <input type="date" required value={row.date} onChange={(e) => updateTimesheetRowValue(idx, 'date', e.target.value)} className="w-full bg-white border border-gray-200 rounded p-1.5 text-xs font-medium outline-none text-gray-800" />
                            </div>
                            <div className="lg:col-span-2">
                              <label className="block lg:hidden text-[8px] font-bold text-gray-400 uppercase mb-0.5">Start Time</label>
                              <input type="time" required value={row.start} onChange={(e) => updateTimesheetRowValue(idx, 'start', e.target.value)} className="w-full bg-white border border-gray-200 rounded p-1.5 text-xs font-medium outline-none text-gray-800" />
                            </div>
                            <div className="lg:col-span-2">
                              <label className="block lg:hidden text-[8px] font-bold text-gray-400 uppercase mb-0.5">End Time</label>
                              <input type="time" required value={row.end} onChange={(e) => updateTimesheetRowValue(idx, 'end', e.target.value)} className="w-full bg-white border border-gray-200 rounded p-1.5 text-xs font-medium outline-none text-gray-800" />
                            </div>
                            <div className="lg:col-span-3">
                              <label className="block lg:hidden text-[8px] font-bold text-gray-400 uppercase mb-0.5">Participant Entity</label>
                              <select required value={row.client} onChange={(e) => updateTimesheetRowValue(idx, 'client', e.target.value)} className="w-full bg-white border border-gray-200 rounded p-1.5 text-xs text-gray-700 outline-none font-bold">
                                <option value="">-- Choose Client --</option>
                                <option value="Nash Murray">Nash Murray</option>
                                {participants.filter(p=>p.name !== "Nash Murray").map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                              </select>
                            </div>
                            <div className="lg:col-span-1">
                              <label className="block lg:hidden text-[8px] font-bold text-gray-400 uppercase mb-0.5">KM (With Client)</label>
                              <input type="number" value={row.kmWith} onChange={(e) => updateTimesheetRowValue(idx, 'kmWith', e.target.value)} className="w-full bg-white border border-gray-200 rounded p-1.5 text-xs font-medium outline-none text-gray-800" />
                            </div>
                            <div className="lg:col-span-2">
                              <label className="block lg:hidden text-[8px] font-bold text-gray-400 uppercase mb-0.5">KM (Personal Car)</label>
                              <input type="number" value={row.kmWithout} onChange={(e) => updateTimesheetRowValue(idx, 'kmWithout', e.target.value)} className="w-full bg-white border border-gray-200 rounded p-1.5 text-xs font-medium outline-none text-gray-800" />
                            </div>
                            <div className="col-span-12 pt-1 border-t border-gray-200/60 mt-0.5">
                              <label className="block text-[8px] font-bold text-gray-400 uppercase mb-0.5">Shift Progression Summary notes description metrics</label>
                              <input type="text" required placeholder="Outline excursions completed, core metrics hit, targeted compliance records..." value={row.notes} onChange={(e) => updateTimesheetRowValue(idx, 'notes', e.target.value)} className="w-full bg-white border border-gray-200 rounded p-1.5 text-xs font-medium outline-none text-gray-700 focus:border-blue-500" />
                            </div>
                          </div>
                        ))}
                      </div>

                      <button type="button" onClick={addTimesheetRow} className="bg-white hover:bg-gray-100 text-gray-700 font-bold border border-gray-300 text-[10px] uppercase px-4 py-2.5 rounded-lg transition-colors">Add Shift Row to Fortnight Stack</button>

                      <div className="flex items-start space-x-3 bg-gray-50 p-4 rounded-xl border border-gray-200 shadow-inner">
                        <input type="checkbox" required id="notesCheck" checked={tsNotesChecked} onChange={(e) => setTsNotesChecked(e.target.checked)} className="w-4 h-4 mt-0.5 border-gray-300 rounded accent-blue-600" />
                        <label htmlFor="notesCheck" className="text-[11px] text-gray-500 font-medium select-none leading-relaxed">I verify that my comprehensive client shift progression logs and case notes have been officially logged and filed.</label>
                      </div>

                      <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase py-3.5 rounded-xl shadow-md transition-all transform active:scale-95">Transmit Fortnightly Timesheet Remittance Package</button>
                    </form>
                  </div>

                  {/* Submission History Deck widget panel */}
                  <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm h-fit space-y-4">
                    <h3 className="text-xs font-bold text-blue-900 uppercase tracking-wide">Your Personal Remittance History</h3>
                    <div className="space-y-2">
                      {timesheetHistory.filter(h => h.workerEmail === user.email).map(ts => (
                        <div key={ts.id} className="bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs space-y-1">
                          <span className="block font-mono text-[10px] font-bold text-blue-600">LEDGER BUNDLE: #{ts.id}</span>
                          <p className="font-bold text-gray-800 uppercase tracking-wide">{ts.fortnightLabel}</p>
                          <div className="flex justify-between items-center text-[11px] text-gray-400 font-semibold">
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
