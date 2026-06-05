'use client';
// @ts-nocheck
/* eslint-disable */

import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://wgtcvmyofcoikynyftwn.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_naqzF_7iH63JA-0G2pw8Cw_XY7waAin';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ─── Utility helpers ─────────────────────────────────────────────────────────
const fmt     = (iso, opts) => iso ? new Date(iso).toLocaleDateString('en-AU', opts) : '';
const fmtTime = (iso)       => iso ? new Date(iso).toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' }) : '';
const DOT     = '·';
const DAYS    = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
const WDAYS   = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

// ─── Bar chart (SVG, no external library) ────────────────────────────────────
const ShiftsChart = ({ shifts }) => {
  const filled   = shifts.filter(s => s.staff_id).length;
  const unfilled = shifts.filter(s => !s.staff_id).length;
  const max      = Math.max(filled, unfilled, 1);
  const H = 90, BW = 52;
  return (
    <svg viewBox="0 0 190 120" className="w-full max-w-[180px]">
      {[0.25, 0.5, 0.75, 1].map(p => (
        <line key={p} x1="20" y1={H - p * H} x2="175" y2={H - p * H} stroke="#f1f5f9" strokeWidth="1" />
      ))}
      <rect x="30"  y={H - (filled   / max) * H} width={BW} height={(filled   / max) * H} fill="#2563eb" rx="6" />
      <text x="56"  y={H - (filled   / max) * H - 7} textAnchor="middle" fontSize="13" fill="#1d4ed8" fontWeight="800">{filled}</text>
      <text x="56"  y={H + 16} textAnchor="middle" fontSize="9" fill="#94a3b8" fontWeight="700">FILLED</text>
      <rect x="108" y={H - (unfilled / max) * H} width={BW} height={(unfilled / max) * H} fill="#f59e0b" rx="6" />
      <text x="134" y={H - (unfilled / max) * H - 7} textAnchor="middle" fontSize="13" fill="#b45309" fontWeight="800">{unfilled}</text>
      <text x="134" y={H + 16} textAnchor="middle" fontSize="9" fill="#94a3b8" fontWeight="700">OPEN</text>
    </svg>
  );
};

// ─── Modal overlay ────────────────────────────────────────────────────────────
const Modal = ({ onClose, title, wide = false, children }) => (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
    onClick={onClose}
  >
    <div
      className={'bg-white rounded-2xl shadow-2xl w-full ' + (wide ? 'max-w-3xl' : 'max-w-xl') + ' max-h-[92vh] overflow-y-auto'}
      onClick={e => e.stopPropagation()}
    >
      <div className="sticky top-0 bg-white/95 backdrop-blur border-b border-slate-100 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
        <span className="text-xs font-black uppercase tracking-widest text-blue-900">{title}</span>
        <button
          onClick={onClose}
          className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-red-50 hover:text-red-500 text-slate-500 font-bold text-base transition-colors"
        >
          {'×'}
        </button>
      </div>
      <div className="p-6 space-y-4">{children}</div>
    </div>
  </div>
);

// ─── Reusable form primitives ─────────────────────────────────────────────────
const Label = ({ children }) => (
  <label className="block text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">{children}</label>
);

const Inp = (props) => (
  <input
    {...props}
    className={
      'w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 ' +
      'focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition-all ' +
      (props.className || '')
    }
  />
);

const Txa = (props) => (
  <textarea
    {...props}
    className={
      'w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 ' +
      'focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none ' +
      (props.className || '')
    }
  />
);

const Sel = (props) => (
  <select
    {...props}
    className={
      'w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 ' +
      'focus:outline-none focus:ring-2 focus:ring-blue-300 ' +
      (props.className || '')
    }
  />
);

const Btn = ({ variant, size, className = '', ...p }) => {
  const v = variant || 'primary';
  const s = size    || 'md';
  const base = 'font-bold uppercase tracking-wider rounded-lg transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center justify-center gap-1.5 ';
  const sizes    = { sm: 'px-3 py-1.5 text-[9px]', md: 'px-4 py-2.5 text-[10px]', lg: 'px-6 py-3 text-xs' };
  const variants = {
    primary:   'bg-blue-600 hover:bg-blue-700 text-white shadow-sm',
    secondary: 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200',
    danger:    'bg-red-50 hover:bg-red-100 text-red-600 border border-red-200',
    success:   'bg-green-600 hover:bg-green-700 text-white shadow-sm',
    amber:     'bg-amber-500 hover:bg-amber-600 text-white shadow-sm',
  };
  return <button {...p} className={base + (sizes[s] || '') + ' ' + (variants[v] || '') + ' ' + (className || '')} />;
};

const StatCard = ({ label, value, accent, sub }) => (
  <div className={'bg-white rounded-xl border border-slate-200 shadow-sm p-4 border-l-4 ' + accent}>
    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">{label}</p>
    <p className="text-2xl font-black text-slate-800">{value}</p>
    {sub && <p className="text-[10px] text-slate-400 mt-0.5">{sub}</p>}
  </div>
);

// ─── Main component ───────────────────────────────────────────────────────────
export default function LifeUnboundPortal() {

  // Auth
  const [portalType,    setPortalType]    = useState(null);
  const [user,          setUser]          = useState(null);
  const [loginEmail,    setLoginEmail]    = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loading,       setLoading]       = useState(false);
  const [notification,  setNotification]  = useState(null);

  // Data
  const [profiles,     setProfiles]     = useState([]);
  const [participants, setParticipants] = useState([]);
  const [shifts,       setShifts]       = useState([]);

  // Navigation
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [adminTab,   setAdminTab]   = useState('workers');

  // Calendar
  const [calView,   setCalView]   = useState('month');
  const [calOffset, setCalOffset] = useState(0);

  // Fortnights
  const [fortnights,  setFortnights]  = useState([]);
  const [selectedFN,  setSelectedFN]  = useState('');
  const [availFN,     setAvailFN]     = useState('');

  // Shift create form
  const [evtCategory,    setEvtCategory]    = useState('shift');
  const [shiftTitle,     setShiftTitle]     = useState('');
  const [allocType,      setAllocType]      = useState('available');
  const [selWorkers,     setSelWorkers]     = useState([]);
  const [selParticipants,setSelParticipants]= useState([]);
  const [shiftDate,      setShiftDate]      = useState('');
  const [shiftStart,     setShiftStart]     = useState('');
  const [shiftEnd,       setShiftEnd]       = useState('');
  const [shiftDirectives,setShiftDirectives]= useState('');

  // Edit/assign modals
  const [editShiftOpen, setEditShiftOpen] = useState(false);
  const [editShift,     setEditShift]     = useState(null);
  const [assignOpen,    setAssignOpen]    = useState(false);
  const [assignTarget,  setAssignTarget]  = useState(null);
  const [assignToId,    setAssignToId]    = useState('');

  // Timesheets
  const [viewTsOpen,       setViewTsOpen]       = useState(false);
  const [viewingTs,        setViewingTs]         = useState(null);
  const [timesheetHistory, setTimesheetHistory]  = useState([]);
  const [tsRows,           setTsRows]            = useState([{ date:'', start:'', end:'', client:'', kmWith:'0', kmWithout:'0', notes:'' }]);
  const [tsVerified,       setTsVerified]        = useState(false);

  // Availability
  const [availDays, setAvailDays] = useState({
    Monday:    { mode: 'standard',    start: '09:00', end: '17:00' },
    Tuesday:   { mode: 'standard',    start: '09:00', end: '17:00' },
    Wednesday: { mode: 'standard',    start: '09:00', end: '17:00' },
    Thursday:  { mode: 'standard',    start: '09:00', end: '17:00' },
    Friday:    { mode: 'standard',    start: '09:00', end: '17:00' },
    Saturday:  { mode: 'unavailable', start: '',      end: ''      },
    Sunday:    { mode: 'unavailable', start: '',      end: ''      },
  });
  const [availSubmissions, setAvailSubmissions] = useState([]);

  // Worker registration form
  const [wName,  setWName]  = useState('');
  const [wEmail, setWEmail] = useState('');
  const [wPhone, setWPhone] = useState('');
  const [wNotes, setWNotes] = useState('');
  const [genPwd, setGenPwd] = useState('');

  // Participant registration form
  const [pName, setPName] = useState('');
  const [pNdis, setPNdis] = useState('');

  // Extended participant details (local state, keyed by participant id)
  const [partDetails,    setPartDetails]    = useState({});
  const [editingPartId,  setEditingPartId]  = useState(null);
  const [expandedPartId, setExpandedPartId] = useState(null);

  // ─── Toast notification ───────────────────────────────────────────────────
  const toast = (msg, type = 'success') => {
    setNotification({ msg, type: type || 'success' });
    setTimeout(() => setNotification(null), 4500);
  };

  // ─── Fortnight generator ──────────────────────────────────────────────────
  useEffect(() => {
    const periods = [];
    const start   = new Date('2026-01-05T00:00:00');
    for (let i = 1; i <= 26; i++) {
      const end = new Date(start);
      end.setDate(end.getDate() + 13);
      periods.push({
        id:    'FN-' + i,
        label: 'Fortnight ' + i + ': ' +
               start.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' }) + ' - ' +
               end.toLocaleDateString('en-AU',   { day: 'numeric', month: 'short' }),
      });
      start.setDate(start.getDate() + 14);
    }
    setFortnights(periods);
    if (periods[10]) { setSelectedFN(periods[10].id); setAvailFN(periods[10].id); }
  }, []);

  // ─── Fetch Supabase data on login ─────────────────────────────────────────
  useEffect(() => { if (user) fetchData(); }, [user]);

  const fetchData = async () => {
    try {
      const [{ data: profs }, { data: parts }, { data: sfts }] = await Promise.all([
        supabase.from('profiles').select('*'),
        supabase.from('participants').select('*'),
        supabase.from('shifts').select('*'),
      ]);
      if (profs) setProfiles(profs);
      if (parts) setParticipants(parts);
      if (sfts)  setShifts(sfts);
    } catch (e) { console.error(e); }
  };

  // ─── Authentication ───────────────────────────────────────────────────────
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles').select('*').eq('email', loginEmail.trim()).single();
      if (error || !data)                                     { toast('No account found for that email.', 'error'); return; }
      if (data.password_mock !== loginPassword.trim())        { toast('Incorrect password.', 'error'); return; }
      if (portalType === 'admin' && data.role !== 'director') { toast('Admin access requires director role.', 'error'); return; }
      setUser(data);
      setCurrentTab('dashboard');
      toast('Welcome back, ' + data.(data.full_name || 'there').split(' ')[0] + '.');
    } catch { toast('Connection error. Please try again.', 'error'); }
    finally  { setLoading(false); }
  };

  // ─── Register support worker ──────────────────────────────────────────────
  const handleRegisterWorker = async (e) => {
    e.preventDefault();
    const pwd = 'LU-' + Math.random().toString(36).substring(2, 8).toUpperCase() + '!';
    try {
      const notes = JSON.stringify({ phone: wPhone.trim(), notes: wNotes.trim() });
      const { error } = await supabase.from('profiles').insert([{
        email: wEmail.trim(), full_name: wName.trim(),
        role: 'support_worker', password_mock: pwd, notes,
      }]);
      if (error) throw error;
      setGenPwd(pwd);
      toast('Worker account created successfully.');
      setWName(''); setWEmail(''); setWPhone(''); setWNotes('');
      fetchData();
    } catch (err) { toast((err && err.message) || 'Error creating worker.', 'error'); }
  };

  // ─── Register participant ─────────────────────────────────────────────────
  const handleRegisterParticipant = async (e) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from('participants')
        .insert([{ name: pName.trim(), ndis_number: pNdis.trim() }]);
      if (error) throw error;
      toast('Participant registered.');
      setPName(''); setPNdis('');
      fetchData();
    } catch (err) { toast((err && err.message) || 'Error registering participant.', 'error'); }
  };

  // ─── Create shift ─────────────────────────────────────────────────────────
  const handleCreateShift = async (e) => {
    e.preventDefault();
    try {
      const prefix   = evtCategory === 'event' ? '[EVENT] ' : '';
      const title    = prefix + (shiftTitle.trim() || 'Shift');
      const startIso = shiftDate + 'T' + shiftStart + ':00';
      const endIso   = shiftDate + 'T' + shiftEnd   + ':00';
      let rows = [];
      if (allocType === 'available') {
        rows.push({ title, staff_id: null, participant_id: null, start_time: startIso, end_time: endIso, manager_directives: shiftDirectives.trim(), status: 'available' });
      } else if (allocType === 'admin') {
        rows.push({ title, staff_id: null, participant_id: null, start_time: startIso, end_time: endIso, manager_directives: shiftDirectives.trim(), status: 'scheduled' });
      } else {
        const ws = selWorkers.length      ? selWorkers      : [null];
        const ps = selParticipants.length ? selParticipants : [null];
        ws.forEach(w => ps.forEach(p =>
          rows.push({ title, staff_id: w, participant_id: p, start_time: startIso, end_time: endIso, manager_directives: shiftDirectives.trim(), status: w ? 'scheduled' : 'available' })
        ));
      }
      const { error } = await supabase.from('shifts').insert(rows);
      if (error) throw error;
      toast('Published ' + rows.length + ' shift(s).');
      setShiftTitle(''); setShiftDirectives('');
      setShiftDate('');  setShiftStart(''); setShiftEnd('');
      setSelWorkers([]); setSelParticipants([]);
      fetchData();
    } catch (err) { toast((err && err.message) || 'Error creating shift.', 'error'); }
  };

  // ─── Edit / delete shift ──────────────────────────────────────────────────
  const openEditShift = (shift) => { setEditShift({ ...shift }); setEditShiftOpen(true); };

  const handleSaveShift = async () => {
    try {
      const { error } = await supabase.from('shifts').update({
        title:               editShift.title,
        start_time:          editShift.start_time,
        end_time:            editShift.end_time,
        manager_directives:  editShift.manager_directives,
        staff_id:            editShift.staff_id || null,
        status:              editShift.status,
      }).eq('id', editShift.id);
      if (error) throw error;
      toast('Shift updated.');
      setEditShiftOpen(false);
      fetchData();
    } catch (err) { toast((err && err.message) || 'Error updating shift.', 'error'); }
  };

  const handleDeleteShift = async () => {
    if (typeof window !== 'undefined' && !window.confirm('Delete this shift permanently?')) return;
    try {
      const { error } = await supabase.from('shifts').delete().eq('id', editShift.id);
      if (error) throw error;
      toast('Shift deleted.');
      setEditShiftOpen(false);
      fetchData();
    } catch (err) { toast((err && err.message) || 'Error deleting shift.', 'error'); }
  };

  // ─── Assign shift to worker ───────────────────────────────────────────────
  const openAssign = (shift) => { setAssignTarget(shift); setAssignToId(''); setAssignOpen(true); };

  const handleAssign = async () => {
    if (!assignToId) { toast('Please select a worker.', 'error'); return; }
    try {
      const { error } = await supabase.from('shifts')
        .update({ staff_id: assignToId, status: 'scheduled' }).eq('id', assignTarget.id);
      if (error) throw error;
      toast('Shift assigned successfully.');
      setAssignOpen(false);
      fetchData();
    } catch (err) { toast((err && err.message) || 'Error assigning shift.', 'error'); }
  };

  // ─── Claim open shift (worker) ────────────────────────────────────────────
  const handleClaim = async (id) => {
    try {
      const { error } = await supabase.from('shifts')
        .update({ staff_id: user.id, status: 'scheduled' }).eq('id', id);
      if (error) throw error;
      toast('Shift claimed.');
      fetchData();
    } catch { toast('Error claiming shift.', 'error'); }
  };

  // ─── Timesheet helpers ────────────────────────────────────────────────────
  const addTsRow    = () => setTsRows([...tsRows, { date:'', start:'', end:'', client:'', kmWith:'0', kmWithout:'0', notes:'' }]);
  const removeTsRow = (i) => setTsRows(tsRows.filter((_, idx) => idx !== i));
  const updateTs    = (i, f, v) => { const r = [...tsRows]; r[i][f] = v; setTsRows(r); };

  const handleSubmitTs = (e) => {
    e.preventDefault();
    if (!tsVerified) { toast('Please tick the verification checkbox.', 'error'); return; }
    let hrs = 0;
    tsRows.forEach(r => {
      if (r.start && r.end) {
        const s = r.start.split(':').map(Number);
        const x = r.end.split(':').map(Number);
        hrs += Math.max(0, (x[0] * 60 + x[1] - s[0] * 60 - s[1]) / 60);
      }
    });
    const record = {
      id:             'TS-' + Date.now(),
      workerName:     user.full_name,
      workerEmail:    user.email,
      workerId:       user.id,
      fortnightId:    selectedFN,
      fortnightLabel: ((fortnights.find(f => f.id === selectedFN)) || {}).label || selectedFN,
      rows:           [...tsRows],
      totalHours:     Math.round(hrs * 10) / 10,
      submittedAt:    new Date().toLocaleDateString('en-AU', { day:'numeric', month:'short', year:'numeric' }),
    };
    setTimesheetHistory([record, ...timesheetHistory]);
    toast('Timesheet submitted successfully.');
    setTsRows([{ date:'', start:'', end:'', client:'', kmWith:'0', kmWithout:'0', notes:'' }]);
    setTsVerified(false);
  };

  // ─── Availability helpers ─────────────────────────────────────────────────
  const setAvailMode = (day, mode) => {
    const u = { ...availDays };
    u[day] = { ...u[day], mode };
    if (mode === 'allday')      { u[day].start = '00:00'; u[day].end = '23:59'; }
    if (mode === 'unavailable') { u[day].start = '';      u[day].end = '';      }
    setAvailDays(u);
  };

  const handleSubmitAvail = (e) => {
    e.preventDefault();
    const item = {
      id:             'AV-' + Date.now(),
      workerName:     user.full_name,
      fortnightLabel: ((fortnights.find(f => f.id === availFN)) || {}).label || availFN,
      matrix:         { ...availDays },
      submittedAt:    new Date().toLocaleDateString('en-AU'),
    };
    setAvailSubmissions([item, ...availSubmissions]);
    toast('Availability submitted.');
  };

  // ─── Participant extended data helpers ────────────────────────────────────
  const getExt      = (id)       => partDetails[id] || {};
  const setExtField = (id, f, v) =>
    setPartDetails(prev => ({ ...prev, [id]: { ...(prev[id] || {}), [f]: v } }));

const handleFileUpload = (id, e) => {
    const files    = Array.from(e.target.files) as File[];
    const existing = getExt(id).files || [];
    Promise.all(
      files.map((f: File) => new Promise(res => {
        const reader = new FileReader();
        reader.onload = () => res({ name: f.name, type: f.type, size: f.size, data: reader.result });
        reader.readAsDataURL(f);
      }))
    ).then(nf =>
      setPartDetails(prev => ({ ...prev, [id]: { ...(prev[id] || {}), files: [...existing, ...nf] } }))
    );
  };

  const removeFile = (id, idx) => {
    const f = [...(getExt(id).files || [])];
    f.splice(idx, 1);
    setExtField(id, 'files', f);
  };

  // ─── Calendar helpers ─────────────────────────────────────────────────────
  const getMonthGrid = () => {
    const base  = new Date();
    base.setDate(1);
    base.setMonth(base.getMonth() + calOffset);
    const year     = base.getFullYear();
    const month    = base.getMonth();
    const firstDow = new Date(year, month, 1).getDay(); // 0 = Sunday
    const offset   = firstDow === 0 ? 6 : firstDow - 1; // Convert to Mon = 0
    const days     = new Date(year, month + 1, 0).getDate();
    return { year, month, offset, days };
  };

  const getWeekDates = () => {
    const today = new Date();
    const dow   = today.getDay();
    const toMon = dow === 0 ? -6 : 1 - dow;
    const mon   = new Date(today);
    mon.setDate(today.getDate() + toMon + calOffset * 7);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(mon);
      d.setDate(mon.getDate() + i);
      return d;
    });
  };

  const calHeader = () => {
    if (calView === 'day') {
      const d = new Date();
      d.setDate(d.getDate() + calOffset);
      return d.toLocaleDateString('en-AU', { weekday:'long', day:'numeric', month:'long', year:'numeric' });
    }
    if (calView === 'week') {
      const wk = getWeekDates();
      return wk[0].toLocaleDateString('en-AU', { day:'numeric', month:'short' }) + ' - ' +
             wk[6].toLocaleDateString('en-AU', { day:'numeric', month:'short', year:'numeric' });
    }
    const d = new Date();
    d.setDate(1);
    d.setMonth(d.getMonth() + calOffset);
    return d.toLocaleDateString('en-AU', { month:'long', year:'numeric' });
  };

  const shiftsOnDate = (y, m, d) => shifts.filter(s => {
    const sd = new Date(s.start_time);
    return sd.getFullYear() === y && sd.getMonth() === m && sd.getDate() === d;
  });

  // ─── Derived values ───────────────────────────────────────────────────────
  const workers        = profiles.filter(p => p.role === 'support_worker');
  const unfilledShifts = shifts.filter(s => !s.staff_id);
  const myShifts       = shifts.filter(s => s.staff_id === (user && user.id));
return (
    <div className="min-h-screen bg-slate-50 text-slate-900 antialiased" style={{ fontFamily: "'DM Sans','Segoe UI',sans-serif" }}>

      {/* ── HEADER ── */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-sm">
        <div className="px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-md overflow-hidden">
              <img src="/logo.png" alt="LU" className="w-full h-full object-contain" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
            </div>
            <div>
              <div className="font-black text-sm text-blue-900 tracking-tight leading-none">LIFE UNBOUND SUPPORT</div>
              <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Operations Portal</div>
            </div>
          </div>
          {user && (
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-xs font-black text-slate-700 uppercase">{user.full_name}</span>
                <span className="text-[9px] text-slate-400 font-medium">{user.role === 'director' ? 'Director' : 'Support Worker'}</span>
              </div>
              <Btn variant="secondary" size="sm" onClick={() => { setUser(null); setPortalType(null); }}>Sign Out</Btn>
            </div>
          )}
        </div>
      </header>

      {/* ── TOP NAV ── */}
      {user && (
        <nav className="bg-white border-b border-slate-200 px-5 flex flex-wrap gap-0 shadow-sm overflow-x-auto">
          {[
            { id: 'dashboard',    label: 'Dashboard'    },
            ...(user.role === 'director' ? [{ id: 'director', label: 'Admin Centre' }] : []),
            { id: 'rosters',      label: 'Calendar'     },
            { id: 'profiles',     label: 'Participants' },
            { id: 'availability', label: 'Availability' },
            { id: 'timesheets',   label: 'Timesheets'   },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setCurrentTab(t.id)}
              className={'px-4 py-3 text-[10px] font-black uppercase tracking-widest border-b-2 transition-all whitespace-nowrap ' + (currentTab === t.id ? 'border-blue-600 text-blue-700' : 'border-transparent text-slate-400 hover:text-slate-700')}
            >
              {t.label}
            </button>
          ))}
        </nav>
      )}

      {/* ── TOAST ── */}
      {notification && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm px-4">
          <div className={'px-5 py-3.5 rounded-xl shadow-2xl border text-xs font-bold flex items-center gap-3 ' + (notification.type === 'error' ? 'bg-red-50 border-red-300 text-red-700' : 'bg-green-50 border-green-300 text-green-700')}>
            {notification.msg}
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">

        {/* ── PORTAL SELECTION ── */}
        {!user && !portalType && (
          <div className="max-w-lg mx-auto mt-16">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden">
              <div className="bg-gradient-to-br from-blue-700 to-blue-900 px-8 py-10 text-center">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 overflow-hidden">
                  <img src="/logo.png" alt="LU" className="w-full h-full object-contain" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                </div>
                <h1 className="text-xl font-black text-white tracking-tight">Life Unbound Support</h1>
                <p className="text-blue-200 text-xs font-medium mt-1">Internal Operations Portal</p>
              </div>
              <div className="p-6 space-y-3">
                <p className="text-xs text-slate-500 text-center font-semibold mb-4">Select your workspace to continue</p>
                <button
                  onClick={() => setPortalType('staff')}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-xl text-sm uppercase tracking-wider shadow-md transition-all active:scale-95"
                >
                  Staff Workspace Portal
                </button>
                <button
                  onClick={() => setPortalType('admin')}
                  className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-4 px-6 rounded-xl text-sm uppercase tracking-wider shadow-md transition-all active:scale-95 border-2 border-slate-600"
                >
                  Director Admin Portal
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── LOGIN FORM ── */}
        {!user && portalType && (
          <div className="max-w-md mx-auto mt-12">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-8 space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h2 className="text-sm font-black uppercase tracking-wider text-blue-900">
                  {portalType === 'admin' ? 'Director Admin Login' : 'Staff Login'}
                </h2>
                <Btn variant="secondary" size="sm" onClick={() => setPortalType(null)}>Back</Btn>
              </div>
              <form onSubmit={handleLogin} className="space-y-4">
                <div><Label>Email Address</Label><Inp type="email" required placeholder="your@email.com" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} /></div>
                <div><Label>Password</Label><Inp type="password" required placeholder="........" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} disabled={loading} /></div>
                <Btn variant="primary" size="lg" className="w-full" disabled={loading}>{loading ? 'Signing in...' : 'Sign In'}</Btn>
              </form>
            </div>
          </div>
        )}

        {/* ── MAIN APP ── */}
        {user && (
          <div className="space-y-6">

            {/* ===== DASHBOARD ===== */}
            {currentTab === 'dashboard' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-black text-blue-900">Dashboard</h2>
                  <p className="text-xs text-slate-400">{'Welcome back, ' + (user.full_name || 'there').split(' ')[0] + '. Here is your overview.'}</p>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {user.role === 'director' ? (
                    <>
                      <StatCard label="Total Shifts"  value={shifts.length}                          accent="border-l-blue-500"   sub="All registered" />
                      <StatCard label="Filled Shifts" value={shifts.filter(s => s.staff_id).length}  accent="border-l-green-500"  sub="Assigned to staff" />
                      <StatCard label="Open Shifts"   value={unfilledShifts.length}                  accent="border-l-amber-500"  sub="Need assigning" />
                      <StatCard label="Staff Members" value={workers.length}                          accent="border-l-purple-500" sub="Active workers" />
                    </>
                  ) : (
                    <>
                      <StatCard label="My Shifts"    value={myShifts.length}                                                accent="border-l-blue-500"  sub="Assigned to me" />
                      <StatCard label="Open Shifts"  value={unfilledShifts.length}                                         accent="border-l-amber-500" sub="Available to claim" />
                      <StatCard label="Timesheets"   value={timesheetHistory.filter(t => t.workerId === user.id).length}   accent="border-l-green-500" sub="Submitted" />
                      <StatCard label="Participants" value={participants.length}                                            accent="border-l-slate-400" sub="In your network" />
                    </>
                  )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {user.role === 'director' && (
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex flex-col items-center">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 self-start">Shift Fill Rate</h4>
                      <ShiftsChart shifts={shifts} />
                      <div className="mt-3 w-full bg-slate-100 rounded-full h-2">
                        <div
                          className="bg-blue-600 rounded-full h-2 transition-all"
                          style={{ width: shifts.length ? (shifts.filter(s => s.staff_id).length / shifts.length * 100) + '%' : '0%' }}
                        />
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1.5">
                        {shifts.length ? Math.round(shifts.filter(s => s.staff_id).length / shifts.length * 100) : 0}{'% fill rate'}
                      </p>
                    </div>
                  )}
                  <div className={'bg-white rounded-xl border border-slate-200 shadow-sm p-5 ' + (user.role === 'director' ? 'lg:col-span-2' : 'lg:col-span-3')}>
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">This Week at a Glance</h4>
                    <div className="grid grid-cols-7 gap-1.5">
                      {DAYS.map(day => {
                        const dayShifts = shifts.filter(s => {
                          const match = user.role === 'support_worker' ? s.staff_id === user.id : true;
                          return WDAYS[new Date(s.start_time).getDay()] === day && match;
                        });
                        return (
                          <div key={day} className="bg-slate-50 border border-slate-200 rounded-lg p-1.5 min-h-[80px] flex flex-col">
                            <span className="text-[8px] font-black text-slate-400 uppercase text-center block mb-1">{day.slice(0, 3)}</span>
                            {dayShifts.slice(0, 3).map(s => (
                              <div key={s.id} className={'text-[7px] font-bold p-0.5 rounded border truncate mb-0.5 ' + (s.staff_id ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-amber-50 text-amber-700 border-amber-200')}>{s.title}</div>
                            ))}
                            {dayShifts.length === 0 && <span className="text-[8px] text-slate-300 text-center mt-2">-</span>}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">
                    {user.role === 'director' ? 'All Registered Shifts' : 'My Upcoming Shifts'}
                  </h4>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {(user.role === 'director' ? shifts : myShifts).slice(0, 12).map(s => (
                      <div key={s.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200 hover:bg-slate-100 transition-colors">
                        <div>
                          <span className="text-xs font-bold text-slate-800">{s.title}</span>
                          <span className="block text-[10px] text-slate-400">{fmt(s.start_time, { weekday:'short', day:'numeric', month:'short', year:'numeric' })} {fmtTime(s.start_time)} - {fmtTime(s.end_time)}</span>
                        </div>
                        <span className={'text-[9px] font-black px-2 py-1 rounded-lg border uppercase ' + (s.staff_id ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-amber-50 text-amber-700 border-amber-200')}>
                          {s.staff_id ? 'Filled' : 'Open'}
                        </span>
                      </div>
                    ))}
                    {(user.role === 'director' ? shifts : myShifts).length === 0 && (
                      <p className="text-xs text-slate-300 text-center py-6">No shifts yet.</p>
                    )}
                  </div>
                </div>

                {user.role === 'support_worker' && unfilledShifts.length > 0 && (
                  <div className="bg-white rounded-xl border border-amber-300 shadow-sm p-5">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-amber-600 mb-3">Open Shifts Available to Claim</h4>
                    <div className="space-y-2">
                      {unfilledShifts.slice(0, 6).map(s => (
                        <div key={s.id} className="flex items-center justify-between p-3 bg-amber-50 rounded-xl border border-amber-200">
                          <div>
                            <span className="text-xs font-bold text-slate-800">{s.title}</span>
                            <span className="block text-[10px] text-slate-500">{fmt(s.start_time, { weekday:'short', day:'numeric', month:'short' })} {fmtTime(s.start_time)} - {fmtTime(s.end_time)}</span>
                            {s.manager_directives && <span className="block text-[10px] text-slate-400 italic">{s.manager_directives}</span>}
                          </div>
                          <Btn variant="primary" size="sm" onClick={() => handleClaim(s.id)}>Claim</Btn>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ===== ADMIN CENTRE ===== */}
            {currentTab === 'director' && user.role === 'director' && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-lg font-black text-blue-900">Admin Centre</h2>
                  <p className="text-xs text-slate-400">Manage staff, participants, timesheets, and unfilled shifts.</p>
                </div>
                <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
                  {[
                    { id: 'workers',      label: 'Register Staff' },
                    { id: 'participants', label: 'Register Participant' },
                    { id: 'timesheets',   label: 'Timesheet Log (' + timesheetHistory.length + ')' },
                    { id: 'unfilled',     label: 'Unfilled Shifts (' + unfilledShifts.length + ')' },
                    { id: 'avail_log',    label: 'Availability Log (' + availSubmissions.length + ')' },
                  ].map(t => (
                    <button
                      key={t.id}
                      onClick={() => setAdminTab(t.id)}
                      className={'px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ' + (adminTab === t.id ? 'bg-blue-600 text-white shadow-sm' : 'bg-white border border-slate-200 text-slate-500 hover:text-slate-700')}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>

                {adminTab === 'workers' && (
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
                      <h3 className="text-xs font-black text-blue-900 uppercase tracking-wide">Create Support Worker Account</h3>
                      <form onSubmit={handleRegisterWorker} className="space-y-3">
                        <div><Label>Full Name</Label><Inp required value={wName} onChange={e => setWName(e.target.value)} placeholder="Jane Smith" /></div>
                        <div><Label>Email</Label><Inp type="email" required value={wEmail} onChange={e => setWEmail(e.target.value)} placeholder="jane@email.com" /></div>
                        <div><Label>Phone</Label><Inp value={wPhone} onChange={e => setWPhone(e.target.value)} placeholder="04xx xxx xxx" /></div>
                        <div><Label>Notes (optional)</Label><Txa rows={2} value={wNotes} onChange={e => setWNotes(e.target.value)} placeholder="Onboarding notes..." /></div>
                        <Btn variant="primary" size="md" className="w-full">Create Account</Btn>
                      </form>
                      {genPwd && (
                        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                          <p className="text-[9px] font-black text-green-700 uppercase tracking-wider mb-1">Generated Password - Share With Worker</p>
                          <p className="font-mono text-sm font-black text-green-900 bg-white border border-green-200 rounded-lg px-3 py-2">{genPwd}</p>
                        </div>
                      )}
                    </div>
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                      <h3 className="text-xs font-black text-blue-900 uppercase tracking-wide mb-4">{'Current Staff (' + workers.length + ')'}</h3>
                      {workers.length === 0 ? (
                        <p className="text-xs text-slate-300 text-center py-6">No staff registered yet.</p>
                      ) : (
                        <div className="space-y-2 max-h-80 overflow-y-auto">
                          {workers.map(w => (
                            <div key={w.id} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl">
                              <div>
                                <span className="text-xs font-bold text-slate-800">{w.full_name}</span>
                                <span className="block text-[10px] text-slate-400">{w.email}</span>
                              </div>
                              <span className="text-[9px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">Active</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {adminTab === 'participants' && (
                  <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 max-w-lg space-y-4">
                    <h3 className="text-xs font-black text-blue-900 uppercase tracking-wide">Register New Participant</h3>
                    <form onSubmit={handleRegisterParticipant} className="space-y-3">
                      <div><Label>Full Name</Label><Inp required value={pName} onChange={e => setPName(e.target.value)} placeholder="Participant full name" /></div>
                      <div><Label>NDIS Number</Label><Inp value={pNdis} onChange={e => setPNdis(e.target.value)} placeholder="430 000 000 0" /></div>
                      <Btn variant="primary" size="md" className="w-full">Register Participant</Btn>
                    </form>
                    <p className="text-[9px] text-slate-400">After registering, visit the Participants tab to add full profile details.</p>
                  </div>
                )}

                {adminTab === 'timesheets' && (
                  <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                      <h3 className="text-xs font-black text-blue-900 uppercase tracking-wide">Submitted Timesheets</h3>
                      <span className="text-[10px] text-slate-400 font-bold">{timesheetHistory.length + ' total'}</span>
                    </div>
                    {timesheetHistory.length === 0 ? (
                      <div className="p-12 text-center text-slate-300 text-xs">No timesheets submitted yet.</div>
                    ) : (
                      <div className="divide-y divide-slate-100">
                        {timesheetHistory.map(ts => (
                          <div key={ts.id} className="px-5 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                            <div>
                              <span className="text-xs font-bold text-slate-800">{ts.workerName}</span>
                              <span className="block text-[10px] text-slate-500">{ts.fortnightLabel}</span>
                              <span className="block text-[10px] text-slate-400">{((ts.rows && ts.rows.length) || 0) + ' shifts ' + DOT + ' ' + ts.totalHours + ' hrs ' + DOT + ' Submitted ' + ts.submittedAt}</span>
                            </div>
                            <Btn variant="secondary" size="sm" onClick={() => { setViewingTs(ts); setViewTsOpen(true); }}>View</Btn>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {adminTab === 'unfilled' && (
                  <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                      <h3 className="text-xs font-black text-blue-900 uppercase tracking-wide">Unfilled / Open Shifts</h3>
                      <span className="text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">{unfilledShifts.length + ' open'}</span>
                    </div>
                    {unfilledShifts.length === 0 ? (
                      <div className="p-12 text-center text-slate-300 text-xs">All shifts are currently filled.</div>
                    ) : (
                      <div className="divide-y divide-slate-100">
                        {unfilledShifts.map(s => (
                          <div key={s.id} className="px-5 py-4 flex items-center justify-between hover:bg-amber-50/30 transition-colors">
                            <div>
                              <span className="text-xs font-bold text-slate-800">{s.title}</span>
                              <span className="block text-[10px] text-slate-400">{fmt(s.start_time, { weekday:'short', day:'numeric', month:'long', year:'numeric' })} {fmtTime(s.start_time)} - {fmtTime(s.end_time)}</span>
                              {s.manager_directives && <span className="block text-[10px] text-slate-400 italic">{s.manager_directives}</span>}
                            </div>
                            <div className="flex gap-2 shrink-0">
                              <Btn variant="amber" size="sm" onClick={() => openAssign(s)}>Assign</Btn>
                              <Btn variant="secondary" size="sm" onClick={() => openEditShift(s)}>Edit</Btn>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {adminTab === 'avail_log' && (
                  <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="px-5 py-4 border-b border-slate-100 bg-slate-50">
                      <h3 className="text-xs font-black text-blue-900 uppercase tracking-wide">Staff Availability Submissions</h3>
                    </div>
                    {availSubmissions.length === 0 ? (
                      <div className="p-12 text-center text-slate-300 text-xs">No availability submissions yet.</div>
                    ) : (
                      <div className="divide-y divide-slate-100">
                        {availSubmissions.map((sub, i) => (
                          <div key={i} className="px-5 py-4">
                            <div className="mb-3">
                              <span className="text-xs font-bold text-slate-800">{sub.workerName}</span>
                              <span className="block text-[10px] text-slate-400">{sub.fortnightLabel + ' ' + DOT + ' Submitted ' + sub.submittedAt}</span>
                            </div>
                            <div className="grid grid-cols-7 gap-1">
                              {DAYS.map(day => {
                                const d = sub.matrix[day];
                                return (
                                  <div key={day} className={'rounded-lg p-1.5 text-center border ' + (d.mode === 'unavailable' ? 'bg-red-50 border-red-200' : d.mode === 'allday' ? 'bg-green-50 border-green-200' : 'bg-blue-50 border-blue-200')}>
                                    <span className="block text-[7px] font-black uppercase text-slate-500">{day.slice(0, 3)}</span>
                                    <span className={'block text-[8px] font-bold mt-0.5 ' + (d.mode === 'unavailable' ? 'text-red-500' : d.mode === 'allday' ? 'text-green-700' : 'text-blue-700')}>
                                      {d.mode === 'unavailable' ? 'Off' : d.mode === 'allday' ? 'All' : d.start || ''}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* ===== CALENDAR ===== */}
            {currentTab === 'rosters' && (
              <div className="space-y-5">
                <div className="flex items-start justify-between flex-wrap gap-3">
                  <div>
                    <h2 className="text-lg font-black text-blue-900">Calendar</h2>
                    <p className="text-xs text-slate-400">Click any shift to edit. Directors can create entries below.</p>
                  </div>
                  <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
                    {['day', 'week', 'month'].map(v => (
                      <button
                        key={v}
                        onClick={() => { setCalView(v); setCalOffset(0); }}
                        className={'px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all ' + (calView === v ? 'bg-blue-600 text-white shadow' : 'text-slate-500 hover:text-slate-800')}
                      >{v}</button>
                    ))}
                  </div>
                </div>

                {user.role === 'director' && (
                  <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">New Entry</span>
                      <div className="flex gap-1 bg-slate-100 rounded-lg p-0.5">
                        {['shift', 'event'].map(c => (
                          <button
                            key={c}
                            type="button"
                            onClick={() => setEvtCategory(c)}
                            className={'px-3 py-1 rounded-md text-[9px] font-black uppercase tracking-wider transition-all ' + (evtCategory === c ? 'bg-blue-600 text-white' : 'text-slate-500')}
                          >{c}</button>
                        ))}
                      </div>
                    </div>
                    <form onSubmit={handleCreateShift}>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        <div><Label>Title</Label><Inp required value={shiftTitle} onChange={e => setShiftTitle(e.target.value)} placeholder="e.g. Morning Support" /></div>
                        <div><Label>Date</Label><Inp type="date" required value={shiftDate} onChange={e => setShiftDate(e.target.value)} /></div>
                        <div><Label>Start Time</Label><Inp type="time" required value={shiftStart} onChange={e => setShiftStart(e.target.value)} /></div>
                        <div><Label>End Time</Label><Inp type="time" required value={shiftEnd} onChange={e => setShiftEnd(e.target.value)} /></div>
                        <div>
                          <Label>Allocation</Label>
                          <Sel value={allocType} onChange={e => setAllocType(e.target.value)}>
                            <option value="available">Open / Unassigned</option>
                            <option value="admin">Admin Internal</option>
                            <option value="staff">Assign to Staff</option>
                            <option value="participant">Assign to Participant</option>
                          </Sel>
                        </div>
                        {allocType === 'staff' && (
                          <div className="sm:col-span-2">
                            <Label>Select Workers</Label>
                            <div className="bg-slate-50 border border-slate-200 rounded-lg p-2 max-h-24 overflow-y-auto space-y-1">
                              {workers.map(w => (
                                <label key={w.id} className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 hover:text-blue-600">
                                  <input type="checkbox" checked={selWorkers.includes(w.id)} onChange={() => setSelWorkers(prev => prev.includes(w.id) ? prev.filter(x => x !== w.id) : [...prev, w.id])} className="rounded accent-blue-600" />
                                  {w.full_name}
                                </label>
                              ))}
                              {workers.length === 0 && <span className="text-[10px] text-slate-400">No staff registered yet.</span>}
                            </div>
                          </div>
                        )}
                        {allocType === 'participant' && (
                          <div className="sm:col-span-2">
                            <Label>Select Participants</Label>
                            <div className="bg-slate-50 border border-slate-200 rounded-lg p-2 max-h-24 overflow-y-auto space-y-1">
                              {participants.map(p => (
                                <label key={p.id} className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 hover:text-blue-600">
                                  <input type="checkbox" checked={selParticipants.includes(p.id)} onChange={() => setSelParticipants(prev => prev.includes(p.id) ? prev.filter(x => x !== p.id) : [...prev, p.id])} className="rounded accent-blue-600" />
                                  {p.name}
                                </label>
                              ))}
                            </div>
                          </div>
                        )}
                        <div className={allocType === 'staff' || allocType === 'participant' ? 'sm:col-span-2' : 'sm:col-span-3'}>
                          <Label>Manager Directives</Label>
                          <Inp value={shiftDirectives} onChange={e => setShiftDirectives(e.target.value)} placeholder="e.g. Bring medication logbook" />
                        </div>
                        <div className="flex items-end">
                          <Btn variant="primary" size="md" className="w-full">Publish</Btn>
                        </div>
                      </div>
                    </form>
                  </div>
                )}

                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                  <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
                    <Btn variant="secondary" size="sm" onClick={() => setCalOffset(calOffset - 1)}>Prev</Btn>
                    <span className="text-xs font-black uppercase tracking-widest text-blue-900 bg-white border border-slate-200 px-4 py-2 rounded-xl shadow-inner">{calHeader()}</span>
                    <Btn variant="secondary" size="sm" onClick={() => setCalOffset(calOffset + 1)}>Next</Btn>
                  </div>

                  {calView === 'month' && (() => {
                    const { year, month, offset, days } = getMonthGrid();
                    const gridCells = Math.ceil((offset + days) / 7) * 7;
                    return (
                      <div className="p-4">
                        <div className="grid grid-cols-7 gap-1 mb-2">
                          {DAYS.map(d => <div key={d} className="text-center text-[9px] font-black uppercase text-slate-400 tracking-widest py-1">{d.slice(0, 3)}</div>)}
                        </div>
                        <div className="grid grid-cols-7 gap-1">
                          {Array.from({ length: gridCells }).map((_, i) => {
                            const dayNum  = i - offset + 1;
                            const valid   = dayNum >= 1 && dayNum <= days;
                            const dShifts = valid ? shiftsOnDate(year, month, dayNum) : [];
                            const isToday = valid && new Date().getDate() === dayNum && new Date().getMonth() === month && new Date().getFullYear() === year;
                            return (
                              <div
                                key={i}
                                className={'rounded-xl border min-h-[80px] p-1.5 flex flex-col ' + (valid ? 'bg-white border-slate-200 hover:border-blue-300 transition-colors' : 'bg-slate-50/50 border-slate-100') + (isToday ? ' ring-2 ring-blue-400 border-blue-300' : '')}
                              >
                                {valid && (
                                  <>
                                    <span className={'text-[10px] font-bold text-right block mb-1 ' + (isToday ? 'text-blue-600 font-black' : 'text-slate-400')}>{dayNum}</span>
                                    <div className="space-y-0.5 flex-1 overflow-hidden">
                                      {dShifts.slice(0, 3).map(s => (
                                        <button
                                          key={s.id}
                                          onClick={() => openEditShift(s)}
                                          className={'w-full text-left text-[7px] font-bold px-1 py-0.5 rounded border truncate uppercase transition-opacity hover:opacity-70 ' + (s.staff_id ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-amber-50 text-amber-700 border-amber-200')}
                                        >{s.title}</button>
                                      ))}
                                      {dShifts.length > 3 && <span className="text-[7px] text-slate-400 font-bold pl-1">{'+' + (dShifts.length - 3) + ' more'}</span>}
                                    </div>
                                  </>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })()}

                  {calView === 'week' && (() => {
                    const weekDates = getWeekDates();
                    return (
                      <div className="p-4 grid grid-cols-7 gap-2 min-h-[260px]">
                        {weekDates.map((date, i) => {
                          const dShifts = shiftsOnDate(date.getFullYear(), date.getMonth(), date.getDate());
                          const isToday = date.toDateString() === new Date().toDateString();
                          return (
                            <div key={i} className={'rounded-xl border flex flex-col ' + (isToday ? 'border-blue-400 bg-blue-50/20' : 'border-slate-200 bg-white')}>
                              <div className={'text-center py-2 border-b ' + (isToday ? 'border-blue-300' : 'border-slate-100')}>
                                <span className="block text-[9px] font-black uppercase text-slate-400">{DAYS[i].slice(0, 3)}</span>
                                <span className={'text-sm font-black ' + (isToday ? 'text-blue-600' : 'text-slate-600')}>{date.getDate()}</span>
                              </div>
                              <div className="p-1.5 space-y-1 flex-1 overflow-y-auto">
                                {dShifts.map(s => (
                                  <button
                                    key={s.id}
                                    onClick={() => openEditShift(s)}
                                    className={'w-full text-left text-[8px] font-bold p-1.5 rounded-lg border transition-opacity hover:opacity-70 ' + (s.staff_id ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-amber-50 text-amber-700 border-amber-200')}
                                  >
                                    <span className="block truncate">{s.title}</span>
                                    <span className="block text-[7px] opacity-70">{fmtTime(s.start_time)}</span>
                                  </button>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}

                  {calView === 'day' && (() => {
                    const target  = new Date();
                    target.setDate(target.getDate() + calOffset);
                    const dShifts = shiftsOnDate(target.getFullYear(), target.getMonth(), target.getDate());
                    const hours   = Array.from({ length: 15 }, (_, i) => i + 7);
                    return (
                      <div className="p-4 divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
                        {hours.map(h => {
                          const hShifts = dShifts.filter(s => new Date(s.start_time).getHours() === h);
                          return (
                            <div key={h} className="py-3 flex gap-4 min-h-[52px]">
                              <span className="w-14 text-right text-[10px] font-bold text-blue-500 font-mono shrink-0 pt-0.5">{(h < 10 ? '0' + h : h) + ':00'}</span>
                              <div className="flex-1 space-y-1.5">
                                {hShifts.map(s => (
                                  <button
                                    key={s.id}
                                    onClick={() => openEditShift(s)}
                                    className={'w-full text-left p-3 rounded-xl border transition-all hover:shadow-md ' + (s.staff_id ? 'bg-blue-50 border-blue-200' : 'bg-amber-50 border-amber-200')}
                                  >
                                    <span className={'text-xs font-black ' + (s.staff_id ? 'text-blue-800' : 'text-amber-800')}>{s.title}</span>
                                    <span className="block text-[10px] text-slate-500 mt-0.5">{fmtTime(s.start_time) + ' - ' + fmtTime(s.end_time) + (s.manager_directives ? ' | ' + s.manager_directives : '')}</span>
                                  </button>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>
              </div>
            )}

            {/* ===== PARTICIPANT PROFILES ===== */}
            {currentTab === 'profiles' && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-lg font-black text-blue-900">Participant Profiles</h2>
                  <p className="text-xs text-slate-400">Click a participant to expand their full profile. Directors can edit all fields.</p>
                </div>
                {participants.length === 0 && (
                  <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-slate-300 text-xs">No participants registered yet.</div>
                )}
                <div className="space-y-3">
                  {participants.map(p => {
                    const ext    = getExt(p.id);
                    const isOpen = expandedPartId === p.id;
                    const isEdit = editingPartId  === p.id;
                    return (
                      <div key={p.id} className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                        <div
                          onClick={() => setExpandedPartId(isOpen ? null : p.id)}
                          className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors select-none"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-700 font-black text-sm shrink-0">{p.name ? p.name.charAt(0) : '?'}</div>
                            <div>
                              <span className="font-black text-sm text-slate-800">{p.name}</span>
                              <span className="block text-[10px] text-slate-400">{'NDIS: ' + (p.ndis_number || 'Not set') + (ext.dob ? ' | DOB: ' + ext.dob : '')}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {ext.medicalConditions && <span className="text-[9px] bg-red-50 border border-red-200 text-red-600 font-bold px-2 py-0.5 rounded-md uppercase hidden sm:block">Medical</span>}
                            <span className="text-[10px] font-black text-slate-400">{isOpen ? 'v' : '>'}</span>
                          </div>
                        </div>

                        {isOpen && !isEdit && (
                          <div className="border-t border-slate-100 p-5 space-y-5 bg-slate-50/30">
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                              {[
                                ['NDIS Number',   p.ndis_number || 'Not set'],
                                ['Date of Birth', ext.dob || 'Not set'],
                                ['Phone',         ext.phone || p.primary_contact_phone || 'Not set'],
                                ['Email',         ext.email || 'Not set'],
                                ['Address',       ext.address ? (ext.address + ', ' + (ext.suburb || '') + ' ' + (ext.state || '') + ' ' + (ext.postcode || '')).trim() : 'Not set'],
                                ['GP',            ext.gpName ? ext.gpName + (ext.gpPhone ? ' | ' + ext.gpPhone : '') : 'Not set'],
                              ].map(item => (
                                <div key={item[0]}>
                                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider mb-0.5">{item[0]}</p>
                                  <p className="text-xs font-bold text-slate-700">{item[1]}</p>
                                </div>
                              ))}
                            </div>
                            {ext.medicalConditions && (
                              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                                <p className="text-[9px] font-black text-red-600 uppercase tracking-wider mb-1">Medical Conditions</p>
                                <p className="text-xs text-red-800 whitespace-pre-wrap">{ext.medicalConditions}</p>
                              </div>
                            )}
                            {ext.medications && (
                              <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                                <p className="text-[9px] font-black text-orange-600 uppercase tracking-wider mb-1">Medications</p>
                                <p className="text-xs text-orange-800 whitespace-pre-wrap">{ext.medications}</p>
                              </div>
                            )}
                            {ext.allergies && (
                              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                                <p className="text-[9px] font-black text-yellow-700 uppercase tracking-wider mb-1">Allergies</p>
                                <p className="text-xs text-yellow-800 whitespace-pre-wrap">{ext.allergies}</p>
                              </div>
                            )}
                            {(ext.emergencyContacts || []).length > 0 && (
                              <div>
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider mb-2">Emergency Contacts</p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                  {ext.emergencyContacts.map((ec, i) => (
                                    <div key={i} className="bg-white border border-slate-200 rounded-xl p-3">
                                      <p className="text-xs font-bold text-slate-800">{ec.name || '-'}</p>
                                      <p className="text-[10px] text-slate-500">{ec.relationship + (ec.relationship && ec.phone ? ' | ' : '') + (ec.phone || '')}</p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            {ext.ndisGoals && (
                              <div>
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider mb-1">NDIS Goals</p>
                                <p className="text-xs text-slate-600 bg-white border border-slate-200 rounded-xl p-3 whitespace-pre-wrap">{ext.ndisGoals}</p>
                              </div>
                            )}
                            {ext.supportNeeds && (
                              <div>
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider mb-1">Support Needs and Notes</p>
                                <p className="text-xs text-slate-600 bg-white border border-slate-200 rounded-xl p-3 whitespace-pre-wrap">{ext.supportNeeds}</p>
                              </div>
                            )}
                            {(ext.files || []).length > 0 && (
                              <div>
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider mb-2">{'Attached Files (' + ext.files.length + ')'}</p>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                  {ext.files.map((f, i) => (
                                    <a key={i} href={f.data} download={f.name} className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl p-2.5 hover:bg-blue-50 hover:border-blue-300 transition-colors text-xs font-semibold text-slate-700 truncate">
                                      <span>{f.type && f.type.includes('pdf') ? 'PDF' : f.type && f.type.startsWith('image') ? 'IMG' : 'DOC'}</span>
                                      <span className="truncate">{f.name}</span>
                                    </a>
                                  ))}
                                </div>
                              </div>
                            )}
                            {user.role === 'director' && (
                              <Btn variant="secondary" size="sm" onClick={e => { e.stopPropagation(); setEditingPartId(p.id); }}>Edit Profile</Btn>
                            )}
                          </div>
                        )}

                        {isOpen && isEdit && (
                          <div className="border-t border-slate-100 p-5 space-y-5 bg-blue-50/20">
                            <p className="text-[10px] font-black uppercase tracking-widest text-blue-700">{'Editing: ' + p.name}</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                              <div><Label>Date of Birth</Label><Inp type="date" value={ext.dob || ''} onChange={e => setExtField(p.id, 'dob', e.target.value)} /></div>
                              <div><Label>Phone</Label><Inp value={ext.phone || ''} onChange={e => setExtField(p.id, 'phone', e.target.value)} placeholder="04xx xxx xxx" /></div>
                              <div><Label>Email</Label><Inp value={ext.email || ''} onChange={e => setExtField(p.id, 'email', e.target.value)} placeholder="email@example.com" /></div>
                              <div><Label>Street Address</Label><Inp value={ext.address || ''} onChange={e => setExtField(p.id, 'address', e.target.value)} placeholder="123 Example St" /></div>
                              <div><Label>Suburb</Label><Inp value={ext.suburb || ''} onChange={e => setExtField(p.id, 'suburb', e.target.value)} placeholder="Suburb" /></div>
                              <div className="grid grid-cols-2 gap-2">
                                <div><Label>State</Label><Inp value={ext.state || ''} onChange={e => setExtField(p.id, 'state', e.target.value)} placeholder="NSW" /></div>
                                <div><Label>Postcode</Label><Inp value={ext.postcode || ''} onChange={e => setExtField(p.id, 'postcode', e.target.value)} placeholder="2000" /></div>
                              </div>
                              <div><Label>GP Name</Label><Inp value={ext.gpName || ''} onChange={e => setExtField(p.id, 'gpName', e.target.value)} placeholder="Dr. Smith" /></div>
                              <div><Label>GP Phone</Label><Inp value={ext.gpPhone || ''} onChange={e => setExtField(p.id, 'gpPhone', e.target.value)} placeholder="02 xxxx xxxx" /></div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                              <div><Label>Medical Conditions</Label><Txa rows={4} value={ext.medicalConditions || ''} onChange={e => setExtField(p.id, 'medicalConditions', e.target.value)} placeholder="e.g. Epilepsy, Diabetes Type 2..." /></div>
                              <div><Label>Medications</Label><Txa rows={4} value={ext.medications || ''} onChange={e => setExtField(p.id, 'medications', e.target.value)} placeholder="Name, dose, frequency..." /></div>
                              <div><Label>Allergies</Label><Txa rows={4} value={ext.allergies || ''} onChange={e => setExtField(p.id, 'allergies', e.target.value)} placeholder="Food, medication, environmental..." /></div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div><Label>NDIS Goals</Label><Txa rows={4} value={ext.ndisGoals || ''} onChange={e => setExtField(p.id, 'ndisGoals', e.target.value)} placeholder="Goals as per NDIS plan..." /></div>
                              <div><Label>Support Needs and Notes</Label><Txa rows={4} value={ext.supportNeeds || ''} onChange={e => setExtField(p.id, 'supportNeeds', e.target.value)} placeholder="Important notes for support workers..." /></div>
                            </div>
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <Label>Emergency Contacts</Label>
                                <Btn variant="secondary" size="sm" type="button" onClick={() => setExtField(p.id, 'emergencyContacts', [...(ext.emergencyContacts || []), { name:'', relationship:'', phone:'' }])}>+ Add</Btn>
                              </div>
                              <div className="space-y-2">
                                {(ext.emergencyContacts || []).map((ec, i) => (
                                  <div key={i} className="grid grid-cols-3 gap-2 items-center bg-white border border-slate-200 rounded-xl p-3">
                                    <Inp placeholder="Full name" value={ec.name} onChange={ev => { const c = [...(ext.emergencyContacts || [])]; c[i] = { ...c[i], name: ev.target.value }; setExtField(p.id, 'emergencyContacts', c); }} />
                                    <Inp placeholder="Relationship" value={ec.relationship} onChange={ev => { const c = [...(ext.emergencyContacts || [])]; c[i] = { ...c[i], relationship: ev.target.value }; setExtField(p.id, 'emergencyContacts', c); }} />
                                    <div className="flex gap-2">
                                      <Inp placeholder="Phone" value={ec.phone} onChange={ev => { const c = [...(ext.emergencyContacts || [])]; c[i] = { ...c[i], phone: ev.target.value }; setExtField(p.id, 'emergencyContacts', c); }} />
                                      <button type="button" onClick={() => { const c = [...(ext.emergencyContacts || [])]; c.splice(i, 1); setExtField(p.id, 'emergencyContacts', c); }} className="text-red-400 hover:text-red-600 font-black text-lg shrink-0">{'×'}</button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                            <div>
                              <Label>Attach Files (reports, plans, photos)</Label>
                              <div
                                className="border-2 border-dashed border-slate-300 hover:border-blue-400 rounded-xl p-6 text-center transition-colors cursor-pointer bg-white"
                                onClick={() => { const el = document.getElementById('file-' + p.id); if (el) el.click(); }}
                              >
                                <input id={'file-' + p.id} type="file" multiple className="hidden" onChange={e => handleFileUpload(p.id, e)} accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.heic" />
                                <p className="text-xs text-slate-500 font-semibold">Click to upload files</p>
                                <p className="text-[9px] text-slate-400 mt-0.5">PDF, Word, Images accepted</p>
                              </div>
                              {(ext.files || []).length > 0 && (
                                <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-2">
                                  {ext.files.map((f, i) => (
                                    <div key={i} className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl p-2.5 gap-2">
                                      <span className="text-[10px] text-slate-700 font-semibold truncate">{f.name}</span>
                                      <button type="button" onClick={() => removeFile(p.id, i)} className="text-red-400 hover:text-red-600 shrink-0 font-black">{'×'}</button>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                            <div className="flex gap-2 pt-2">
                              <Btn variant="success" size="md" onClick={() => { setEditingPartId(null); toast('Profile saved.'); }}>Save Profile</Btn>
                              <Btn variant="secondary" size="md" onClick={() => setEditingPartId(null)}>Cancel</Btn>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ===== AVAILABILITY ===== */}
            {currentTab === 'availability' && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-lg font-black text-blue-900">Availability</h2>
                  <p className="text-xs text-slate-400">Submit your availability for the upcoming fortnight.</p>
                </div>
                <form onSubmit={handleSubmitAvail} className="bg-white border border-slate-200 rounded-xl p-6 space-y-5 shadow-sm max-w-2xl">
                  <div>
                    <Label>Select Fortnight</Label>
                    <Sel value={availFN} onChange={e => setAvailFN(e.target.value)} className="max-w-xs">
                      {fortnights.map(f => <option key={f.id} value={f.id}>{f.label}</option>)}
                    </Sel>
                  </div>
                  <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
                    {DAYS.map(day => {
                      const st = availDays[day];
                      return (
                        <div key={day} className={'p-4 flex flex-col sm:flex-row sm:items-center gap-3 transition-colors ' + (st.mode === 'unavailable' ? 'bg-red-50/40' : st.mode === 'allday' ? 'bg-green-50/40' : 'bg-white')}>
                          <span className="text-xs font-black uppercase tracking-wide text-slate-700 w-24 shrink-0">{day}</span>
                          <div className="flex gap-1.5 flex-wrap">
                            {[['standard','Hours'],['allday','All Day'],['unavailable','Unavailable']].map(item => {
                              const m = item[0]; const l = item[1];
                              return (
                                <button
                                  key={m}
                                  type="button"
                                  onClick={() => setAvailMode(day, m)}
                                  className={'px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider border transition-all ' + (st.mode === m ? (m === 'unavailable' ? 'bg-red-500 text-white border-red-500' : m === 'allday' ? 'bg-green-600 text-white border-green-600' : 'bg-blue-600 text-white border-blue-600') : 'bg-white border-slate-200 text-slate-500 hover:border-slate-400')}
                                >{l}</button>
                              );
                            })}
                          </div>
                          {st.mode === 'standard' && (
                            <div className="flex items-center gap-2">
                              <input type="time" value={st.start} onChange={e => { const u = { ...availDays }; u[day].start = e.target.value; setAvailDays(u); }} className="border border-slate-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-300" />
                              <span className="text-[9px] font-black text-slate-400">to</span>
                              <input type="time" value={st.end} onChange={e => { const u = { ...availDays }; u[day].end = e.target.value; setAvailDays(u); }} className="border border-slate-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-300" />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <Btn variant="primary" size="lg" className="w-full">Submit Availability</Btn>
                </form>
              </div>
            )}

            {/* ===== TIMESHEETS ===== */}
            {currentTab === 'timesheets' && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-lg font-black text-blue-900">Timesheet Submissions</h2>
                  <p className="text-xs text-slate-400">Log your hours for the fortnight. Add one row per shift worked.</p>
                </div>
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                  <div className="xl:col-span-2 bg-white border border-slate-200 rounded-xl p-6 space-y-4 shadow-sm">
                    <form onSubmit={handleSubmitTs} className="space-y-4">
                      <div>
                        <Label>Pay Period</Label>
                        <Sel value={selectedFN} onChange={e => setSelectedFN(e.target.value)} className="max-w-xs">
                          {fortnights.map(f => <option key={f.id} value={f.id}>{f.label}</option>)}
                        </Sel>
                      </div>
                      <div className="hidden lg:grid lg:grid-cols-12 gap-2 text-[9px] font-black uppercase text-slate-400 tracking-widest px-1 border-b border-slate-100 pb-2">
                        <div className="col-span-2">Date</div>
                        <div className="col-span-2">Start</div>
                        <div className="col-span-2">End</div>
                        <div className="col-span-3">Participant</div>
                        <div className="col-span-1">KM+c</div>
                        <div className="col-span-1">KM own</div>
                        <div className="col-span-1"></div>
                      </div>
                      <div className="space-y-2">
                        {tsRows.map((row, i) => (
                          <div key={i} className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2 lg:space-y-0 lg:grid lg:grid-cols-12 lg:gap-2 lg:items-start shadow-sm">
                            <div className="lg:col-span-2"><Inp type="date" required value={row.date} onChange={e => updateTs(i, 'date', e.target.value)} /></div>
                            <div className="lg:col-span-2"><Inp type="time" required value={row.start} onChange={e => updateTs(i, 'start', e.target.value)} /></div>
                            <div className="lg:col-span-2"><Inp type="time" required value={row.end} onChange={e => updateTs(i, 'end', e.target.value)} /></div>
                            <div className="lg:col-span-3">
                              <Sel required value={row.client} onChange={e => updateTs(i, 'client', e.target.value)}>
                                <option value="">Select participant</option>
                                {participants.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                              </Sel>
                            </div>
                            <div className="lg:col-span-1"><Inp type="number" min="0" value={row.kmWith} onChange={e => updateTs(i, 'kmWith', e.target.value)} placeholder="0" /></div>
                            <div className="lg:col-span-1"><Inp type="number" min="0" value={row.kmWithout} onChange={e => updateTs(i, 'kmWithout', e.target.value)} placeholder="0" /></div>
                            <div className="lg:col-span-1 flex items-start justify-end">
                              {tsRows.length > 1 && <button type="button" onClick={() => removeTsRow(i)} className="text-red-400 hover:text-red-600 font-black text-lg mt-0.5">{'×'}</button>}
                            </div>
                            <div className="lg:col-span-12">
                              <Inp required value={row.notes} onChange={e => updateTs(i, 'notes', e.target.value)} placeholder="Activity notes - what support did you provide?" />
                            </div>
                          </div>
                        ))}
                      </div>
                      <Btn variant="secondary" size="sm" type="button" onClick={addTsRow}>+ Add Shift Row</Btn>
                      <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-xl p-4">
                        <input type="checkbox" id="tsCheck" checked={tsVerified} onChange={e => setTsVerified(e.target.checked)} className="w-4 h-4 mt-0.5 accent-blue-600 rounded shrink-0" />
                        <label htmlFor="tsCheck" className="text-xs text-slate-600 font-medium cursor-pointer select-none">
                          I verify that all shift case notes have been officially recorded in the participant file, and the hours above are accurate and complete.
                        </label>
                      </div>
                      <Btn variant="primary" size="lg" className="w-full">Submit Timesheet</Btn>
                    </form>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm h-fit">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">My Past Submissions</h4>
                    {timesheetHistory.filter(t => t.workerId === user.id).length === 0 ? (
                      <p className="text-xs text-slate-300 text-center py-8">No previous submissions.</p>
                    ) : (
                      <div className="space-y-2 max-h-80 overflow-y-auto">
                        {timesheetHistory.filter(t => t.workerId === user.id).map(ts => (
                          <div
                            key={ts.id}
                            className="p-3 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
                            onClick={() => { setViewingTs(ts); setViewTsOpen(true); }}
                          >
                            <p className="text-xs font-bold text-slate-700">{ts.fortnightLabel}</p>
                            <p className="text-[10px] text-slate-400">{((ts.rows && ts.rows.length) || 0) + ' shifts ' + DOT + ' ' + ts.totalHours + ' hrs'}</p>
                            <p className="text-[9px] text-slate-400">{'Submitted ' + ts.submittedAt}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

          </div>
        )}
      </main>

      {/* ── EDIT SHIFT MODAL ── */}
      {editShiftOpen && editShift && (
        <Modal onClose={() => setEditShiftOpen(false)} title="Edit Shift">
          <div className="space-y-3">
            <div><Label>Title</Label><Inp value={editShift.title || ''} onChange={e => setEditShift({ ...editShift, title: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Start Date / Time</Label><Inp type="datetime-local" value={(editShift.start_time || '').slice(0, 16)} onChange={e => setEditShift({ ...editShift, start_time: e.target.value + ':00' })} /></div>
              <div><Label>End Date / Time</Label><Inp type="datetime-local" value={(editShift.end_time || '').slice(0, 16)} onChange={e => setEditShift({ ...editShift, end_time: e.target.value + ':00' })} /></div>
            </div>
            <div><Label>Manager Directives</Label><Txa rows={2} value={editShift.manager_directives || ''} onChange={e => setEditShift({ ...editShift, manager_directives: e.target.value })} /></div>
            {user.role === 'director' && (
              <div>
                <Label>Assigned Staff</Label>
                <Sel value={editShift.staff_id || ''} onChange={e => setEditShift({ ...editShift, staff_id: e.target.value || null, status: e.target.value ? 'scheduled' : 'available' })}>
                  <option value="">Unassigned (Open)</option>
                  {workers.map(w => <option key={w.id} value={w.id}>{w.full_name}</option>)}
                </Sel>
              </div>
            )}
            <div>
              <Label>Status</Label>
              <Sel value={editShift.status || 'available'} onChange={e => setEditShift({ ...editShift, status: e.target.value })}>
                <option value="available">Available / Open</option>
                <option value="scheduled">Scheduled</option>
                <option value="completed">Completed</option>
              </Sel>
            </div>
            <div className="flex gap-2 pt-2 flex-wrap">
              <Btn variant="primary" size="md" onClick={handleSaveShift}>Save Changes</Btn>
              <Btn variant="secondary" size="md" onClick={() => setEditShiftOpen(false)}>Cancel</Btn>
              {user.role === 'director' && <Btn variant="danger" size="md" className="ml-auto" onClick={handleDeleteShift}>Delete Shift</Btn>}
            </div>
          </div>
        </Modal>
      )}

      {/* ── ASSIGN SHIFT MODAL ── */}
      {assignOpen && assignTarget && (
        <Modal onClose={() => setAssignOpen(false)} title="Assign Shift to Worker">
          <div className="space-y-4">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <p className="text-xs font-black text-amber-800">{assignTarget.title}</p>
              <p className="text-[10px] text-amber-700">{fmt(assignTarget.start_time, { weekday:'long', day:'numeric', month:'long', year:'numeric' }) + ' ' + fmtTime(assignTarget.start_time) + ' - ' + fmtTime(assignTarget.end_time)}</p>
            </div>
            <div>
              <Label>Assign to Worker</Label>
              <Sel value={assignToId} onChange={e => setAssignToId(e.target.value)}>
                <option value="">Select a worker</option>
                {workers.map(w => <option key={w.id} value={w.id}>{w.full_name}</option>)}
              </Sel>
            </div>
            <div className="flex gap-2">
              <Btn variant="amber" size="md" onClick={handleAssign}>Assign Shift</Btn>
              <Btn variant="secondary" size="md" onClick={() => setAssignOpen(false)}>Cancel</Btn>
            </div>
          </div>
        </Modal>
      )}

      {/* ── VIEW TIMESHEET MODAL ── */}
      {viewTsOpen && viewingTs && (
        <Modal onClose={() => setViewTsOpen(false)} title="Timesheet Details" wide>
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                ['Worker',    viewingTs.workerName],
                ['Period',    viewingTs.fortnightLabel],
                ['Total Hrs', String(viewingTs.totalHours)],
                ['Submitted', viewingTs.submittedAt],
              ].map(item => (
                <div key={item[0]} className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center">
                  <p className="text-[9px] font-black uppercase text-slate-400 tracking-wider">{item[0]}</p>
                  <p className="text-sm font-black text-slate-800 mt-0.5 truncate">{item[1]}</p>
                </div>
              ))}
            </div>
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <div className="bg-slate-50 px-4 py-2.5 grid grid-cols-12 gap-2 text-[8px] font-black uppercase text-slate-400 tracking-widest border-b border-slate-200">
                <div className="col-span-2">Date</div>
                <div className="col-span-1">Start</div>
                <div className="col-span-1">End</div>
                <div className="col-span-2">Client</div>
                <div className="col-span-1">KM+c</div>
                <div className="col-span-1">KM</div>
                <div className="col-span-4">Notes</div>
              </div>
              <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
                {(viewingTs.rows || []).map((r, i) => (
                  <div key={i} className="px-4 py-3 grid grid-cols-12 gap-2 text-xs text-slate-700 hover:bg-slate-50 transition-colors">
                    <div className="col-span-2 font-medium">{r.date}</div>
                    <div className="col-span-1 font-mono">{r.start}</div>
                    <div className="col-span-1 font-mono">{r.end}</div>
                    <div className="col-span-2 font-semibold truncate">{r.client || '-'}</div>
                    <div className="col-span-1 text-center">{r.kmWith || 0}</div>
                    <div className="col-span-1 text-center">{r.kmWithout || 0}</div>
                    <div className="col-span-4 text-slate-500 text-[10px] break-words">{r.notes || '-'}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Modal>
      )}

    </div>
  );
}
