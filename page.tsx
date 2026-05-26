'use client'

import React, { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { 
  Calendar as CalendarIcon, 
  Users, 
  Clock, 
  FileText, 
  Sliders, 
  UserPlus, 
  Plus, 
  CheckCircle, 
  AlertTriangle, 
  LogOut, 
  ChevronLeft, 
  ChevronRight, 
  Info,
  Phone,
  File,
  ShieldAlert
} from 'lucide-react'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const supabase = createClient(supabaseUrl, supabaseAnonKey)

export default function LifeUnboundPortal() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [currentUser, setCurrentUser] = useState<any>(null)

  const [activeTab, setActiveTab] = useState('roster') 
  const [profiles, setProfiles] = useState<any[]>([])
  const [participants, setParticipants] = useState<any[]>([])
  const [shifts, setShifts] = useState<any[]>([])
  const [timesheets, setTimesheets] = useState<any[]>([])
  const [availabilities, setAvailabilities] = useState<any[]>([])

  const [calendarView, setCalendarView] = useState<'month' | 'week' | 'day'>('month')
  const [selectedParticipantId, setSelectedParticipantId] = useState('')
  const [selectedShift, setSelectedShift] = useState<any>(null)
  const [selectedParticipantProfile, setSelectedParticipantProfile] = useState<any>(null)

  const [newWorker, setNewWorker] = useState({ name: '', email: '', password: '', photo_url: '', admin_notes: '' })
  const [newParticipant, setNewParticipant] = useState({ name: '', ndis_number: '', photo_url: '', phone: '', emergency_name: '', emergency_phone: '', warning_notes: '', medical_needs: '', about_me: '', sharepoint_url: '' })
  const [newShift, setNewShift] = useState({ staff_id: '', participant_id: '', title: '', start_time: '2026-05-25T09:00', end_time: '2026-05-25T13:00', manager_directives: '' })
  const [showAddShiftModal, setShowAddShiftModal] = useState(false)
  const [newAvailability, setNewAvailability] = useState({ fortnight_starting: '2026-05-25', custom_start: '2026-05-25T09:00', custom_end: '2026-05-25T17:00', notes: '' })
  
  const [timesheetForm, setTimesheetForm] = useState({
    fortnight_starting: '2026-05-25',
    shift_description: '',
    ndis_support_category: '04_104_0125_6_1 - Access Community Social and Rec Activities',
    shift_location: '',
    start_time: '2026-05-25T09:00',
    end_time: '2026-05-25T13:00',
    kms_driven: 0,
    notes_completed: false,
    additional_notes: ''
  })
  const [timesheetHours, setTimesheetHours] = useState(4)
  const [timesheetSuccess, setTimesheetSuccess] = useState(false)
  const [isSubmittingTimesheet, setIsSubmittingTimesheet] = useState(false)

  useEffect(() => {
    if (isLoggedIn) {
      fetchCoreData()
    }
  }, [isLoggedIn])

  useEffect(() => {
    const start = new Date(timesheetForm.start_time)
    const end = new Date(timesheetForm.end_time)
    if (end > start) {
      const diffMs = end.getTime() - start.getTime()
      const diffHours = diffMs / (1000 * 60 * 60)
      setTimesheetHours(parseFloat(diffHours.toFixed(2)))
    } else {
      setTimesheetHours(0)
    }
  }, [timesheetForm.start_time, timesheetForm.end_time])

  const fetchCoreData = async () => {
    const { data: p } = await supabase.from('profiles').select('*')
    if (p) setProfiles(p)

    const { data: part } = await supabase.from('participants').select('*')
    if (part) {
      setParticipants(part)
      if (part.length > 0) setSelectedParticipantId(part[0].id)
    }

    const { data: sh } = await supabase.from('shifts').select('*').eq('is_archived', false)
    if (sh) setShifts(sh)

    const { data: ts } = await supabase.from('timesheets').select('*')
    if (ts) setTimesheets(ts)

    const { data: av } = await supabase.from('availabilities').select('*')
    if (av) setAvailabilities(av)
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError('')

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', loginEmail.trim())
      .eq('password_mock', loginPassword)
      .single()

    if (error || !data) {
      setLoginError('Invalid credentials. Please try again.')
    } else {
      setCurrentUser(data)
      setIsLoggedIn(true)
      setActiveTab(data.role === 'director' ? 'director' : 'roster')
    }
  }

  const handleSignOut = () => {
    setIsLoggedIn(false)
    setCurrentUser(null)
    setLoginEmail('')
    setLoginPassword('')
  }

  const handleAddWorker = async (e: React.FormEvent) => {
    e.preventDefault()
    await supabase.from('profiles').insert([{
      name: newWorker.name,
      email: newWorker.email,
      role: 'support_worker',
      password_mock: newWorker.password,
      photo_url: newWorker.photo_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      admin_notes: newWorker.admin_notes
    }])
    setNewWorker({ name: '', email: '', password: '', photo_url: '', admin_notes: '' })
    fetchCoreData()
  }

  const handleAddParticipant = async (e: React.FormEvent) => {
    e.preventDefault()
    await supabase.from('participants').insert([{
      name: newParticipant.name,
      ndis_number: newParticipant.ndis_number,
      photo_url: newParticipant.photo_url || 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
      primary_contact_phone: newParticipant.phone,
      emergency_contact_name: newParticipant.emergency_name,
      emergency_contact_phone: newParticipant.emergency_phone,
      warning_notes: newParticipant.warning_notes,
      medical_needs: newParticipant.medical_needs,
      about_me_notes: newParticipant.about_me,
      sharepoint_folder_url: newParticipant.sharepoint_url
    }])
    setNewParticipant({ name: '', ndis_number: '', photo_url: '', phone: '', emergency_name: '', emergency_phone: '', warning_notes: '', medical_needs: '', about_me: '', sharepoint_url: '' })
    fetchCoreData()
  }

  const handleCreateShift = async (e: React.FormEvent) => {
    e.preventDefault()
    await supabase.from('shifts').insert([{
      staff_id: newShift.staff_id,
      participant_id: newShift.participant_id,
      title: newShift.title,
      start_time: newShift.start_time,
      end_time: newShift.end_time,
      manager_directives: newShift.manager_directives,
      status: 'scheduled'
    }])
    setShowAddShiftModal(false)
    setNewShift({ staff_id: '', participant_id: '', title: '', start_time: '2026-05-25T09:00', end_time: '2026-05-25T13:00', manager_directives: '' })
    fetchCoreData()
  }

  const handleAddAvailability = async (e: React.FormEvent) => {
    e.preventDefault()
    await supabase.from('availabilities').insert([{
      staff_id: currentUser.id,
      fortnight_starting: newAvailability.fortnight_starting,
      custom_start_time: newAvailability.custom_start,
      custom_end_time: newAvailability.custom_end,
      notes: newAvailability.notes
    }])
    setNewAvailability({ fortnight_starting: '2026-05-25', custom_start: '2026-05-25T09:00', custom_end: '2026-05-25T17:00', notes: '' })
    fetchCoreData()
  }

  const handleSoftDeleteShift = async (shiftId: string) => {
    await supabase
      .from('shifts')
      .update({ is_archived: true, last_modified_by: currentUser.name })
      .eq('id', shiftId)
    setSelectedShift(null)
    fetchCoreData()
  }

  const handleSubmitTimesheet = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmittingTimesheet(true)

    const payload = {
      submitted_by: currentUser.id,
      fortnight_starting: timesheetForm.fortnight_starting,
      shift_description: timesheetForm.shift_description,
      ndis_support_category: timesheetForm.ndis_support_category,
      shift_location: timesheetForm.shift_location,
      start_time: timesheetForm.start_time,
      end_time: timesheetForm.end_time,
      kms_driven: timesheetForm.kms_driven,
      notes_completed: timesheetForm.notes_completed,
      additional_notes: timesheetForm.additional_notes
    }

    const { error } = await supabase.from('timesheets').insert([payload])

    if (!error) {
      try {
        await fetch('/api/send-timesheet', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            workerName: currentUser.name,
            fortnightStarting: timesheetForm.fortnight_starting,
            shiftDescription: timesheetForm.shift_description,
            supportCategory: timesheetForm.ndis_support_category,
            totalHours: timesheetHours,
            kmsDriven: timesheetForm.kms_driven,
            notesCompleted: timesheetForm.notes_completed ? 'Yes' : 'No'
          })
        })
      } catch (err) {
        console.error(err)
      }

      setTimesheetSuccess(true)
      setTimesheetForm({
        fortnight_starting: '2026-05-25',
        shift_description: '',
        ndis_support_category: '04_104_0125_6_1 - Access Community Social and Rec Activities',
        shift_location: '',
        start_time: '2026-05-25T09:00',
        end_time: '2026-05-25T13:00',
        kms_driven: 0,
        notes_completed: false,
        additional_notes: ''
      })
      fetchCoreData()
      setTimeout(() => setTimesheetSuccess(false), 5000)
    }
    setIsSubmittingTimesheet(false)
  }

  const visibleShifts = currentUser?.role === 'director' 
    ? shifts 
    : shifts.filter(s => s.staff_id === currentUser?.id)

  const formatDateLabel = (isoString: string) => {
    const d = new Date(isoString)
    return d.toLocaleDateString('en-AU', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4 text-slate-700">
        <div className="bg-white p-8 rounded-2xl shadow-sm max-w-md w-full border border-sky-100 text-center">
          <div className="flex justify-center mb-4">
            <img src="/logo.png" alt="Life Unbound Support Logo" className="h-12 object-contain" />
          </div>
          <h1 className="text-xl font-bold text-slate-800 mb-1">Welcome to Life Unbound</h1>
          <p className="text-xs text-slate-400 mb-6">Internal Staff Portal & Verification Gate</p>
          
          {loginError && (
            <div className="bg-red-50 text-red-600 text-xs p-3 rounded-xl mb-4 border border-red-100 text-left flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4 text-left">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 mb-1">EMAIL ADDRESS</label>
              <input 
                type="email" 
                required
                className="w-full bg-slate-50 border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-sky-300"
                placeholder="name@lifeunboundsupport.com.au"
                value={loginEmail}
                onChange={e => setLoginEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 mb-1">PASSWORD</label>
              <input 
                type="password" 
                required
                className="w-full bg-slate-50 border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-sky-300"
                placeholder="••••••••"
                value={loginPassword}
                onChange={e => setLoginPassword(e.target.value)}
              />
            </div>
            <button type="submit" className="w-full bg-sky-500 hover:bg-sky-600 text-white font-semibold py-3 rounded-xl text-sm transition-colors shadow-sm mt-2">
              Sign In to Dashboard
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-600 flex flex-col">
      <header className="bg-white border-b border-slate-100 px-6 py-3 flex justify-between items-center sticky top-0 z-40 shadow-sm">
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="Life Unbound Support Logo" className="h-10 object-contain" />
          <span className="font-bold text-slate-800 text-base tracking-tight hidden sm:inline">Life Unbound Support</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right text-xs">
            <p className="font-bold text-slate-800">{currentUser?.name}</p>
            <p className="font-bold text-sky-500 uppercase tracking-wider">{currentUser?.role.replace('_', ' ')}</p>
          </div>
          <button onClick={handleSignOut} className="p-2 hover:bg-slate-50 text-slate-400 hover:text-slate-600 rounded-xl transition-colors">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      <nav className="bg-white border-b border-slate-200 overflow-x-auto flex px-4">
        {currentUser?.role === 'director' && (
          <button onClick={() => setActiveTab('director')} className={`px-4 py-3.5 font-semibold text-xs flex items-center gap-1.5 border-b-2 whitespace-nowrap transition-all ${activeTab === 'director' ? 'border-sky-500 text-sky-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}><Sliders className="w-4 h-4" /> Director Suite</button>
        )}
        <button onClick={() => setActiveTab('roster')} className={`px-4 py-3.5 font-semibold text-xs flex items-center gap-1.5 border-b-2 whitespace-nowrap transition-all ${activeTab === 'roster' ? 'border-sky-500 text-sky-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}><CalendarIcon className="w-4 h-4" /> Master Roster</button>
        <button onClick={() => setActiveTab('participants')} className={`px-4 py-3.5 font-semibold text-xs flex items-center gap-1.5 border-b-2 whitespace-nowrap transition-all ${activeTab === 'participants' ? 'border-sky-500 text-sky-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}><Users className="w-4 h-4" /> Client Profiles</button>
        <button onClick={() => setActiveTab('availability')} className={`px-4 py-3.5 font-semibold text-xs flex items-center gap-1.5 border-b-2 whitespace-nowrap transition-all ${activeTab === 'availability' ? 'border-sky-500 text-sky-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}><Clock className="w-4 h-4" /> My Availability</button>
        <button onClick={() => setActiveTab('timesheet')} className={`px-4 py-3.5 font-semibold text-xs flex items-center gap-1.5 border-b-2 whitespace-nowrap transition-all ${activeTab === 'timesheet' ? 'border-sky-500 text-sky-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}><FileText className="w-4 h-4" /> Submit Timesheet</button>
      </nav>

      <main className="flex-1 p-6 max-w-7xl w-full mx-auto space-y-6">

        {activeTab === 'director' && currentUser?.role === 'director' && (
          <div className="space-y-6">
            <div className="bg-sky-50 border border-sky-100 p-4 rounded-2xl flex items-start gap-3">
              <Info className="w-4 h-4 text-sky-500 shrink-0 mt-0.5" />
              <p className="text-xs text-sky-800 leading-relaxed">
                <strong>Director Control Panel:</strong> Use these simple cards to provision employee access logins, register participant data blocks, or verify submitted timesheets.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                <h2 className="text-sm font-bold text-slate-800 flex items-center gap-1.5 border-b pb-3"><UserPlus className="w-4 h-4 text-sky-500" /> Add Team Member</h2>
                <form onSubmit={handleAddWorker} className="space-y-3">
                  <input type="text" placeholder="Full Name" required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs" value={newWorker.name} onChange={e=>setNewWorker({...newWorker, name: e.target.value})} />
                  <input type="email" placeholder="Email Address" required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs" value={newWorker.email} onChange={e=>setNewWorker({...newWorker, email: e.target.value})} />
                  <input type="password" placeholder="Temporary Password" required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs" value={newWorker.password} onChange={e=>setNewWorker({...newWorker, password: e.target.value})} />
                  <input type="text" placeholder="Photo Link / URL Path" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs" value={newWorker.photo_url} onChange={e=>setNewWorker({...newWorker, photo_url: e.target.value})} />
                  <textarea placeholder="Private Internal Notes" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs h-16" value={newWorker.admin_notes} onChange={e=>setNewWorker({...newWorker, admin_notes: e.target.value})} />
                  <button type="submit" className="w-full bg-sky-500 hover:bg-sky-600 text-white font-semibold py-2.5 rounded-xl text-xs transition-colors">Register Employee</button>
                </form>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                <h2 className="text-sm font-bold text-slate-800 flex items-center gap-1.5 border-b pb-3"><UserPlus className="w-4 h-4 text-sky-500" /> Register Participant</h2>
                <form onSubmit={handleAddParticipant} className="space-y-3 max-h-[340px] overflow-y-auto pr-1">
                  <input type="text" placeholder="Participant Full Name" required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs" value={newParticipant.name} onChange={e=>setNewParticipant({...newParticipant, name: e.target.value})} />
                  <input type="text" placeholder="NDIS Number" required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs" value={newParticipant.ndis_number} onChange={e=>setNewParticipant({...newParticipant, ndis_number: e.target.value})} />
                  <input type="text" placeholder="Contact Phone Number" required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs" value={newParticipant.phone} onChange={e=>setNewParticipant({...newParticipant, phone: e.target.value})} />
                  <div className="grid grid-cols-2 gap-2">
                    <input type="text" placeholder="Emergency Name" className="w-full bg-slate-50 border rounded-xl px-3 py-2 text-xs" value={newParticipant.emergency_name} onChange={e=>setNewParticipant({...newParticipant, emergency_name: e.target.value})} />
                    <input type="text" placeholder="Emergency Phone" className="w-full bg-slate-50 border rounded-xl px-3 py-2 text-xs" value={newParticipant.emergency_phone} onChange={e=>setNewParticipant({...newParticipant, emergency_phone: e.target.value})} />
                  </div>
                  <input type="text" placeholder="🚨 Warnings / Behavioral Considerations" className="w-full border-amber-200 bg-amber-50/50 rounded-xl px-4 py-2.5 text-xs text-amber-900 placeholder-amber-600" value={newParticipant.warning_notes} onChange={e=>setNewParticipant({...newParticipant, warning_notes: e.target.value})} />
                  <textarea placeholder="Medical Profiles & Physical Needs" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs h-14" value={newParticipant.medical_needs} onChange={e=>setNewParticipant({...newParticipant, medical_needs: e.target.value})} />
                  <input type="text" placeholder="SharePoint Folder URL Link" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs" value={newParticipant.sharepoint_url} onChange={e=>setNewParticipant({...newParticipant, sharepoint_url: e.target.value})} />
                  <button type="submit" className="w-full bg-sky-500 hover:bg-sky-600 text-white font-semibold py-2.5 rounded-xl text-xs transition-colors">Save Participant</button>
                </form>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
              <h2 className="text-sm font-bold text-slate-800 flex items-center gap-1.5 border-b pb-3"><FileText className="w-4 h-4 text-sky-500" /> Timesheets Awaiting Audit</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 font-bold bg-slate-50/60">
                      <th className="p-3">SUPPORT WORKER</th>
                      <th className="p-3">DESCRIPTION & SCOPE</th>
                      <th className="p-3">METRICS CLAIMED</th>
                      <th className="p-3 text-center">CRM NOTES</th>
                      <th className="p-3 text-center">ACTION</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {timesheets.length === 0 ? (
                      <tr><td colSpan={5} className="p-4 text-center text-slate-400 italic">No submitted timesheets to audit currently.</td></tr>
                    ) : (
                      timesheets.map((ts: any) => (
                        <tr key={ts.id} className="hover:bg-slate-50/40">
                          <td className="p-3 font-semibold text-slate-800">{profiles.find(p=>p.id===ts.submitted_by)?.name || 'Team Member'}</td>
                          <td className="p-3">
                            <p className="font-semibold text-slate-700">{ts.shift_description}</p>
                            <p className="text-[10px] text-slate-400 font-medium">{ts.shift_location}</p>
                          </td>
                          <td className="p-3 font-medium text-slate-700">Hours: 4.00 <span className="block text-[10px] text-slate-400">Travel: {ts.kms_driven} km</span></td>
                          <td className="p-3 text-center">
                            <span className={`px-2.5 py-0.5 rounded-full font-semibold border ${ts.notes_completed ? 'bg-green-50 text-green-600 border-green-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>{ts.notes_completed ? 'Verified' : 'Missing'}</span>
                          </td>
                          <td className="p-3 text-center flex justify-center gap-1.5">
                            <button onClick={async () => { await supabase.from('timesheets').delete().eq('id', ts.id); fetchCoreData(); }} className="bg-green-500 hover:bg-green-600 text-white font-bold px-3 py-1 rounded-lg">Approve</button>
                            <button onClick={async () => { await supabase.from('timesheets').delete().eq('id', ts.id); fetchCoreData(); }} className="bg-slate-100 hover:bg-red-50 hover:text-red-600 text-slate-500 font-bold px-3 py-1 rounded-lg">Reject</button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'roster' && (
          <div className="space-y-6">
            <div className="bg-sky-50 border border-sky-100 p-4 rounded-2xl flex items-start gap-3">
              <Info className="w-4 h-4 text-sky-500 shrink-0 mt-0.5" />
              <p className="text-xs text-sky-800 leading-relaxed">
                <strong>Roster Calendar:</strong> View upcoming shifts here. Click any shift card to see specific details or launch your external Microsoft Shift Notes form.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
              <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border">
                <button onClick={() => setCalendarView('month')} className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${calendarView === 'month' ? 'bg-white text-sky-600 shadow-sm border' : 'text-slate-400 hover:text-slate-600'}`}>Month</button>
                <button onClick={() => setCalendarView('week')} className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${calendarView === 'week' ? 'bg-white text-sky-600 shadow-sm border' : 'text-slate-400 hover:text-slate-600'}`}>Week</button>
                <button onClick={() => setCalendarView('day')} className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${calendarView === 'day' ? 'bg-white text-sky-600 shadow-sm border' : 'text-slate-400 hover:text-slate-600'}`}>Day</button>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                <span className="text-xs font-bold text-slate-700 font-mono">May 2026</span>
                {currentUser?.role === 'director' && (
                  <button onClick={() => setShowAddShiftModal(true)} className="bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1 shadow-sm"><Plus className="w-3.5 h-3.5" /> Add Shift</button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm lg:col-span-2 space-y-4">
                <div className="grid grid-cols-7 text-center text-[10px] font-bold text-slate-400 border-b pb-2">
                  <span>MON</span><span>TUE</span><span>WED</span><span>THU</span><span>FRI</span><span>SAT</span><span>SUN</span>
                </div>
                <div className="grid grid-cols-7 gap-1.5 text-sm font-medium">
                  {Array.from({ length: 24 }).map((_, i) => (
                    <div key={i} className="p-2 bg-slate-50/30 rounded-xl text-slate-300 min-h-[50px] text-left text-[10px] font-mono">{i + 1}</div>
                  ))}
                  <div className="p-2 bg-sky-50/50 border border-sky-200 rounded-xl min-h-[80px] text-left relative flex flex-col justify-between">
                    <span className="text-[10px] font-bold text-sky-600 font-mono">25 May</span>
                    <div className="space-y-1 mt-1">
                      {visibleShifts.map((s: any) => (
                        <div key={s.id} onClick={() => setSelectedShift(s)} className="bg-white p-1 border border-sky-100 rounded-md text-[10px] font-bold text-slate-700 shadow-sm cursor-pointer hover:bg-sky-100 truncate">
                          👤 {participants.find(p=>p.id===s.participant_id)?.name || 'Client'}
                        </div>
                      ))}
                    </div>
                  </div>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="p-2 bg-slate-50/30 rounded-xl text-slate-300 min-h-[50px] text-left text-[10px] font-mono">{26 + i}</div>
                  ))}
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b pb-2">Inspector Detail Pane</h3>
                {selectedShift ? (
                  <div className="space-y-4 text-xs">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-0.5">SHIFT ASSIGNMENT</label>
                      <p className="text-sm font-bold text-slate-800">{selectedShift.title}</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1.5">
                      <p className="text-slate-600 font-medium"><strong>Client:</strong> {participants.find(p=>p.id===selectedShift.participant_id)?.name}</p>
                      <p className="text-slate-600 font-medium"><strong>Worker:</strong> {profiles.find(w=>w.id===selectedShift.staff_id)?.name}</p>
                      <p className="text-slate-400 font-mono text-[10px] mt-1">{formatDateLabel(selectedShift.start_time)}</p>
                    </div>

                    <div className="bg-amber-50/70 border border-amber-200 p-3 rounded-xl space-y-1">
                      <h4 className="font-bold text-amber-800 flex items-center gap-1"><ShieldAlert className="w-3.5 h-3.5 text-amber-600" /> Manager Instructions</h4>
                      <p className="text-amber-900 font-medium leading-relaxed">{selectedShift.manager_directives || "No unique directions recorded."}</p>
                    </div>

                    <button onClick={() => window.open('https://forms.office.com', '_blank')} className="w-full bg-sky-500 hover:bg-sky-600 text-white font-bold py-2.5 rounded-xl text-center shadow-sm">
                      📝 Open Microsoft Shift Notes Form
                    </button>

                    {currentUser?.role === 'director' && (
                      <button onClick={() => handleSoftDeleteShift(selectedShift.id)} className="w-full bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-500 border rounded-xl py-2 font-semibold">
                        Cancel & Soft-Archive Shift
                      </button>
                    )}
                  </div>
                ) : (
                  <p className="text-slate-400 italic text-center py-12">Click a scheduled shift card to pull parameters.</p>
                )}
              </div>
            </div>

            {showAddShiftModal && (
              <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs flex justify-center items-center p-4 z-50">
                <div className="bg-white p-6 rounded-2xl shadow-lg max-w-sm w-full border text-xs space-y-3">
                  <h3 className="text-sm font-bold text-slate-800 border-b pb-2">Schedule Care Shift</h3>
                  <form onSubmit={handleCreateShift} className="space-y-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1">SELECT EMPLOYEE</label>
                      <select required className="w-full bg-slate-50 border rounded-xl px-2.5 py-2" value={newShift.staff_id} onChange={e=>setNewShift({...newShift, staff_id: e.target.value})}>
                        <option value="">-- Choose Worker --</option>
                        {profiles.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1">CHOOSE PARTICIPANT</label>
                      <select required className="w-full bg-slate-50 border rounded-xl px-2.5 py-2" value={newShift.participant_id} onChange={e=>setNewShift({...newShift, participant_id: e.target.value})}>
                        <option value="">-- Choose Client --</option>
                        {participants.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                      </select>
                    </div>
                    <input type="text" placeholder="Shift Objective Title" required className="w-full bg-slate-50 border rounded-xl px-3 py-2" value={newShift.title} onChange={e=>setNewShift({...newShift, title: e.target.value})} />
                    <div className="grid grid-cols-2 gap-2">
                      <input type="datetime-local" required className="w-full bg-slate-50 border rounded-xl p-2" value={newShift.start_time} onChange={e=>setNewShift({...newShift, start_time: e.target.value})} />
                      <input type="datetime-local" required className="w-full bg-slate-50 border rounded-xl p-2" value={newShift.end_time} onChange={e=>setNewShift({...newShift, end_time: e.target.value})} />
                    </div>
                    <textarea placeholder="Type operational directives here..." className="w-full border-amber-200 bg-amber-50/30 text-amber-900 rounded-xl p-2 h-16" value={newShift.manager_directives} onChange={e=>setNewShift({...newShift, manager_directives: e.target.value})} />
                    <div className="flex gap-2 border-t pt-2 mt-3">
                      <button type="submit" className="flex-1 bg-sky-500 text-white font-bold py-2 rounded-xl">Commit</button>
                      <button type="button" onClick={() => setShowAddShiftModal(false)} className="flex-1 bg-slate-100 text-slate-600 font-bold py-2 rounded-xl">Dismiss</button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'participants' && (
          <div className="space-y-6">
            <div className="bg-sky-50 border border-sky-100 p-4 rounded-2xl flex items-start gap-3">
              <Info className="w-4 h-4 text-sky-500 shrink-0 mt-0.5" />
              <p className="text-xs text-sky-800 leading-relaxed">
                <strong>Client Profiles:</strong> Select a participant from the list to reveal details and files.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-3">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b pb-2">Client Matrix</h3>
                <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                  {participants.map((p: any) => (
                    <div key={p.id} onClick={()=>{setSelectedParticipantProfile(p); setSelectedParticipantId(p.id);}} className={`p-2.5 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${selectedParticipantId === p.id ? 'border-sky-300 bg-sky-50/20' : 'border-slate-100 hover:bg-slate-50'}`}>
                      <img src={p.photo_url} className="w-8 h-8 rounded-full object-cover border" alt="" />
                      <div>
                        <p className="font-bold text-slate-800 text-xs">{p.name}</p>
                        <p className="font-mono text-[9px] text-slate-400">NDIS: {p.ndis_number}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm lg:col-span-2 space-y-4 text-xs">
                {selectedParticipantProfile ? (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center border-b pb-3 flex-wrap gap-2">
                      <div className="flex items-center gap-3">
                        <img src={selectedParticipantProfile.photo_url} className="w-12 h-12 rounded-xl object-cover border shadow-sm" alt="" />
                        <div>
                          <h3 className="text-base font-bold text-slate-800">{selectedParticipantProfile.name}</h3>
                          <span className="font-mono bg-slate-100 px-2 py-0.5 text-[9px] font-semibold text-slate-500 rounded-md">REF: {selectedParticipantProfile.ndis_number}</span>
                        </div>
                      </div>
                      {selectedParticipantProfile.sharepoint_folder_url && (
                        <button onClick={() => window.open(selectedParticipantProfile.sharepoint_folder_url, '_blank')} className="bg-slate-50 hover:bg-sky-50 border hover:text-sky-600 font-bold px-3 py-2 rounded-xl flex items-center gap-1"><File className="w-3.5 h-3.5 text-sky-500" /> Documents Folder</button>
                      )}
                    </div>

                    {selectedParticipantProfile.warning_notes && (
                      <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl flex items-start gap-2.5 text-amber-900">
                        <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
                        <div>
                          <h4 className="font-bold text-amber-800 uppercase tracking-wide text-[10px]">🚨 Medical Trigger Warning Profile</h4>
                          <p className="font-medium mt-0.5">{selectedParticipantProfile.warning_notes}</p>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="bg-slate-50/50 border p-3 rounded-xl space-y-1">
                        <h4 className="font-bold text-slate-400 uppercase tracking-wider text-[9px]">Contact & Logistics</h4>
                        <p className="font-semibold text-slate-700 flex items-center gap-1"><Phone className="w-3 h-3 text-slate-400" /> {selectedParticipantProfile.primary_contact_phone}</p>
                        <p className="text-[10px] text-slate-500 border-t pt-1 mt-1"><strong>Next of Kin:</strong> {selectedParticipantProfile.emergency_contact_name} ({selectedParticipantProfile.emergency_contact_phone})</p>
                      </div>
                      <div className="bg-slate-50/50 border p-3 rounded-xl">
                        <h4 className="font-bold text-slate-400 uppercase tracking-wider text-[9px] mb-1">Clinical Assessment Data</h4>
                        <p className="text-slate-600 leading-relaxed font-medium">{selectedParticipantProfile.medical_needs || "No requirements recorded."}</p>
                      </div>
                    </div>

                    <div className="border p-3 rounded-xl bg-white">
                      <h4 className="font-bold text-slate-400 uppercase tracking-wider text-[9px] mb-1">About Me Choices</h4>
                      <p className="text-slate-600 leading-relaxed font-medium">{selectedParticipantProfile.about_me_notes || "No data recorded."}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-slate-400 italic text-center py-20">Select a client record row from the left sidebar.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'availability' && (
          <div className="space-y-6">
            <div className="bg-sky-50 border border-sky-100 p-4 rounded-2xl flex items-start gap-3">
              <Info className="w-4 h-4 text-sky-500 shrink-0 mt-0.5" />
              <p className="text-xs text-sky-800 leading-relaxed">
                <strong>Log Availability:</strong> Select your target fortnight option and enter custom availability ranges.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-3 h-fit">
                <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1 border-b pb-2"><Clock className="w-4 h-4 text-sky-500" /> Log Time Blocks</h3>
                <form onSubmit={handleAddAvailability} className="space-y-3">
                  <select className="w-full bg-slate-50 border rounded-xl p-2.5" value={newAvailability.fortnight_starting} onChange={e=>setNewAvailability({...newAvailability, fortnight_starting: e.target.value})}>
                    <option value="2026-05-25">Fortnight Starting: Mon 25th May 2026</option>
                    <option value="2026-06-08">Fortnight Starting: Mon 8th June 2026</option>
                  </select>
                  <input type="datetime-local" required className="w-full bg-slate-50 border rounded-xl p-2" value={newAvailability.custom_start} onChange={e=>setNewAvailability({...newAvailability, custom_start: e.target.value})} />
                  <input type="datetime-local" required className="w-full bg-slate-50 border rounded-xl p-2" value={newAvailability.custom_end} onChange={e=>setNewAvailability({...newAvailability, custom_end: e.target.value})} />
                  <input type="text" placeholder="Custom note descriptions" className="w-full bg-slate-50 border rounded-xl p-2.5" value={newAvailability.notes} onChange={e=>setNewAvailability({...newAvailability, notes: e.target.value})} />
                  <button type="submit" className="w-full bg-sky-500 font-bold text-white py-2.5 rounded-xl shadow-sm">Publish Block</button>
                </form>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm md:col-span-2 space-y-3">
                <h3 className="text-xs font-bold text-slate-800 border-b pb-2">Your Published Availability Blocks</h3>
                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                  {availabilities.filter(a=>a.staff_id===currentUser.id).length === 0 ? (
                    <p className="text-slate-400 italic text-center py-8">No availability logs registered.</p>
                  ) : (
                    availabilities.filter(a=>a.staff_id===currentUser.id).map((a: any) => (
                      <div key={a.id} className="bg-slate-50 border p-3 rounded-xl flex justify-between items-center">
                        <div>
                          <p className="font-bold text-slate-800">Available Custom Block</p>
                          <p className="text-[10px] text-slate-400 mt-0.5 font-mono">Fortnight: {a.fortnight_starting}</p>
                        </div>
                        <span className="bg-white border text-sky-600 font-mono font-bold px-2.5 py-1 rounded-lg text-[10px]">Logged</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'timesheet' && (
          <div className="space-y-6">
            <div className="bg-sky-50 border border-sky-100 p-4 rounded-2xl flex items-start gap-3">
              <Info className="w-4 h-4 text-sky-500 shrink-0 mt-0.5" />
              <p className="text-xs text-sky-800 leading-relaxed">
                <strong>Timesheet Form:</strong> Input your shift parameters immediately following work to process your hours.
              </p>
            </div>

            <div className="max-w-xl mx-auto bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-5 text-xs">
              <h2 className="text-sm font-bold text-slate-800 border-b pb-2 flex items-center gap-1.5"><FileText className="w-4 h-4 text-sky-500" /> Fortnightly Shift Log Submission Form</h2>
              
              {timesheetSuccess && (
                <div className="bg-green-50 border border-green-200 text-green-700 p-3 rounded-xl font-semibold flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4" /> Timesheet submission recorded successfully!
                </div>
              )}

              <form onSubmit={handleSubmitTimesheet} className="space-y-3.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1">SELECT PAYROLL FORTNIGHT</label>
                    <select className="w-full bg-slate-50 border rounded-xl px-2.5 py-2" value={timesheetForm.fortnight_starting} onChange={e=>setTimesheetForm({...timesheetForm, fortnight_starting: e.target.value})}>
                      <option value="2026-05-25">Fortnight Starting: Mon 25th May 2026</option>
                      <option value="2026-06-08">Fortnight Starting: Mon 8th June 2026</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1">SHIFT PARAMETER / LOCATION</label>
                    <input type="text" required placeholder="E.g., Shellharbour Support" className="w-full bg-slate-50 border rounded-xl px-3 py-2" value={timesheetForm.shift_description} onChange={e=>setTimesheetForm({...timesheetForm, shift_description: e.target.value})} />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1">MANDATORY NDIS SUPPORT CODES</label>
                  <select className="w-full bg-slate-50 border rounded-xl px-2.5 py-2" value={timesheetForm.ndis_support_category} onChange={e=>setTimesheetForm({...timesheetForm, ndis_support_category: e.target.value})}>
                    <option value="04_104_0125_6_1 - Access Community Social and Rec Activities">04_104_0125_6_1 - Access Community (Standard Weekday Rate)</option>
                    <option value="04_105_0125_6_1 - Access Community Social and Rec Activities - Saturday">04_105_0125_6_1 - Access Community (Saturday Extension Rate)</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <input type="datetime-local" required className="w-full bg-slate-50 border rounded-xl p-2" value={timesheetForm.start_time} onChange={e=>setTimesheetForm({...timesheetForm, start_time: e.target.value})} />
                  <input type="datetime-local" required className="w-full bg-slate-50 border rounded-xl p-2" value={timesheetForm.end_time} onChange={e=>setTimesheetForm({...timesheetForm, end_time: e.target.value})} />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                  <input type="number" required placeholder="Kilometres Driven with Client" className="w-full bg-slate-50 border rounded-xl px-3 py-2" value={timesheetForm.kms_driven} onChange={e=>setTimesheetForm({...timesheetForm, kms_driven: parseInt(e.target.value) || 0})} />
                  <div>
                    {timesheetForm.kms_driven > 200 && (
                      <span className="text-amber-600 font-medium bg-amber-50 border border-amber-100 p-2 rounded-xl block">⚠️ Double-check travel distance metrics value.</span>
                    )}
                  </div>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center gap-2.5">
                  <input type="checkbox" id="noteConfirm" className="w-4 h-4 text-sky-500 rounded cursor-pointer" checked={timesheetForm.notes_completed} onChange={e=>setTimesheetForm({...timesheetForm, notes_completed: e.target.checked})} />
                  <label htmlFor="noteConfirm" className="font-bold text-slate-700 cursor-pointer select-none">I verify shift records are submitted inside CRM Form.</label>
                </div>

                <textarea placeholder="Type operational feedback here..." className="w-full bg-slate-50 border rounded-xl p-2.5 h-16" value={timesheetForm.additional_notes} onChange={e=>setTimesheetForm({...timesheetForm, additional_notes: e.target.value})} />
                
                <div className="border-t pt-3 flex justify-between items-center gap-2 flex-wrap">
                  <span className="font-bold bg-sky-50 text-sky-700 border px-3 py-1.5 rounded-lg font-mono">Calculated Duration: {timesheetHours} Hrs</span>
                  <button type="submit" disabled={isSubmittingTimesheet || timesheetHours <= 0} className="bg-sky-500 hover:bg-sky-600 disabled:bg-slate-200 text-white font-bold px-5 py-2 rounded-xl shadow-sm">
                    {isSubmittingTimesheet ? 'Routing...' : 'Submit Log'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </main>

      <footer className="bg-white border-t p-4 text-center text-[10px] text-slate-400">
        © 2026 Life Unbound Support Workspace. Immutable NDIS Log Archive Registry.
      </footer>
    </div>
  )
}
