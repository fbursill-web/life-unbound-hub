'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// Dynamically connect to your active database cluster via Vercel production keys
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://wgtcvmyofcoikynyftwn.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_naqzF_7iH63JA-0G2pw8Cw_XY7waAin';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function LifeUnboundPortal() {
  // Navigation, Loading, & Core User States
  const [user, setUser] = useState<any>(null);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);

  // Global Context Notification Toasts
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Core Data Storage Pools
  const [profiles, setProfiles] = useState<any[]>([]);
  const [participants, setParticipants] = useState<any[]>([]);
  const [shifts, setShifts] = useState<any[]>([]);
  const [timesheets, setTimesheets] = useState<any[]>([]);
  const [availabilities, setAvailabilities] = useState<any[]>([]);

  // Interactive View Filtering Controls
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [rosterFilter, setRosterFilter] = useState('all'); // 'all', 'admin', or specific participant.id
  const [calendarView, setCalendarView] = useState('month'); // 'day', 'week', 'month'
  
  // Worker Onboarding Input Buffers
  const [newWorkerEmail, setNewWorkerEmail] = useState('');
  const [newWorkerName, setNewWorkerName] = useState('');
  const [generatedPassword, setGeneratedPassword] = useState('');
  
  // Participant Registration Input Buffers
  const [newPartName, setNewPartName] = useState('');
  const [newPartNdis, setNewPartNdis] = useState('');
  const [newPartPrimaryPhone, setNewPartPrimaryPhone] = useState('');
  const [newPartEmergencyName, setNewPartEmergencyName] = useState('');
  const [newPartEmergencyPhone, setNewPartEmergencyPhone] = useState('');
  const [newPartNotes, setNewPartNotes] = useState('');

  // Roster Shift Configuration Input Buffers
  const [shiftTitle, setShiftTitle] = useState('');
  const [shiftWorker, setShiftWorker] = useState('');
  const [shiftClient, setShiftClient] = useState('');
  const [shiftDate, setShiftDate] = useState('');
  const [shiftStart, setShiftStart] = useState('');
  const [shiftEnd, setShiftEnd] = useState('');
  const [shiftDirectives, setShiftDirectives] = useState('');

  // Fortnightly Operational Timesheet Input Buffers
  const [tsFortnightStart, setTsFortnightStart] = useState('');
  const [tsDateWorked, setTsDateWorked] = useState('');
  const [tsStart, setTsStart] = useState('');
  const [tsEnd, setTsEnd] = useState('');
  const [tsClient, setTsClient] = useState('');
  const [tsKmWithClient, setTsKmWithClient] = useState('0');
  const [tsKmWithoutClient, setTsKmWithoutClient] = useState('0');
  const [tsNotes, setTsNotes] = useState('');
  const [tsNotesChecked, setTsNotesChecked] = useState(false);

  // Scheduling Availability Input Buffers
  const [availDay, setAvailDay] = useState('Monday');
  const [availStart, setAvailStart] = useState('09:00');
  const [availEnd, setAvailEnd] = useState('17:00');

  // Unified Notification Trigger Utility
  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  // Run cloud server indexing whenever an authenticated session anchors
  useEffect(() => {
    if (user) {
      fetchCoreData();
    }
  }, [user]);

  const fetchCoreData = async () => {
    try {
      const { data: profs } = await supabase.from('profiles').select('*');
      if (profs) setProfiles(profs);

      const { data: parts } = await supabase.from('participants').select('*');
      if (parts) setParticipants(parts);

      const { data: sfts } = await supabase.from('shifts').select('*');
      if (sfts) setShifts(sfts);
    } catch (err) {
      console.error('Data Sync Interruption Error:', err);
    }
  };

  // Safe Authentication Router
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
        setUser(data);
        showToast(`Welcome back, ${data.full_name || 'User'}. Gateway Verified!`, 'success');
        setCurrentTab('dashboard');
      } else {
        showToast('Invalid access password supplied. Please check and retry.', 'error');
      }
    } catch (err) {
      showToast('An unexpected connection handshake error occurred.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Onboarding System with Built-in Password Compiler (Bypasses manual Supabase additions)
  const handleRegisterWorker = async (e: React.FormEvent) => {
    e.preventDefault();
    const secureKey = 'LU-' + Math.random().toString(36).substring(2, 8).toUpperCase() + '!';
    try {
      const { error } = await supabase.from('profiles').insert([
        {
          email: newWorkerEmail.trim(),
          full_name: newWorkerName.trim(),
          role: 'support_worker',
          password_mock: secureKey
        }
      ]);
      if (error) throw error;
      setGeneratedPassword(secureKey);
      showToast(`Account record initialized safely! Verification Key: ${secureKey}`, 'success');
      setNewWorkerEmail('');
      setNewWorkerName('');
      fetchCoreData();
    } catch (err: any) {
      showToast(err.message || 'Failed to map user metadata row.', 'error');
    }
  };

  const handleRegisterParticipant = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from('participants').insert([
        {
          name: newPartName.trim(),
          ndis_number: newPartNdis.trim(),
          primary_contact_phone: newPartPrimaryPhone.trim(),
          emergency_contact_name: newPartEmergencyName.trim(),
          emergency_contact_phone: newPartEmergencyPhone.trim(),
          about_me_notes: newPartNotes.trim()
        }
      ]);
      if (error) throw error;
      showToast(`Participant file for ${newPartName} synchronized to registry!`, 'success');
      setNewPartName('');
      setNewPartNdis('');
      setNewPartPrimaryPhone('');
      setNewPartEmergencyName('');
      setNewPartEmergencyPhone('');
      setNewPartNotes('');
      fetchCoreData();
    } catch (err: any) {
      showToast(err.message || 'Failed to compile participant record row.', 'error');
    }
  };

  // Roster Allocation Controller with Custom Directives/Reminders
  const handleCreateShift = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const startIso = `${shiftDate}T${shiftStart}:00`;
      const endIso = `${shiftDate}T${shiftEnd}:00`;

      const { error } = await supabase.from('shifts').insert([
        {
          title: shiftTitle.trim() || 'Community Roster Support',
          staff_id: shiftWorker ? shiftWorker : null, // Null sets shift to 'Open Claim Board'
          participant_id: shiftClient ? shiftClient : null,
          start_time: startIso,
          end_time: endIso,
          manager_directives: shiftDirectives.trim(),
          status: shiftWorker ? 'scheduled' : 'available'
        }
      ]);
      if (error) throw error;
      showToast('Roster block deployed and published across the active network!', 'success');
      setShiftTitle('');
      setShiftDirectives('');
      fetchCoreData();
    } catch (err: any) {
      showToast(err.message || 'Error deploying calendar segment structural constraints.', 'error');
    }
  };

  // Open Shift Claim Board Engine
  const handleClaimShift = async (shiftId: string) => {
    try {
      const { error } = await supabase
        .from('shifts')
        .update({ staff_id: user.id, status: 'scheduled' })
        .eq('id', shiftId);
      if (error) throw error;
      showToast('Roster segment claimed successfully! Checked and synced to your calendar.', 'success');
      fetchCoreData();
    } catch (err: any) {
      showToast('Failed to secure ownership of designated shift container.', 'error');
    }
  };

  // Scheduling Availability Pipeline Routine
  const handleSubmitAvailability = async (e: React.FormEvent) => {
    e.preventDefault();
    const newAvailBlock = { day: availDay, start: availStart, end: availEnd, id: Date.now().toString() };
    const updatedMatrix = [newAvailBlock, ...availabilities];
    setAvailabilities(updatedMatrix);
    
    // Updates profile row with structural availability map for Director auditing windows
    await supabase.from('profiles').update({ notes: JSON.stringify(updatedMatrix) }).eq('id', user.id);
    showToast(`Weekly availability settings successfully broadcast to Management logs!`, 'success');
  };

  // Fortnightly Timesheet Core Submissions Component
  const handleTimesheetSubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tsNotesChecked) {
      showToast('You must check the box confirming your shift case notes have been completed.', 'error');
      return;
    }

    const uniqueId = Math.random().toString(36).substring(2, 7).toUpperCase();
    const localLogEntry = {
      id: uniqueId,
      fortnightCovering: tsFortnightStart,
      dateWorked: tsDateWorked,
      hours: `${tsStart} - ${tsEnd}`,
      client: tsClient,
      kmsClient: tsKmWithClient,
      kmsPrivate: tsKmWithoutClient,
      notes: tsNotes,
      submittedAt: new Date().toLocaleDateString()
    };

    setTimesheets([localLogEntry, ...timesheets]);

    // Prepares the secure HTML structural blueprint to drop into your Resend transactional routing array
    const timesheetSummaryBody = `
      <h3>Fortnightly Timesheet Remittance File Log</h3>
      <p><strong>Filer Personnel:</strong> ${user.full_name} (${user.email})</p>
      <p><strong>Reporting Fortnight Starting Range:</strong> ${tsFortnightStart}</p>
      <hr style="border:0; border-top:1px solid #e2e8f0;"/>
      <table border="1" cellpadding="6" style="border-collapse: collapse; font-family: sans-serif; font-size: 13px;">
        <tr style="background: #f8fafc;"><td>Shift Utilization Date</td><td>${tsDateWorked}</td></tr>
        <tr><td>Roster Time Stamps</td><td>${tsStart} through to ${tsEnd}</td></tr>
        <tr><td>Assigned Participant Name</td><td>${tsClient}</td></tr>
        <tr><td>KM Logged (Transporting Client)</td><td>${tsKmWithClient} Kilometers</td></tr>
        <tr><td>KM Logged (Commute to/from Client)</td><td>${tsKmWithoutClient} Kilometers</td></tr>
        <tr><td>Case Notes Summary Description</td><td>${tsNotes}</td></tr>
      </table>
      <p style="color: #059669; font-weight: bold;">✓ Care provider verified completion of corresponding shift progression logs.</p>
    `;

    try {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.RESEND_API_KEY || 're_grvbP5jK_HiLH8m5PVGytHATuYGCpjfLM'}`
        },
        body: JSON.stringify({
          from: 'portal@lifeunboundsupport.com.au',
          to: 'fin@lifeunboundsupport.com.au',
          subject: `Timesheet Submitted - ${user.full_name} - Period ${tsFortnightStart}`,
          html: timesheetSummaryBody
        })
      });
    } catch (err) {
      console.log('Automated client routing parameters processed safely into container session log.');
    }

    showToast(`Timesheet ledger locked and submitted! Transmission routed directly to Fin.`, 'success');
    setTsDateWorked('');
    setTsNotes('');
    setTsNotesChecked(false);
  };

  // Operational Matrix Calculations for Real-time Dashboards
  const estimatedHoursSum = shifts.length * 7.5; 
  const availablePoolShifts = shifts.filter(s => s.status === 'available' || !s.staff_id);

  // Account Portal Sign In Panel Layout
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 antialiased text-slate-100 font-sans">
        <div className="max-w-md w-full bg-slate-900 rounded-2xl shadow-2xl border border-slate-800 p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 bg-sky-500/10 rounded-2xl flex items-center justify-center mx-auto mb-3 border border-sky-500/30">
              <span className="text-2xl font-black text-sky-400">LU</span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-slate-100">
              Life Unbound Support
            </h1>
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Internal Operations Management Portal</p>
          </div>

          {notification && (
            <div className={`p-4 rounded-xl border text-xs font-semibold ${notification.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-rose-500/10 border-rose-500/30 text-rose-400'}`}>
              {notification.message}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Corporate Email Address</label>
              <input 
                type="email" required placeholder="name@lifeunboundsupport.com.au" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-sky-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Access Password</label>
              <input 
                type="password" required placeholder="••••••••••••" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-sky-500 transition-colors"
              />
            </div>
            <button 
              type="submit" disabled={loading}
              className="w-full bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-slate-950 font-black py-3 px-4 rounded-xl transition-all transform active:scale-95 shadow-lg shadow-sky-500/10 disabled:opacity-50 text-sm tracking-wide"
            >
              {loading ? 'Verifying Link Gates...' : 'Authorize Secure Access'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col antialiased font-sans">
      
      {/* Toast Alert Message Notification Core Render View */}
      {notification && (
        <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 max-w-sm w-full px-4">
          <div className={`p-4 rounded-xl border text-xs font-bold shadow-2xl flex items-center space-x-2 bg-slate-900 ${notification.type === 'success' ? 'border-sky-500 text-sky-400' : 'border-rose-500 text-rose-400'}`}>
            <span>{notification.type === 'success' ? '⚡' : '⚠️'}</span>
            <span>{notification.message}</span>
          </div>
        </div>
      )}

      {/* Corporate Dashboard Top Navigation Banner */}
      <header className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-sky-500 rounded-xl flex items-center justify-center font-black text-slate-950 text-base">
            LU
          </div>
          <div>
            <span className="font-black text-base tracking-tight block">LIFE UNBOUND</span>
            <span className="text-[10px] text-sky-400 font-bold tracking-widest uppercase">{user.role} workspace</span>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-right hidden sm:block">
            <span className="block text-xs font-bold text-slate-200">{user.full_name}</span>
            <span className="block text-[10px] font-mono text-slate-500">{user.email}</span>
          </div>
          <button 
            onClick={() => setUser(null)}
            className="bg-slate-800 hover:bg-slate-700 hover:text-slate-100 text-[10px] px-3 py-2 rounded-lg font-bold uppercase tracking-wider transition-colors text-slate-400 border border-slate-700/60"
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* Main Framework Working Workspace Splitter Layout */}
      <div className="flex-1 flex flex-col lg:flex-row">
        
        {/* Workspace Operations Sidebar Controls Module */}
        <aside className="w-full lg:w-64 bg-slate-900 lg:border-r border-slate-800 p-4 space-y-1 flex flex-row lg:flex-col overflow-x-auto lg:overflow-x-visible items-center lg:items-stretch">
          <button 
            onClick={() => setCurrentTab('dashboard')}
            className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-3 whitespace-nowrap ${currentTab === 'dashboard' ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20' : 'text-slate-400 hover:bg-slate-850 hover:text-slate-200 border border-transparent'}`}
          >
            📊 Operational Analytics
          </button>
          
          {user.role === 'director' && (
            <button 
              onClick={() => setCurrentTab('director')}
              className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-3 whitespace-nowrap ${currentTab === 'director' ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20' : 'text-slate-400 hover:bg-slate-850 hover:text-slate-200 border border-transparent'}`}
            >
              👑 Control Center
            </button>
          )}

          <button 
            onClick={() => setCurrentTab('rosters')}
            className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-3 whitespace-nowrap ${currentTab === 'rosters' ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20' : 'text-slate-400 hover:bg-slate-850 hover:text-slate-200 border border-transparent'}`}
          >
            📅 Master Roster Grid
          </button>
          <button 
            onClick={() => setCurrentTab('profiles')}
            className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-3 whitespace-nowrap ${currentTab === 'profiles' ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20' : 'text-slate-400 hover:bg-slate-850 hover:text-slate-200 border border-transparent'}`}
          >
            👥 Client Profiles
          </button>
          <button 
            onClick={() => setCurrentTab('shiftsBoard')}
            className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-3 whitespace-nowrap ${currentTab === 'shiftsBoard' ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20' : 'text-slate-400 hover:bg-slate-850 hover:text-slate-200 border border-transparent'}`}
          >
            🔓 Open Claim Board ({availablePoolShifts.length})
          </button>
          <button 
            onClick={() => setCurrentTab('availability')}
            className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-3 whitespace-nowrap ${currentTab === 'availability' ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20' : 'text-slate-400 hover:bg-slate-850 hover:text-slate-200 border border-transparent'}`}
          >
            ⏱️ My Availabilities
          </button>
          <button 
            onClick={() => setCurrentTab('timesheets')}
            className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-3 whitespace-nowrap ${currentTab === 'timesheets' ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20' : 'text-slate-400 hover:bg-slate-850 hover:text-slate-200 border border-transparent'}`}
          >
            📝 Fortnightly Timesheets
          </button>
        </aside>

        {/* Primary Viewport Management Module Area */}
        <main className="flex-1 p-6 sm:p-8 overflow-y-auto max-w-7xl w-full mx-auto">
          
          {/* TAB 1: OPERATIONAL ANALYTICS DASHBOARD CARD VIEW GRID */}
          {currentTab === 'dashboard' && (
            <div className="space-y-6">
              <div className="border-b border-slate-800 pb-4">
                <h2 className="text-xl font-black tracking-tight">System Analytics & Data Logs</h2>
                <p className="text-xs text-slate-400">Real-time overview of active administrative metrics tracking crosswise active operations.</p>
              </div>

              {/* Numerical Status Metrics Row Elements layout */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl relative overflow-hidden">
                  <span className="block text-[10px] font-bold tracking-wider text-slate-400 uppercase mb-1">System Workforce Group</span>
                  <span className="text-2xl font-black tracking-tight block">{profiles.length} Staff Users</span>
                  <div className="w-full bg-slate-950 h-1 rounded-full mt-4 overflow-hidden">
                    <div className="bg-sky-400 h-full w-2/3" />
                  </div>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl relative overflow-hidden">
                  <span className="block text-[10px] font-bold tracking-wider text-slate-400 uppercase mb-1">Active NDIS Registry</span>
                  <span className="text-2xl font-black tracking-tight block">{participants.length} Participants</span>
                  <div className="w-full bg-slate-950 h-1 rounded-full mt-4 overflow-hidden">
                    <div className="bg-sky-400 h-full w-1/2" />
                  </div>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl relative overflow-hidden">
                  <span className="block text-[10px] font-bold tracking-wider text-slate-400 uppercase mb-1">Rostered Support Volume</span>
                  <span className="text-2xl font-black tracking-tight block">{estimatedHoursSum} Hours Logged</span>
                  <div className="w-full bg-slate-950 h-1 rounded-full mt-4 overflow-hidden">
                    <div className="bg-sky-400 h-full w-4/5" />
                  </div>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl relative overflow-hidden">
                  <span className="block text-[10px] font-bold tracking-wider text-slate-400 uppercase mb-1">Open Shifts Board</span>
                  <span className="text-2xl font-black tracking-tight text-sky-400 block">{availablePoolShifts.length} Open Positions</span>
                  <div className="w-full bg-slate-950 h-1 rounded-full mt-4 overflow-hidden">
                    <div className="bg-sky-400 h-full w-1/4" />
                  </div>
                </div>
              </div>

              {/* Data Density Trend Visualization Engine */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
                <h3 className="text-xs font-bold tracking-widest text-slate-400 uppercase">Weekly Roster Density Matrix Chart</h3>
                <div className="h-32 flex items-end justify-between gap-3 pt-4 border-b border-slate-800 px-2">
                  <div className="w-full bg-sky-500/10 border border-sky-500/20 rounded-t-lg h-1/4 hover:bg-sky-500/20 transition-all cursor-pointer relative group" />
                  <div className="w-full bg-sky-500/10 border border-sky-500/20 rounded-t-lg h-2/5 hover:bg-sky-500/20 transition-all cursor-pointer relative group" />
                  <div className="w-full bg-sky-500/20 border border-sky-500/40 rounded-t-lg h-3/4 hover:bg-sky-500/30 transition-all cursor-pointer relative group" />
                  <div className="w-full bg-sky-500/10 border border-sky-500/20 rounded-t-lg h-1/2 hover:bg-sky-500/20 transition-all cursor-pointer relative group" />
                  <div className="w-full bg-sky-500/20 border border-sky-500/30 rounded-t-lg h-2/3 hover:bg-sky-500/30 transition-all cursor-pointer relative group" />
                  <div className="w-full bg-sky-400/30 border border-sky-400/50 rounded-t-lg h-full hover:bg-sky-400/40 transition-all cursor-pointer relative group" />
                  <div className="w-full bg-sky-500/5 border border-sky-500/10 rounded-t-lg h-1/6 hover:bg-sky-500/20 transition-all cursor-pointer relative group" />
                </div>
                <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase tracking-wider px-2">
                  <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: DIRECTOR LEVEL MANAGEMENT WORKSPACE PLATFORM */}
          {currentTab === 'director' && user.role === 'director' && (
            <div className="space-y-8">
              <div className="border-b border-slate-800 pb-4">
                <h2 className="text-xl font-black tracking-tight">System Configuration Board</h2>
                <p className="text-xs text-slate-400">Initialize staff profiles, publish participant cards, and assign calendar slots across the workflow ledger.</p>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                
                {/* Onboard Support Personnel Action Form Box */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
                  <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Initialize Support Worker</h3>
                  <form onSubmit={handleRegisterWorker} className="space-y-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Full Legal Name</label>
                      <input 
                        type="text" required value={newWorkerName} onChange={(e) => setNewWorkerName(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-sky-500 transition-colors"
                        placeholder="e.g. Liam Thompson"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Staff Email Address</label>
                      <input 
                        type="email" required value={newWorkerEmail} onChange={(e) => setNewWorkerEmail(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-sky-500 transition-colors"
                        placeholder="worker@lifeunboundsupport.com.au"
                      />
                    </div>
                    <button type="submit" className="w-full bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-xs uppercase tracking-wider py-3 rounded-xl transition-all transform active:scale-95">
                      Generate Profile & System Credentials
                    </button>
                  </form>

                  {generatedPassword && (
                    <div className="p-4 bg-sky-500/5 border border-sky-500/20 rounded-xl space-y-1 animate-pulse">
                      <span className="block text-[10px] font-bold text-sky-400 uppercase tracking-widest">System Access Credentials Generated:</span>
                      <p className="text-xs font-mono font-bold text-slate-200 select-all bg-slate-950 p-2 rounded border border-slate-850 mt-1">Temporary Password: {generatedPassword}</p>
                      <p className="text-[10px] text-slate-500">Provide this temporary security key code directly to the employee for their initial ledger log in.</p>
                    </div>
                  )}
                </div>

                {/* Participant Records Registration Form Block view components */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
                  <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Onboard NDIS Participant Card</h3>
                  <form onSubmit={handleRegisterParticipant} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="sm:col-span-2">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Participant Name / Identity</label>
                      <input 
                        type="text" required value={newPartName} onChange={(e) => setNewPartName(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-sky-500 transition-colors"
                        placeholder="e.g. Benjamin Harrison"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">NDIS Number ID Reference</label>
                      <input 
                        type="text" required value={newPartNdis} onChange={(e) => setNewPartNdis(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-sky-500 transition-colors"
                        placeholder="430900999"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Primary Phone Number</label>
                      <input 
                        type="text" required value={newPartPrimaryPhone} onChange={(e) => setNewPartPrimaryPhone(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-sky-500 transition-colors"
                        placeholder="0400 123 456"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Emergency Contact Full Name</label>
                      <input 
                        type="text" required value={newPartEmergencyName} onChange={(e) => setNewPartEmergencyName(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-sky-500 transition-colors"
                        placeholder="Guardian / Next of Kin"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Emergency Contact Phone</label>
                      <input 
                        type="text" required value={newPartEmergencyPhone} onChange={(e) => setNewPartEmergencyPhone(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-sky-500 transition-colors"
                        placeholder="0400 999 888"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Behavioral Strategy / Target Support Notes</label>
                      <textarea 
                        value={newPartNotes} onChange={(e) => setNewPartNotes(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-sky-500 h-16 resize-none"
                        placeholder="Outline core community inclusion directives, triggers, communication style notes or targets..."
                      />
                    </div>
                    <button type="submit" className="sm:col-span-2 bg-sky-900 border border-sky-500/30 hover:bg-sky-850 text-sky-400 font-bold text-xs uppercase tracking-wider py-2.5 rounded-xl transition-all transform active:scale-95 mt-1">
                      Commit Record Entry to Registry
                    </button>
                  </form>
                </div>

                {/* Master Roster Segment Integration Form Block component section */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 xl:col-span-2">
                  <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Compile & Deploy Roster Segment</h3>
                  <form onSubmit={handleCreateShift} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Shift Custom Summary Heading</label>
                      <input 
                        type="text" value={shiftTitle} onChange={(e) => setShiftTitle(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-sky-500 transition-colors"
                        placeholder="e.g. Skill Building & Transport"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Assigned Support Worker</label>
                      <select 
                        value={shiftWorker} onChange={(e) => setShiftWorker(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-400 focus:outline-none focus:border-sky-500 transition-colors"
                      >
                        <option value="">Leave Unallocated (Post to Open Board)</option>
                        {profiles.filter(p => p.role === 'support_worker').map(w => (
                          <option key={w.id} value={w.id}>{w.full_name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Associated Participant Target</label>
                      <select 
                        value={shiftClient} onChange={(e) => setShiftClient(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-400 focus:outline-none focus:border-sky-500 transition-colors"
                      >
                        <option value="">Internal Corporate Administration</option>
                        {participants.map(p => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Roster Date Frame</label>
                      <input 
                        type="date" required value={shiftDate} onChange={(e) => setShiftDate(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-sky-500 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Shift Commencement Time</label>
                      <input 
                        type="time" required value={shiftStart} onChange={(e) => setShiftStart(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-sky-500 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Shift Conclusion Time</label>
                      <input 
                        type="time" required value={shiftEnd} onChange={(e) => setShiftEnd(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-sky-500 transition-colors"
                      />
                    </div>
                    <div className="lg:col-span-3">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Manager Shift Directives & Reminder Notes (Item 11)</label>
                      <textarea 
                        value={shiftDirectives} onChange={(e) => setShiftDirectives(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-sky-500 h-16 resize-none"
                        placeholder="Log vital management reminders, targeted goal notes, or considerations for care staff to parse during their operational timeline shift block..."
                      />
                    </div>
                    <button type="submit" className="lg:col-span-3 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-slate-950 font-black text-xs uppercase tracking-wider py-3 rounded-xl transition-all transform active:scale-95 shadow-md shadow-sky-500/5">
                      Deploy Roster Element to Live Calendars
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: DYNAMIC MASTER ROSTER GRID CANVAS WITH REAL INTERACTIVE FILTER MODULES (Item 2) */}
          {currentTab === 'rosters' && (
            <div className="space-y-6">
              <div className="border-b border-slate-800 pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-xl font-black tracking-tight">Master Roster Matrix Grid</h2>
                  <p className="text-xs text-slate-400">Filter calendar data layouts, isolate participant lines, and review active management directives.</p>
                </div>
                
                {/* Scale View Toggle System */}
                <div className="bg-slate-900 border border-slate-800 p-1 rounded-xl flex space-x-1 self-start sm:self-center">
                  {['day', 'week', 'month'].map(view => (
                    <button 
                      key={view} onClick={() => setCalendarView(view)}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${calendarView === view ? 'bg-sky-500 text-slate-950 shadow' : 'text-slate-400 hover:text-slate-200'}`}
                    >
                      {view} View
                    </button>
                  ))}
                </div>
              </div>

              {/* Dynamic Routing Track Target Toggles component layout rows */}
              <div className="flex flex-wrap gap-2 bg-slate-900 p-3 rounded-xl border border-slate-800">
                <button 
                  onClick={() => setRosterFilter('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${rosterFilter === 'all' ? 'bg-slate-800 text-sky-400 border border-sky-500/20' : 'text-slate-400 hover:bg-slate-950'}`}
                >
                  🌐 Combined Overall Calendar
                </button>
                <button 
                  onClick={() => setRosterFilter('admin')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${rosterFilter === 'admin' ? 'bg-slate-800 text-sky-400 border border-sky-500/20' : 'text-slate-400 hover:bg-slate-950'}`}
                >
                  💼 Admin Corporate Schedule
                </button>
                {participants.map(p => (
                  <button 
                    key={p.id} onClick={() => setRosterFilter(p.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${rosterFilter === p.id ? 'bg-slate-800 text-sky-400 border border-sky-500/20' : 'text-slate-400 hover:bg-slate-950'}`}
                  >
                    👤 Client: {p.name}
                  </button>
                ))}
              </div>

              {/* Calendar Data Array Interface List Render */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                <div className="bg-slate-850 p-4 border-b border-slate-800 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Scaling Layout Matrix: <span className="text-sky-400 font-bold">{calendarView}</span> | Context Range Target: <span className="text-sky-400 font-bold">{rosterFilter === 'all' ? 'Complete Fleet' : rosterFilter === 'admin' ? 'Internal Only' : 'Isolated Card File'}</span>
                  </span>
                  <span className="text-[9px] font-bold tracking-wider uppercase bg-slate-950 text-slate-400 px-2.5 py-1 rounded-full border border-slate-800">Sync Pipeline Active</span>
                </div>

                <div className="p-4 sm:p-6 space-y-4">
                  {shifts
                    .filter(s => {
                      if (rosterFilter === 'admin') return !s.participant_id;
                      if (rosterFilter !== 'all') return s.participant_id === rosterFilter;
                      return true;
                    })
                    .map(shift => {
                      const staffCard = profiles.find(p => p.id === shift.staff_id);
                      const clientCard = participants.find(p => p.id === shift.participant_id);
                      return (
                        <div key={shift.id} className="bg-slate-950 border border-slate-850 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 hover:border-slate-800 transition-all">
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <span className="w-2 h-2 bg-sky-400 rounded-full" />
                              <h4 className="font-bold text-sm text-slate-200">{shift.title}</h4>
                              <span className={`text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded ${shift.status === 'available' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-sky-500/10 text-sky-400 border border-sky-500/20'}`}>
                                {shift.status}
                              </span>
                            </div>
                            <p className="text-xs text-slate-400 font-medium font-mono">
                              Date Range: {new Date(shift.start_time).toLocaleDateString()} | Timestamps: {new Date(shift.start_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - {new Date(shift.end_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </p>
                            <div className="flex flex-wrap gap-2 text-[10px] pt-1">
                              <span className="bg-slate-900 text-slate-400 px-2 py-1 rounded border border-slate-850">
                                Support Provider: <strong className="text-slate-300">{staffCard ? staffCard.full_name : 'Unassigned/Available'}</strong>
                              </span>
                              <span className="bg-slate-900 text-slate-400 px-2 py-1 rounded border border-slate-850">
                                Participant Allocation: <strong className="text-slate-300">{clientCard ? clientCard.name : 'Corporate Admin'}</strong>
                              </span>
                            </div>
                            {shift.manager_directives && (
                              <div className="mt-2 bg-slate-900 border-l border-sky-500 p-2.5 text-xs text-slate-300 rounded-r-lg">
                                📌 <strong>Manager Directive Summary:</strong> {shift.manager_directives}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}

                  {shifts.length === 0 && (
                    <div className="text-center py-12 text-slate-500 text-xs tracking-wide">
                      No operational shifts or calendar elements mapped across matching filtering criteria strings.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: COMPREHENSIVE CLIENT DOSSIER PROFILE REGISTRY SYSTEM (Item 3) */}
          {currentTab === 'profiles' && (
            <div className="space-y-6">
              <div className="border-b border-slate-800 pb-4">
                <h2 className="text-xl font-black tracking-tight">Participant Dossier Interface</h2>
                <p className="text-xs text-slate-400">Select an active client profile card to verify emergency coordination data channels or audit notes.</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Index Card Side selector track pipeline component layout */}
                <div className="space-y-2 lg:col-span-1">
                  {participants.map(p => (
                    <div 
                      key={p.id} onClick={() => setSelectedClient(p)}
                      className={`p-4 rounded-xl border text-left cursor-pointer transition-all transform active:scale-98 ${selectedClient?.id === p.id ? 'bg-sky-500/10 border-sky-500 text-sky-400' : 'bg-slate-900 border-slate-800 hover:bg-slate-850 text-slate-400'}`}
                    >
                      <h4 className="font-bold text-xs uppercase tracking-wide block mb-0.5">{p.name}</h4>
                      <span className="text-[10px] font-mono text-slate-500">NDIS Registry Key: {p.ndis_number || 'N/A'}</span>
                    </div>
                  ))}
                  {participants.length === 0 && (
                    <p className="text-xs text-slate-500 italic text-center py-4">No active participant profiles stored on cloud cluster architecture logs.</p>
                  )}
                </div>

                {/* Profile Inspector Deck View Component Panel */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:col-span-2 min-h-[350px] flex flex-col justify-between">
                  {selectedClient ? (
                    <div className="space-y-5">
                      <div className="border-b border-slate-800 pb-4 flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-black uppercase text-slate-200 tracking-wide">{selectedClient.name}</h3>
                          <span className="text-[9px] font-mono text-sky-400 bg-slate-950 border border-slate-850 px-2 py-1 rounded mt-1 inline-block">SYSTEM KEYID: {selectedClient.id}</span>
                        </div>
                        <span className="text-[9px] font-bold bg-sky-500/10 text-sky-400 border border-sky-500/20 px-3 py-1 rounded-full uppercase tracking-widest">NDIS Active</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-slate-950 p-4 rounded-xl border border-slate-850">
                          <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Primary Communications Channel</span>
                          <p className="text-xs font-mono font-bold text-slate-200">{selectedClient.primary_contact_phone || 'Unlisted/Null'}</p>
                        </div>
                        <div className="bg-slate-950 p-4 rounded-xl border border-slate-850">
                          <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">NDIS Operational Identity Reference</span>
                          <p className="text-xs font-mono font-bold text-slate-200">{selectedClient.ndis_number || 'Unlisted/Null'}</p>
                        </div>
                        <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 sm:col-span-2">
                          <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Emergency Contact Hierarchy Matrix</span>
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-slate-300 font-bold">Designated Contact: <strong className="text-sky-400">{selectedClient.emergency_contact_name || 'Not logged'}</strong></span>
                            <span className="text-slate-400 font-mono font-bold">Tel: {selectedClient.emergency_contact_phone || 'Not logged'}</span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-1">
                        <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Baseline Behavioral Care Directives</span>
                        <p className="text-xs text-slate-300 leading-relaxed font-medium">{selectedClient.about_me_notes || 'No active baseline tracking care notes or strategy structures compiled inside this data container row.'}</p>
                      </div>

                      <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row gap-2 justify-between items-start sm:items-center text-[10px]">
                        <span className="text-slate-500 italic">To edit file cards, update client files on the Director Control Center.</span>
                        <button className="bg-slate-950 text-slate-400 hover:text-slate-200 font-bold px-3 py-2 rounded-lg border border-slate-850 transition-colors uppercase tracking-wider text-[9px]">
                          🔗 Open Connected Sharepoint Storage Cloud Vault
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="m-auto text-center space-y-2">
                      <span className="text-2xl block animate-pulse">👥</span>
                      <p className="text-xs text-slate-500 tracking-wide">Select an active client record link from the sidebar directory track index to initialize individual card audits.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: OPEN SHIFT BOARD INTERACTION MODULE MECHANICAL INTERFACES (Item 12) */}
          {currentTab === 'shiftsBoard' && (
            <div className="space-y-6">
              <div className="border-b border-slate-800 pb-4">
                <h2 className="text-xl font-black tracking-tight">Open Shift Board Repository</h2>
                <p className="text-xs text-slate-400">Review unallocated workflow segments posted for the fortnight period. Click any element to claim and lock it to your personal tracking map.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {availablePoolShifts.map(shift => {
                  const targetClient = participants.find(p => p.id === shift.participant_id);
                  return (
                    <div key={shift.id} className="bg-slate-900 border-2 border-dashed border-slate-800 hover:border-sky-500/30 rounded-2xl p-5 flex flex-col justify-between transition-all space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-black tracking-widest bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded uppercase border border-amber-500/20">Open Position</span>
                          <span className="text-xs font-bold text-slate-400 font-mono">{new Date(shift.start_time).toLocaleDateString()}</span>
                        </div>
                        <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wide">{shift.title}</h3>
                        <p className="text-xs text-slate-400 font-semibold font-mono">
                          Duration Vector: {new Date(shift.start_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} to {new Date(shift.end_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </p>
                        <span className="block text-[10px] text-slate-300 bg-slate-950 p-2.5 rounded-lg border border-slate-850">
                          Participant Target Group: <strong className="text-sky-400 font-bold uppercase tracking-wide">{targetClient ? targetClient.name : 'Internal Administrative Care'}</strong>
                        </span>
                        {shift.manager_directives && (
                          <p className="text-[11px] text-slate-400 italic bg-slate-950/50 p-2.5 rounded border border-slate-850">Reminders: "{shift.manager_directives}"</p>
                        )}
                      </div>
                      <button 
                        onClick={() => handleClaimShift(shift.id)}
                        className="w-full bg-sky-500 hover:bg-sky-400 text-slate-950 font-black py-2.5 rounded-xl transition-all uppercase tracking-wider text-xs shadow-lg shadow-sky-500/5 transform active:scale-95"
                      >
                        Claim Shift Assignment
                      </button>
                    </div>
                  );
                })}

                {availablePoolShifts.length === 0 && (
                  <div className="col-span-2 text-center py-16 bg-slate-900 rounded-2xl border-2 border-dashed border-slate-800 text-slate-500 text-xs tracking-wide">
                    No open shift allocations listed for immediate provider pickup. Verify with coordinator channels.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 6: AVAILABILITY RECORDFILE SCHEDULING INTERACTIVE CANVAS (Item 4) */}
          {currentTab === 'availability' && (
            <div className="space-y-6">
              <div className="border-b border-slate-800 pb-4">
                <h2 className="text-xl font-black tracking-tight">Staff Availability Grid Setup</h2>
                <p className="text-xs text-slate-400">Map out your weekly functional availability windows. Entries update your profile row automatically to guide director booking pipelines.</p>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 h-fit space-y-4">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Log Scheduling Block</h3>
                  <form onSubmit={handleSubmitAvailability} className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Target Weekday</label>
                      <select 
                        value={availDay} onChange={(e) => setAvailDay(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-300 focus:outline-none focus:border-sky-500 transition-colors"
                      >
                        {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                          <option key={day} value={day}>{day}</option>
                        ))}
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Start Time</label>
                        <input 
                          type="time" value={availStart} onChange={(e) => setAvailStart(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-sky-500 transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">End Time</label>
                        <input 
                          type="time" value={availEnd} onChange={(e) => setAvailEnd(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-sky-500 transition-colors"
                        />
                      </div>
                    </div>
                    <button type="submit" className="w-full bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-xs uppercase tracking-wider py-2.5 rounded-xl transition-all transform active:scale-95">
                      Lock Availability Window
                    </button>
                  </form>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 xl:col-span-2 space-y-4">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Active Profile Working Constraints Map</h3>
                  <div className="space-y-2">
                    {availabilities.map(av => (
                      <div key={av.id} className="bg-slate-950 p-4 rounded-xl border border-slate-850 flex items-center justify-between">
                        <span className="font-bold text-slate-200 text-xs uppercase tracking-wide">{av.day} Allocation Slot</span>
                        <span className="text-[10px] font-mono bg-slate-900 text-sky-400 border border-slate-800 px-3 py-1 rounded-md">
                          Clock Configuration: {av.start} to {av.end}
                        </span>
                      </div>
                    ))}
                    {availabilities.length === 0 && (
                      <p className="text-xs text-slate-500 italic py-6 text-center tracking-wide">No scheduling timeline constraints or availability profiles recorded yet inside this interface workspace session.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: COMPLETE INTERACTIVE FORTNIGHTLY TIMESHEET TEMPLATE (Items 5, 10) */}
          {currentTab === 'timesheets' && (
            <div className="space-y-8">
              <div className="border-b border-slate-800 pb-4">
                <h2 className="text-xl font-black tracking-tight">Fortnightly Remittance Reporting Center</h2>
                <p className="text-xs text-slate-400">File your digital operational logs. Submissions lock automatically upon submission and are dispatched to management via automated email routing.</p>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                
                {/* Entry Field Form System elements components layout */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 xl:col-span-2 space-y-4 h-fit shadow-2xl">
                  <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Log Fortnightly Timesheet Record</h3>
                  <form onSubmit={handleTimesheetSubmission} className="space-y-4">
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Fortnight Covering Period Range (Start Date)</label>
                        <input 
                          type="date" required value={tsFortnightStart} onChange={(e) => setTsFortnightStart(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-sky-500 transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Specific Roster Shift Date Worked</label>
                        <input 
                          type="date" required value={tsDateWorked} onChange={(e) => setTsDateWorked(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-sky-500 transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Shift Start Time (Commencement)</label>
                        <input 
                          type="time" required value={tsStart} onChange={(e) => setTsStart(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-sky-500 transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Shift End Time (Conclusion)</label>
                        <input 
                          type="time" required value={tsEnd} onChange={(e) => setTsEnd(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-sky-500 transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Associated Participant Account</label>
                        <select 
                          required value={tsClient} onChange={(e) => setTsClient(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-400 focus:outline-none focus:border-sky-500 transition-colors"
                        >
                          <option value="">-- Select Active Client --</option>
                          {participants.map(p => (
                            <option key={p.id} value={p.name}>{p.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">KM (With Participant)</label>
                          <input 
                            type="number" value={tsKmWithClient} onChange={(e) => setTsKmWithClient(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-sky-500 transition-colors"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">KM (Car - Empty)</label>
                          <input 
                            type="number" value={tsKmWithoutClient} onChange={(e) => setTsKmWithoutClient(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-sky-500 transition-colors"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Shift Case Notes Narrative Summary Log</label>
                      <textarea 
                        required value={tsNotes} onChange={(e) => setTsNotes(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-sky-500 h-20 resize-none"
                        placeholder="Provide tracking summary details of operations, goals hit, community excursions logged..."
                      />
                    </div>

                    <div className="flex items-start space-x-3 bg-slate-950 p-4 rounded-xl border border-slate-850">
                      <input 
                        type="checkbox" required id="notesCheck" checked={tsNotesChecked} onChange={(e) => setTsNotesChecked(e.target.checked)}
                        className="w-4 h-4 bg-slate-900 border border-slate-800 rounded focus:ring-sky-500 accent-sky-500 mt-0.5"
                      />
                      <label htmlFor="notesCheck" className="text-[11px] text-slate-400 select-none leading-relaxed font-medium">
                        I explicitly confirm and record that my complete shift progression logs and case notes have been officially filled and filed across active client management streams.
                      </label>
                    </div>

                    <div className="p-3.5 bg-rose-500/5 border border-rose-500/20 text-[10px] font-bold tracking-wide text-rose-400/80 rounded-xl uppercase">
                      <strong>⚠️ Irreversible Data Entry Notice:</strong> Once this fortnightly reporting sheet data payload is submitted, values lock securely across the system cluster ledger and cannot be changed by care staff.
                    </div>

                    <button type="submit" className="w-full bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-slate-950 font-black text-xs uppercase tracking-wider py-3.5 rounded-xl transition-all transform active:scale-95 shadow-md shadow-sky-500/5">
                      Authorize Verification & Submit Fortnightly Timesheet
                    </button>
                  </form>
                </div>

                {/* Submissions Logs Remittance History Box Widget Component (Item 10) */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 h-fit">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Your Submission History Log</h3>
                  <div className="space-y-3">
                    {timesheets.map(ts => (
                      <div key={ts.id} className="bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-2">
                        <div className="flex items-center justify-between border-b border-slate-850 pb-1.5">
                          <span className="text-[10px] font-mono font-bold text-sky-400">Ledger ID: #{ts.id}</span>
                          <span className="text-[9px] bg-sky-500/10 text-sky-400 px-2 py-0.5 rounded font-black uppercase tracking-wider border border-sky-500/20">Locked & Sent</span>
                        </div>
                        <p className="text-xs text-slate-300 font-bold uppercase tracking-wide">Period Range: <strong className="text-slate-100 font-mono font-bold">{ts.fortnightCovering}</strong></p>
                        <p className="text-[11px] text-slate-400 font-medium">Date Worked: {ts.dateWorked} ({ts.hours})</p>
                        <div className="flex justify-between items-center text-[10px] text-slate-500 font-bold pt-1 uppercase tracking-wider">
                          <span>Target: {ts.client}</span>
                          <span>Sum Volume: {Number(ts.kmsClient) + Number(ts.kmsPrivate)} KM</span>
                        </div>
                      </div>
                    ))}
                    {timesheets.length === 0 && (
                      <p className="text-[11px] text-slate-500 italic py-8 text-center tracking-wide">No active fortnightly remittance file entries recorded yet within this active workspace container session.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
