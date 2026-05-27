'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://wgtcvmyofcoikynyftwn.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_naqzF_7iH63JA-0G2pw8Cw_XY7waAin';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function LifeUnboundPortal() {
  // Portal Entry & Session States
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

  // UI Interactive States
  const [expandedClient, setExpandedClient] = useState<string | null>(null);
  const [calendarScope, setCalendarScope] = useState('combined'); 
  const [selectedCalendarTargetId, setSelectedCalendarTargetId] = useState('');
  const [calendarView, setCalendarView] = useState('month'); 

  // Pay Cycle Engine (Starts Mon Jan 5, 2026)
  const [fortnights, setFortnights] = useState<any[]>([]);
  const [selectedFortnight, setSelectedFortnight] = useState('');

  // Form Input Buffers
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
  const [eventCategory, setEventCategory] = useState('shift'); // 'shift', 'event'
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
        if (portalType === 'admin' && data.role !== 'director') {
          showToast('Access denied. This user does not have administrative rights.', 'error');
          setLoading(false);
          return;
        }
        setUser(data);
        showToast('Authentication successful.', 'success');
        setCurrentTab('dashboard');
      } else {
        showToast('Invalid access credentials.', 'error');
      }
    } catch (err) {
      showToast('Handshake rejected. Verify system keys.', 'error');
    } final {
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
      showToast('Participant registered successfully.', 'success');
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
      showToast('Calendar row item deployed successfully.', 'success');
      setShiftTitle('');
      setShiftDirectives('');
      setShiftDate('');
      setShiftStart('');
      setShiftEnd('');
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
      showToast('Shift assigned onto your staff roster.', 'success');
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
    showToast('Fortnightly timesheet package filed securely.', 'success');
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
    setAvailabilitySubmissions([submissionItem, ...availabilitySubmissions]);
    showToast('Fortnightly availabilities synchronized successfully.', 'success');
  };

  const workerList = profiles.filter(p => p.role === 'support_worker');
  const userAllocatedHoursSum = shifts.filter(s => s.staff_id === user?.id).length * 8;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col antialiased font-sans">
      
      {/* Clean Light Navigation Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 relative flex items-center justify-center rounded-lg border border-gray-200 p-1 bg-white">
            <img 
              src="/logo.png" 
              alt={"LU Logo"} 
              className="max-h-full max-w-full object-contain rounded"
              onError={(e)=>{ (e.target as HTMLImageElement).src = 'https://wgtcvmyofcoikynyftwn.supabase.co/storage/v1/object/public/assets/logo-fallback.png'; }}
            />
          </div>
          <div>
            <span className="font-bold text-lg tracking-tight block text-blue-900">LIFE UNBOUND SUPPORT</span>
            <span className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">Operations Control Panel</span>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          {user && (
            <div className="text-right hidden sm:block">
              <span className="block text-xs font-bold text-gray-800 uppercase">{user.full_name}</span>
              <span className="block text-[10px] font-mono text-gray-400">{user.email}</span>
            </div>
          )}
          {user && (
            <button 
              onClick={() => { setUser(null); setPortalType(null); }}
              className="bg-white hover:bg-gray-100 text-gray-700 font-bold text-xs uppercase px-3 py-2 rounded border border-gray-300 transition-all active:scale-95"
            >
              Sign Out
            </button>
          )}
        </div>
      </header>

      {/* TOP NAVIGATION LINK SYSTEM (Replaced the sidebar layout!) */}
      {user && (
        <nav className="bg-white border-b border-gray-200 px-6 py-2 flex flex-wrap gap-2 shadow-sm">
          <button 
            onClick={() => setCurrentTab('dashboard')}
            className={`px-4 py-2 rounded text-xs font-bold uppercase tracking-wider transition-all ${currentTab === 'dashboard' ? 'bg-blue-600 text-white shadow' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            Dashboards
          </button>
          {user.role === 'director' && (
            <button 
              onClick={() => setCurrentTab('director')}
              className={`px-4 py-2 rounded text-xs font-bold uppercase tracking-wider transition-all ${currentTab === 'director' ? 'bg-blue-600 text-white shadow' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              Admin Centre
            </button>
          )}
          <button 
            onClick={() => setCurrentTab('rosters')}
            className={`px-4 py-2 rounded text-xs font-bold uppercase tracking-wider transition-all ${currentTab === 'rosters' ? 'bg-blue-600 text-white shadow' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            Calendar
          </button>
          <button 
            onClick={() => setCurrentTab('profiles')}
            className={`px-4 py-2 rounded text-xs font-bold uppercase tracking-wider transition-all ${currentTab === 'profiles' ? 'bg-blue-600 text-white shadow' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            Participant Profiles
          </button>
          <div className="w-px bg-gray-200 h-6 my-auto mx-1" />
          <button 
            onClick={() => setCurrentTab('availability')}
            className={`px-4 py-2 rounded text-xs font-bold uppercase tracking-wider transition-all ${currentTab === 'availability' ? 'bg-blue-600 text-white shadow' : 'text-gray-500 hover:bg-gray-100'}`}
          >
            Availabilities
          </button>
          <button 
            onClick={() => setCurrentTab('timesheets')}
            className={`px-4 py-2 rounded text-xs font-bold uppercase tracking-wider transition-all ${currentTab === 'timesheets' ? 'bg-blue-600 text-white shadow' : 'text-gray-500 hover:bg-gray-100'}`}
          >
            Timesheet Submissions
          </button>
        </nav>
      )}

      {/* Main App Canvas */}
      <main className="flex-1 p-6 sm:p-8 w-full mx-auto max-w-7xl">
        
        {/* Toast Notification Container */}
        {notification && (
          <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 max-w-sm w-full px-4">
            <div className={`p-4 rounded border text-xs font-bold shadow-lg bg-white ${notification.type === 'success' ? 'border-blue-500 text-blue-600' : 'border-red-500 text-red-600'}`}>
              {notification.message}
            </div>
          </div>
        )}

        {/* SPLIT ENTRY LOG-IN GATE SYSTEM (Item 1 & Design Cleanup) */}
        {!user && !portalType && (
          <div className="max-w-md mx-auto my-16 bg-white border border-gray-200 shadow-lg rounded-xl p-8 space-y-6 text-center">
            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-400">Portal Entry Gateway</h2>
            <p className="text-xs text-gray-500">Select your required application system module workspace level:</p>
            <div className="grid grid-cols-1 gap-3 pt-2">
              <button 
                onClick={() => setPortalType('staff')}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider py-4 rounded-lg shadow transition-all transform active:scale-95"
              >
                Staff Portal
              </button>
              <button 
                onClick={() => setPortalType('admin')}
                className="w-full bg-gray-800 hover:bg-gray-900 text-white font-bold text-xs uppercase tracking-wider py-4 rounded-lg shadow transition-all transform active:scale-95"
              >
                Admin Portal
              </button>
            </div>
          </div>
        )}

        {/* Dynamic Contextual Auth Input Panel */}
        {!user && portalType && (
          <div className="max-w-md mx-auto my-12 bg-white border border-gray-200 shadow-lg rounded-xl p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h2 className="text-sm font-bold uppercase text-gray-800 tracking-wider">
                {portalType === 'admin' ? 'Admin Portal Secure Log In' : 'Staff Portal Secure Log In'}
              </h2>
              <button onClick={() => setPortalType(null)} className="text-xs text-gray-400 hover:text-gray-600 font-bold uppercase">Back</button>
            </div>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold tracking-wider text-gray-500 uppercase mb-1">Corporate Email Address</label>
                <input 
                  type="email" required placeholder="name@lifeunboundsupport.com.au" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2.5 text-xs text-gray-900 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold tracking-wider text-gray-500 uppercase mb-1">Security Access Password</label>
                <input 
                  type="password" required placeholder="••••••••••••" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2.5 text-xs text-gray-900 focus:outline-none focus:border-blue-500"
                />
              </div>
              <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-wider py-3 rounded-lg shadow transform active:scale-95 transition-all">
                Verify Credentials
              </button>
            </form>
          </div>
        )}

        {/* ACTIVE DASHBOARD CONTAINER ROUTER */}
        {user && (
          <div className="space-y-6">
            
            {/* TAB 1: DASHBOARDS (Item 1 requested modifications) */}
            {currentTab === 'dashboard' && (
              <div className="space-y-6">
                <div className="border-b border-gray-200 pb-4">
                  <h2 className="text-base font-bold uppercase tracking-wider text-blue-900">Dashboards</h2>
                  <p className="text-xs text-gray-500">Summary overview of current payload limits and operational parameters.</p>
                </div>

                {user.role === 'support_worker' ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white border border-gray-200 rounded-xl p-6 flex flex-col justify-between shadow-sm">
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold tracking-widest text-blue-600 uppercase block">My Fortnight Hours</span>
                        <h3 className="text-xl font-bold text-gray-800">{userAllocatedHoursSum} Hours Assigned</h3>
                        <p className="text-xs text-gray-400">Total care hours currently mapped to your active calendar profile for this period.</p>
                      </div>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-xl p-6 md:col-span-2 space-y-3 shadow-sm">
                      <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wide">Next Roster Items</h4>
                      <div className="space-y-2">
                        {shifts.filter(s => s.staff_id === user.id).slice(0, 2).map(s => (
                          <div key={s.id} className="bg-gray-50 p-3 rounded border border-gray-200 flex items-center justify-between text-xs">
                            <span className="font-bold text-gray-800 uppercase tracking-wide">{s.title}</span>
                            <span className="font-mono text-gray-500">{new Date(s.start_time).toLocaleDateString('en-AU')}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm">
                      <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">Company Workforce Size</span>
                      <span className="text-lg font-bold text-gray-800 block">{profiles.length} Active System Profiles</span>
                    </div>
                    <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm">
                      <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">Active Client Registry</span>
                      <span className="text-lg font-bold text-gray-800 block">{participants.length} Participant Records</span>
                    </div>
                    <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm border-l-4 border-l-red-500">
                      <span className="block text-[10px] font-bold text-red-500 uppercase tracking-wide mb-1">Unassigned Shifts</span>
                      <span className="text-lg font-bold text-red-600 block">{shifts.filter(s => !s.staff_id).length} Shifts Open</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: ADMIN CENTRE (Item 2 requested modifications + Notification Badger) */}
            {currentTab === 'director' && user.role === 'director' && (
              <div className="space-y-6">
                <div className="border-b border-gray-200 pb-4">
                  <h2 className="text-base font-bold uppercase tracking-wider text-blue-900">Admin Centre</h2>
                  <p className="text-xs text-gray-500">Configure core personnel registries and evaluate submitted provider timesheets.</p>
                </div>

                {/* Submissions Alerts Banner Flag logic */}
                {timesheetHistory.length > 0 && (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 text-xs rounded-xl flex items-center justify-between text-yellow-800 shadow-sm animate-pulse">
                    <span className="font-bold uppercase tracking-wide">Notification: Employee Timesheet Packets Have Been Received and Await Review</span>
                    <span className="bg-yellow-600 text-white font-bold px-2 py-0.5 rounded font-mono text-[10px]">{timesheetHistory.length} New</span>
                  </div>
                )}

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  
                  {/* Worker Creation Form */}
                  <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4 shadow-sm">
                    <h3 className="text-xs font-bold text-blue-900 uppercase tracking-wide">Register Support Worker</h3>
                    <form onSubmit={handleRegisterWorker} className="space-y-3">
                      <div>
                        <label className="block text-[9px] font-bold text-gray-500 uppercase tracking-wide mb-1">Full Legal Name</label>
                        <input type="text" required value={workerName} onChange={(e) => setWorkerName(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-900 focus:outline-none" />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[9px] font-bold text-gray-500 uppercase tracking-wide mb-1">Contact Email Address</label>
                          <input type="email" required value={workerEmail} onChange={(e) => setWorkerEmail(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-900 focus:outline-none" />
                        </div>
                        <div>
                          <label className="block text-[9px] font-bold text-gray-500 uppercase tracking-wide mb-1">Contact Phone Number</label>
                          <input type="text" required value={workerPhone} onChange={(e) => setWorkerPhone(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-900 focus:outline-none" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold text-gray-500 uppercase tracking-wide mb-1">Administrative / Onboarding Compliance Notes</label>
                        <textarea value={workerNotes} onChange={(e) => setWorkerNotes(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-900 h-16 resize-none focus:outline-none" />
                      </div>
                      <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase py-2.5 rounded shadow transition-all">
                        Create Support Worker Account
                      </button>
                    </form>
                    {generatedPassword && (
                      <p className="text-[11px] font-mono text-gray-600 bg-gray-50 p-2 rounded border border-gray-200 select-all">Secure Temporary Key: {generatedPassword}</p>
                    )}
                  </div>

                  {/* Participant Creation Form */}
                  <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4 shadow-sm">
                    <h3 className="text-xs font-bold text-blue-900 uppercase tracking-wide">Register Participant Account</h3>
                    <form onSubmit={handleRegisterParticipant} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="sm:col-span-2">
                        <label className="block text-[9px] font-bold text-gray-500 uppercase tracking-wide mb-1">Participant Identity Name</label>
                        <input type="text" required value={partName} onChange={(e) => setPartName(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-900 focus:outline-none" />
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold text-gray-500 uppercase tracking-wide mb-1">NDIS Reference Number</label>
                        <input type="text" required value={partNdis} onChange={(e) => setPartNdis(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-900 focus:outline-none" />
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold text-gray-500 uppercase tracking-wide mb-1">Primary Phone Number</label>
                        <input type="text" required value={partPhone} onChange={(e) => setPartPhone(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-900 focus:outline-none" />
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold text-gray-500 uppercase tracking-wide mb-1">Emergency Representative Name</label>
                        <input type="text" required value={partEmergName} onChange={(e) => setPartEmergName(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-900 focus:outline-none" />
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold text-gray-500 uppercase tracking-wide mb-1">Emergency representative Phone</label>
                        <input type="text" required value={partEmergPhone} onChange={(e) => setPartEmergPhone(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-900 focus:outline-none" />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-[9px] font-bold text-gray-500 uppercase tracking-wide mb-1">Strategic Support Notes</label>
                        <textarea value={partNotes} onChange={(e) => setPartNotes(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-900 h-16 resize-none focus:outline-none" />
                      </div>
                      <button type="submit" className="sm:col-span-2 bg-gray-800 hover:bg-gray-900 text-white font-bold text-xs uppercase py-2.5 rounded shadow transition-all">
                        Register Card Entry
                      </button>
                    </form>
                  </div>

                  {/* Active Employee Timesheets Monitor Board Deck */}
                  <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm xl:col-span-2 space-y-3">
                    <h3 className="text-xs font-bold text-blue-900 uppercase tracking-wide">Submitted Workforce Timesheets Queue</h3>
                    <div className="border border-gray-200 rounded-lg bg-gray-50 divide-y divide-gray-200 max-h-64 overflow-y-auto">
                      {timesheetHistory.map(ts => (
                        <div key={ts.id} className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs text-gray-700 bg-white">
                          <div className="space-y-0.5">
                            <span className="font-bold text-gray-900 block uppercase tracking-wide">Filer: {ts.workerName} ({ts.workerEmail})</span>
                            <span className="block font-medium text-blue-600">{ts.fortnightLabel} | Volume: {ts.rowsCount} Rows Filed</span>
                          </div>
                          <div className="text-left sm:text-right font-mono text-[11px] text-gray-400">
                            <span className="block font-bold text-gray-800">Hours Registered: ~{ts.totalHours}h</span>
                            <span className="block text-[10px]">Received: {ts.submittedDate}</span>
                          </div>
                        </div>
                      ))}
                      {timesheetHistory.length === 0 && (
                        <p className="text-center py-8 text-xs text-gray-400 font-medium tracking-wide">No incoming fortnightly timesheet submission packets pending audit review.</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: CALENDAR WORKSPACE AND THE MULTI-USE SCHEDULING ENGINE VIEWPORT (Item 3 & 5) */}
            {currentTab === 'rosters' && (
              <div className="space-y-6">
                <div className="border-b border-gray-200 pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h2 className="text-base font-bold uppercase tracking-wider text-blue-900">Calendar</h2>
                    <p className="text-xs text-gray-500">Deploy events, route unassigned shifts highlighted in solid red blocks, and execute layout parameters.</p>
                  </div>
                  <div className="bg-white border border-gray-200 p-1 rounded-lg flex space-x-1 shadow-sm">
                    {['day', 'week', 'month'].map(v => (
                      <button key={v} onClick={() => setCalendarView(v)} className={`px-3 py-1 rounded text-[9px] font-black uppercase tracking-wider transition-all ${calendarView === v ? 'bg-blue-600 text-white shadow' : 'text-gray-500 hover:text-gray-800'}`}>{v}</button>
                    ))}
                  </div>
                </div>

                {/* Simplified Tracking Category Filters Matrix Container layout */}
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

                {/* THE MULTI-USE SCHEDULING WIZARD MODULE COMPONENT (Item 3 Requested custom upgrade!) */}
                {user.role === 'director' && (
                  <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm space-y-4">
                    <div className="flex items-center space-x-3 border-b border-gray-100 pb-2">
                      <h4 className="text-xs font-bold text-blue-900 uppercase tracking-wider">Quick Allocate Multi-Use Entry Module</h4>
                      <div className="flex items-center space-x-1 bg-gray-100 p-0.5 rounded-lg border border-gray-200">
                        <button type="button" onClick={() => setEventCategory('shift')} className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase transition-all ${eventCategory === 'shift' ? 'bg-blue-600 text-white shadow' : 'text-gray-500'}`}>Shift Mode</button>
                        <button type="button" onClick={() => setEventCategory('event')} className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase transition-all ${eventCategory === 'event' ? 'bg-blue-600 text-white shadow' : 'text-gray-500'}`}>Corporate Event Mode</button>
                      </div>
                    </div>

                    <form onSubmit={handleCreateShift} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                      <div className="sm:col-span-2 md:col-span-1">
                        <label className="block text-[8px] font-bold uppercase text-gray-400 mb-1">Description Label</label>
                        <input type="text" required placeholder="e.g. Skill Outing / Meeting" value={shiftTitle} onChange={(e) => setShiftTitle(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-xs focus:border-blue-500 text-gray-800 outline-none" />
                      </div>
                      <div>
                        <label className="block text-[8px] font-bold uppercase text-gray-400 mb-1">Support Worker Field</label>
                        <select value={shiftWorkerId} onChange={(e) => setShiftWorkerId(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-xs text-gray-600 focus:border-blue-500 outline-none">
                          <option value="">Leave Unassigned (Red Alert)</option>
                          {workerList.map(w => <option key={w.id} value={w.id}>{w.full_name}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[8px] font-bold uppercase text-gray-400 mb-1">Participant Field</label>
                        <select value={shiftParticipantId} onChange={(e) => setShiftParticipantId(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-xs text-gray-600 focus:border-blue-500 outline-none">
                          <option value="">Corporate Administrative Line</option>
                          {participants.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[8px] font-bold uppercase text-gray-400 mb-1">Target Date</label>
                        <input type="date" required value={shiftDate} onChange={(e) => setShiftDate(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-xs focus:border-blue-500 outline-none" />
                      </div>
                      <div>
                        <label className="block text-[8px] font-bold uppercase text-gray-400 mb-1">Start Time</label>
                        <input type="time" required value={shiftStart} onChange={(e) => setShiftStart(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-xs focus:border-blue-500 outline-none" />
                      </div>
                      <div>
                        <label className="block text-[8px] font-bold uppercase text-gray-400 mb-1">End Time</label>
                        <input type="time" required value={shiftEnd} onChange={(e) => setShiftEnd(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-xs focus:border-blue-500 outline-none" />
                      </div>
                      <div className="sm:col-span-2 md:col-span-3 lg:col-span-5">
                        <label className="block text-[8px] font-bold uppercase text-gray-400 mb-1">Special Reminders / Compliance Directives Summary Notes</label>
                        <input type="text" placeholder="Add specific medication requirements, guidelines, or travel alerts..." value={shiftDirectives} onChange={(e) => setShiftDirectives(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-xs focus:border-blue-500 text-gray-800 outline-none" />
                      </div>
                      <div className="flex items-end">
                        <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase rounded-lg py-2.5 shadow transition-all transform active:scale-95 tracking-wider">Publish Entry</button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Render Grid Stream Canvas Block */}
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm divide-y divide-gray-200 overflow-hidden">
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
                        <div key={s.id} className={`p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4 transition-all bg-white ${isUnclaimed ? 'border-l-4 border-l-red-500 bg-red-50/20' : 'border-l-4 border-l-blue-600'}`}>
                          <div className="space-y-1 text-xs">
                            <div className="flex items-center space-x-2">
                              <h4 className="font-bold text-gray-900 uppercase tracking-wide">{s.title}</h4>
                              {isUnclaimed && <span className="text-[9px] font-bold tracking-widest bg-red-100 text-red-700 px-2 py-0.5 rounded uppercase">Unclaimed</span>}
                            </div>
                            <p className="text-gray-500 font-mono font-medium">
                              Date: {new Date(s.start_time).toLocaleDateString('en-AU')} | Time: {new Date(s.start_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - {new Date(s.end_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </p>
                            <p className="text-gray-400 font-semibold uppercase text-[10px]">
                              Personnel: <span className="text-gray-600 font-bold">{workerObj ? workerObj.full_name : 'Unassigned'}</span> | Client: <span className="text-gray-600 font-bold">{clientObj ? clientObj.name : 'Internal Administrative task'}</span>
                            </p>
                            {s.manager_directives && <p className="text-gray-500 italic bg-gray-50 p-2 rounded border border-gray-200 max-w-xl">Directive: "{s.manager_directives}"</p>}
                          </div>

                          {isUnclaimed && user.role === 'support_worker' && (
                            <button onClick={() => handleClaimUnclaimedShift(s.id)} className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase px-4 py-2 rounded shadow transition-all transform active:scale-95">Claim Shift</button>
                          )}
                        </div>
                      );
                    })}
                </div>
              </div>
            )}

            {/* PAGE 4: PARTICIPANT PROFILES (Item 4 requested expander modifications) */}
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
                      <div key={p.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                        <div onClick={() => setExpandedClient(isOpen ? null : p.id)} className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-all select-none">
                          <span className="font-bold text-xs uppercase tracking-wide text-gray-800">{p.name}</span>
                          <span className="text-xs font-bold text-blue-600">{isOpen ? 'COLLAPSE ▲' : 'EXPAND DETAILS ▼'}</span>
                        </div>

                        {isOpen && (
                          <div className="p-5 bg-gray-50/50 border-t border-gray-200 space-y-4 text-xs">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                              <div className="bg-white p-3 rounded border border-gray-200">
                                <span className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Telephone Primary</span>
                                <p className="font-mono font-bold text-gray-700">{p.primary_contact_phone || 'Unlisted'}</p>
                              </div>
                              <div className="bg-white p-3 rounded border border-gray-200">
                                <span className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">NDIS Key Code</span>
                                <p className="font-mono font-bold text-gray-700">{p.ndis_number || 'Unlisted'}</p>
                              </div>
                              <div className="bg-white p-3 rounded border border-gray-200">
                                <span className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Emergency Representative Line</span>
                                <p className="font-bold text-gray-700 uppercase">{p.emergency_contact_name || 'Not logged'}</p>
                                <p className="font-mono font-bold text-blue-600">{p.emergency_contact_phone || ''}</p>
                              </div>
                            </div>
                            <div className="bg-white p-4 rounded border border-gray-200 space-y-1">
                              <span className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider">Operational Care Directives notes</span>
                              <p className="text-gray-600 leading-relaxed font-medium">{p.about_me_notes || 'No active support records populated inside metadata container rows.'}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 5: AVAILABILITIES STACKED WEEKEND UPGRADE MODULE (Item 6 requested modifications) */}
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

                  <div className="border border-gray-200 rounded-xl overflow-hidden bg-white divide-y divide-gray-200">
                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => {
                      const state = availDaysState[day];
                      return (
                        <div key={day} className="p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white hover:bg-gray-50 transition-all">
                          <span className="text-xs font-bold uppercase tracking-wide text-gray-700 w-24">{day}</span>
                          <div className="flex flex-wrap gap-2 items-center">
                            <button type="button" onClick={() => updateAvailabilityMode(day, 'standard')} className={`px-3 py-1 rounded text-[10px] font-bold uppercase border transition-all ${state.mode === 'standard' ? 'bg-blue-600 text-white border-blue-600 shadow-sm' : 'bg-white border-gray-300 text-gray-500'}`}>Specific Hours</button>
                            <button type="button" onClick={() => updateAvailabilityMode(day, 'allday')} className={`px-3 py-1 rounded text-[10px] font-bold uppercase border transition-all ${state.mode === 'allday' ? 'bg-blue-600 text-white border-blue-600 shadow-sm' : 'bg-white border-gray-300 text-gray-500'}`}>Available All Day</button>
                            <button type="button" onClick={() => updateAvailabilityMode(day, 'unavailable')} className={`px-3 py-1 rounded text-[10px] font-bold uppercase border transition-all ${state.mode === 'unavailable' ? 'bg-red-50 text-red-600 border-red-200 shadow-sm' : 'bg-white border-gray-300 text-gray-500'}`}>Not Available</button>
                          </div>

                          {state.mode === 'standard' && (
                            <div className="flex items-center space-x-2">
                              <input type="time" value={state.start} onChange={(e) => updateAvailabilityTimes(day, 'start', e.target.value)} className="bg-gray-50 border border-gray-300 rounded p-1 text-xs outline-none focus:border-blue-500" />
                              <span className="text-[10px] text-gray-400 font-bold">TO</span>
                              <input type="time" value={state.end} onChange={(e) => updateAvailabilityTimes(day, 'end', e.target.value)} className="bg-gray-50 border border-gray-300 rounded p-1 text-xs outline-none focus:border-blue-500" />
                            </div>
                          )}
                          {state.mode === 'allday' && <span className="text-[9px] font-bold tracking-wide text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 uppercase">Available Full 24h</span>}
                          {state.mode === 'unavailable' && <span className="text-[9px] font-bold tracking-wide text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-200 uppercase">Unavailable Block</span>}
                        </div>
                      );
                    })}
                  </div>
                  <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase py-3 rounded shadow transition-all transform active:scale-95">
                    Submit Entire Fortnight Availabilities Block
                  </button>
                </form>
              </div>
            )}

            {/* TAB 6: FORTNIGHTLY COMPREHENSIVE TIMESHEET REMITTANCE MODULE (Item 7 requested modifications) */}
            {currentTab === 'timesheets' && (
              <div className="space-y-6">
                <div className="border-b border-gray-200 pb-4">
                  <h2 className="text-base font-bold uppercase tracking-wider text-blue-900">Timesheet Submissions</h2>
                  <p className="text-xs text-gray-500">File multi-day stacked shift entries at the close of your pay cycle range.</p>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                  
                  {/* Master Stacked Form Module View component */}
                  <div className="bg-white border border-gray-200 rounded-xl p-6 xl:col-span-2 space-y-4 shadow-sm h-fit">
                    <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium leading-relaxed text-gray-600">
                      Instructions: Select your reporting pay range dropdown key code. Fill out details for each day worked. Click **"Add Shift Row to Fortnight Stack"** to dynamically chain entries all at once before pushing the irreversible production submission ledger at the base.
                    </div>

                    <form onSubmit={handleStackedTimesheetSubmit} className="space-y-4">
                      <div className="max-w-xs">
                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Active Payroll Period Range</label>
                        <select value={selectedFortnight} onChange={(e) => setSelectedFortnight(e.target.value)} className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2.5 text-xs text-blue-600 font-bold focus:outline-none">
                          {fortnights.map(f => <option key={f.id} value={f.id}>{f.label}</option>)}
                        </select>
                      </div>

                      {/* Stack rows input loop matrix canvas grid items */}
                      <div className="space-y-3">
                        {timesheetRows.map((row, idx) => (
                          <div key={idx} className="p-4 bg-gray-50 border border-gray-200 rounded-lg grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                            <div>
                              <label className="block text-[8px] font-bold text-gray-400 uppercase mb-1">Date Worked</label>
                              <input type="date" required value={row.date} onChange={(e) => updateTimesheetRowValue(idx, 'date', e.target.value)} className="w-full bg-white border border-gray-300 rounded p-1.5 text-xs outline-none" />
                            </div>
                            <div className="grid grid-cols-2 gap-1">
                              <div>
                                <label className="block text-[8px] font-bold text-gray-400 uppercase mb-1">Start Time</label>
                                <input type="time" required value={row.start} onChange={(e) => updateTimesheetRowValue(idx, 'start', e.target.value)} className="w-full bg-white border border-gray-300 rounded p-1.5 text-xs outline-none" />
                              </div>
                              <div>
                                <label className="block text-[8px] font-bold text-gray-400 uppercase mb-1">End Time</label>
                                <input type="time" required value={row.end} onChange={(e) => updateTimesheetRowValue(idx, 'end', e.target.value)} className="w-full bg-white border border-gray-300 rounded p-1.5 text-xs outline-none" />
                              </div>
                            </div>
                            <div>
                              <label className="block text-[8px] font-bold text-gray-400 uppercase mb-1">Participant Entity</label>
                              <select required value={row.client} onChange={(e) => updateTimesheetRowValue(idx, 'client', e.target.value)} className="w-full bg-white border border-gray-300 rounded p-1.5 text-xs text-gray-600 outline-none">
                                <option value="">-- Pick Client --</option>
                                {participants.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                              </select>
                            </div>
                            <div className="grid grid-cols-2 gap-1">
                              <div>
                                <label className="block text-[8px] font-bold text-gray-400 uppercase mb-1">KM (With Client)</label>
                                <input type="number" value={row.kmWith} onChange={(e) => updateTimesheetRowValue(idx, 'kmWith', e.target.value)} className="w-full bg-white border border-gray-300 rounded p-1.5 text-xs outline-none" />
                              </div>
                              <div>
                                <label className="block text-[8px] font-bold text-gray-400 uppercase mb-1">KM (Personal Car)</label>
                                <input type="number" value={row.kmWithout} onChange={(e) => updateTimesheetRowValue(idx, 'kmWithout', e.target.value)} className="w-full bg-white border border-gray-300 rounded p-1.5 text-xs outline-none" />
                              </div>
                            </div>
                            <div className="sm:col-span-2 lg:col-span-4">
                              <label className="block text-[8px] font-bold text-gray-400 uppercase mb-1">Shift Progression Summary Narrative notes</label>
                              <input type="text" required placeholder="Log specific objectives reached, outings completed, medication notes..." value={row.notes} onChange={(e) => updateTimesheetRowValue(idx, 'notes', e.target.value)} className="w-full bg-white border border-gray-300 rounded p-1.5 text-xs outline-none focus:border-blue-500" />
                            </div>
                          </div>
                        ))}
                      </div>

                      <button type="button" onClick={addTimesheetRow} className="bg-white hover:bg-gray-100 text-gray-700 font-bold border border-gray-300 text-[10px] uppercase px-4 py-2 rounded transition-colors">
                        Add Shift Row to Fortnight Stack
                      </button>

                      <div className="flex items-start space-x-3 bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <input type="checkbox" required id="notesCheck" checked={tsNotesChecked} onChange={(e) => setTsNotesChecked(e.target.checked)} className="w-4 h-4 mt-0.5 border-gray-300 rounded accent-blue-600" />
                        <label htmlFor="notesCheck" className="text-[11px] text-gray-500 font-medium select-none">I explicitly verify and assert that my corresponding client shift progression logs and case notes have been completely filled and filed.</label>
                      </div>

                      <div className="p-3 bg-red-50 border border-red-100 text-[9px] font-bold uppercase tracking-wide text-red-600 rounded-lg">
                        Notice: Once a fortnightly timesheet submission bundle is committed, entries lock securely and values cannot be changed or edited.
                      </div>

                      <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase py-3 rounded shadow transition-all transform active:scale-95">
                        Transmit Fortnightly Timesheet Remittance Package
                      </button>
                    </form>
                  </div>

                  {/* Filer Personal History Monitor Sidebar Box widget */}
                  <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm h-fit space-y-4">
                    <h3 className="text-xs font-bold text-blue-900 uppercase tracking-wide">Your Personal Remittance History</h3>
                    <div className="space-y-2">
                      {timesheetHistory.filter(h => h.workerEmail === user.email).map(ts => (
                        <div key={ts.id} className="bg-gray-50 border border-gray-200 rounded p-3 text-xs space-y-1">
                          <span className="block font-mono text-[10px] font-bold text-blue-600">LEDGER BUNDLE: #{ts.id}</span>
                          <p className="font-bold text-gray-800 uppercase tracking-wide">{ts.fortnightLabel}</p>
                          <div className="flex justify-between items-center text-[11px] text-gray-400 font-semibold">
                            <span>Filed: {ts.rowsCount} Days</span>
                            <span>Sum: ~{ts.totalHours}h Logged</span>
                          </div>
                        </div>
                      ))}
                      {timesheetHistory.filter(h => h.workerEmail === user.email).length === 0 && (
                        <p className="text-[11px] text-gray-400 italic text-center py-6">No fortnightly bundles submitted during this workspace active session.</p>
                      )}
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
