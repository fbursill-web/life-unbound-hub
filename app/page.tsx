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
      .eq('password_mock', loginPassword.trim())

    if (error || !data || data.length === 0) {
      setLoginError('Invalid credentials. Please try again.')
    } else {
      const user = data[0]
      setCurrentUser(user)
      setIsLoggedIn(true)
      setActiveTab(user.role === 'director' ? 'director' : 'roster')
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
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8fafc', padding: '16px', fontFamily: 'sans-serif', color: '#334155' }}>
        <div style={{ backgroundColor: '#ffffff', padding: '32px', borderRadius: '16px', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)', maxWidth: '400px', width: '100%', border: '1px solid #e0f2fe', textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
            <img src="/logo.png" alt="Life Unbound Support Logo" style={{ height: '48px', objectFit: 'contain' }} onError={(e) => { e.currentTarget.style.display = 'none' }} />
          </div>
          <h1 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1e293b', marginBottom: '4px' }}>Welcome to Life Unbound</h1>
          <p style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '24px' }}>Internal Staff Portal & Verification Gate</p>
          
          {loginError && (
            <div style={{ backgroundColor: '#fef2f2', color: '#dc2626', fontSize: '12px', padding: '12px', borderRadius: '12px', marginBottom: '16px', border: '1px solid #fee2e2', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertTriangle style={{ width: '16px', height: '16px', flexShrink: 0 }} />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '10px', fontWeight: 'bold', color: '#94a3b8', marginBottom: '4px', letterSpacing: '0.05em' }}>EMAIL ADDRESS</label>
              <input 
                type="email" 
                required
                style={{ width: '100%', backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '12px', padding: '12px', fontSize: '14px', boxSizing: 'border-box' }}
                placeholder="name@lifeunboundsupport.com.au"
                value={loginEmail}
                onChange={e => setLoginEmail(e.target.value)}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '10px', fontWeight: 'bold', color: '#94a3b8', marginBottom: '4px', letterSpacing: '0.05em' }}>PASSWORD</label>
              <input 
                type="password" 
                required
                style={{ width: '100%', backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '12px', padding: '12px', fontSize: '14px', boxSizing: 'border-box' }}
                placeholder="••••••••"
                value={loginPassword}
                onChange={e => setLoginPassword(e.target.value)}
              />
            </div>
            <button type="submit" style={{ width: '100%', backgroundColor: '#0ea5e9', color: '#ffffff', fontWeight: '600', padding: '12px', borderRadius: '12px', fontSize: '14px', border: 'none', cursor: 'pointer', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', marginTop: '8px' }}>
              Sign In to Dashboard
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: 'sans-serif', color: '#475569', display: 'flex', flexDirection: 'column' }}>
      <header style={{ backgroundColor: '#ffffff', borderBottom: '1px solid #f1f5f9', padding: '12px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', sticky: 'top', zIndex: 40, boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <img src="/logo.png" alt="Life Unbound Support Logo" style={{ height: '40px', objectFit: 'contain' }} />
          <span style={{ fontWeight: 'bold', color: '#1e293b', fontSize: '16px', letterSpacing: '-0.025em' }}>Life Unbound Support</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ textAlign: 'right', fontSize: '12px' }}>
            <p style={{ fontWeight: 'bold', color: '#1e293b', margin: 0 }}>{currentUser?.name}</p>
            <p style={{ fontWeight: 'bold', color: '#0ea5e9', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{currentUser?.role.replace('_', ' ')}</p>
          </div>
          <button onClick={handleSignOut} style={{ padding: '8px', backgroundColor: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
            <LogOut style={{ width: '16px', height: '16px' }} />
          </button>
        </div>
      </header>

      <nav style={{ backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0', display: 'flex', gap: '16px', padding: '0 24px', overflowX: 'auto' }}>
        {currentUser?.role === 'director' && (
          <button onClick={() => setActiveTab('director')} style={{ padding: '14px 16px', fontWeight: '600', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px', border: 'none', borderBottom: activeTab === 'director' ? '2px solid #0ea5e9' : '2px solid transparent', color: activeTab === 'director' ? '#0ea5e9' : '#94a3b8', backgroundColor: 'transparent', cursor: 'pointer' }}><Sliders style={{ width: '16px', height: '16px' }} /> Director Suite</button>
        )}
        <button onClick={() => setActiveTab('roster')} style={{ padding: '14px 16px', fontWeight: '600', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px', border: 'none', borderBottom: activeTab === 'roster' ? '2px solid #0ea5e9' : '2px solid transparent', color: activeTab === 'roster' ? '#0ea5e9' : '#94a3b8', backgroundColor: 'transparent', cursor: 'pointer' }}><CalendarIcon style={{ width: '16px', height: '16px' }} /> Master Roster</button>
        <button onClick={() => setActiveTab('participants')} style={{ padding: '14px 16px', fontWeight: '600', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px', border: 'none', borderBottom: activeTab === 'participants' ? '2px solid #0ea5e9' : '2px solid transparent', color: activeTab === 'participants' ? '#0ea5e9' : '#94a3b8', backgroundColor: 'transparent', cursor: 'pointer' }}><Users style={{ width: '16px', height: '16px' }} /> Client Profiles</button>
        <button onClick={() => setActiveTab('availability')} style={{ padding: '14px 16px', fontWeight: '600', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px', border: 'none', borderBottom: activeTab === 'availability' ? '2px solid #0ea5e9' : '2px solid transparent', color: activeTab === 'availability' ? '#0ea5e9' : '#94a3b8', backgroundColor: 'transparent', cursor: 'pointer' }}><Clock style={{ width: '16px', height: '16px' }} /> My Availability</button>
        <button onClick={() => setActiveTab('timesheet')} style={{ padding: '14px 16px', fontWeight: '600', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px', border: 'none', borderBottom: activeTab === 'timesheet' ? '2px solid #0ea5e9' : '2px solid transparent', color: activeTab === 'timesheet' ? '#0ea5e9' : '#94a3b8', backgroundColor: 'transparent', cursor: 'pointer' }}><FileText style={{ width: '16px', height: '16px' }} /> Submit Timesheet</button>
      </nav>

      <main style={{ flex: 1, padding: '24px', maxWidth: '1280px', width: '100%', margin: '0 auto', boxSizing: 'border-box' }}>
        {activeTab === 'director' && currentUser?.role === 'director' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ backgroundColor: '#f0f9ff', border: '1px solid #e0f2fe', padding: '16px', borderRadius: '16px', display: 'flex', gap: '12px' }}>
              <Info style={{ width: '16px', height: '16px', color: '#0ea5e9', flexShrink: 0, marginTop: '2px' }} />
              <p style={{ margin: 0, fontSize: '12px', color: '#0369a1', lineHeight: '1.6' }}>
                <strong>Director Control Panel:</strong> Provision team log access gates, update participant database rows, and audit digital support worker invoices.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
              <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '16px', border: '1px solid #f1f5f9', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}>
                <h2 style={{ fontSize: '14px', fontWeight: 'bold', color: '#1e293b', margin: '0 0 16px 0', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}><UserPlus style={{ width: '16px', height: '16px', color: '#0ea5e9' }} /> Register Support Worker</h2>
                <form onSubmit={handleAddWorker} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <input type="text" placeholder="Worker Full Name" required style={{ width: '100%', padding: '10px', fontSize: '12px', border: '1px solid #e2e8f0', borderRadius: '12px', backgroundColor: '#f8fafc', boxSizing: 'border-box' }} value={newWorker.name} onChange={e=>setNewWorker({...newWorker, name: e.target.value})} />
                  <input type="email" placeholder="Email Address" required style={{ width: '100%', padding: '10px', fontSize: '12px', border: '1px solid #e2e8f0', borderRadius: '12px', backgroundColor: '#f8fafc', boxSizing: 'border-box' }} value={newWorker.email} onChange={e=>setNewWorker({...newWorker, email: e.target.value})} />
                  <input type="password" placeholder="Roster Login Password" required style={{ width: '100%', padding: '10px', fontSize: '12px', border: '1px solid #e2e8f0', borderRadius: '12px', backgroundColor: '#f8fafc', boxSizing: 'border-box' }} value={newWorker.password} onChange={e=>setNewWorker({...newWorker, password: e.target.value})} />
                  <button type="submit" style={{ width: '100%', backgroundColor: '#0ea5e9', color: '#ffffff', padding: '10px', fontSize: '12px', fontWeight: 'bold', border: 'none', borderRadius: '12px', cursor: 'pointer' }}>Commit User Access</button>
                </form>
              </div>

              <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '16px', border: '1px solid #f1f5f9', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}>
                <h2 style={{ fontSize: '14px', fontWeight: 'bold', color: '#1e293b', margin: '0 0 16px 0', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}><UserPlus style={{ width: '16px', height: '16px', color: '#0ea5e9' }} /> Register Participant</h2>
                <form onSubmit={handleAddParticipant} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <input type="text" placeholder="Participant Name" required style={{ width: '100%', padding: '10px', fontSize: '12px', border: '1px solid #e2e8f0', borderRadius: '12px', backgroundColor: '#f8fafc', boxSizing: 'border-box' }} value={newParticipant.name} onChange={e=>setNewParticipant({...newParticipant, name: e.target.value})} />
                  <input type="text" placeholder="NDIS Reference Number" required style={{ width: '100%', padding: '10px', fontSize: '12px', border: '1px solid #e2e8f0', borderRadius: '12px', backgroundColor: '#f8fafc', boxSizing: 'border-box' }} value={newParticipant.ndis_number} onChange={e=>setNewParticipant({...newParticipant, ndis_number: e.target.value})} />
                  <button type="submit" style={{ width: '100%', backgroundColor: '#0ea5e9', color: '#ffffff', padding: '10px', fontSize: '12px', fontWeight: 'bold', border: 'none', borderRadius: '12px', cursor: 'pointer' }}>Save Participant File</button>
                </form>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'roster' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#ffffff', padding: '16px', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
              <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#1e293b' }}>Roster Schedule Matrix</span>
              {currentUser?.role === 'director' && (
                <button onClick={() => setShowAddShiftModal(true)} style={{ backgroundColor: '#0ea5e9', color: '#ffffff', fontWeight: 'bold', fontSize: '12px', padding: '8px 16px', border: 'none', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}><Plus style={{ width: '14px', height: '14px' }} /> Add Shift</button>
              )}
            </div>

            <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '16px', border: '1px solid #f1f5f9', minHeight: '200px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <p style={{ color: '#94a3b8', fontSize: '12px', fontStyle: 'italic' }}>No active roster shifts scheduled for this current fortnight template cycle.</p>
            </div>
          </div>
        )}

        {activeTab === 'participants' && (
          <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
            <h2 style={{ fontSize: '14px', fontWeight: 'bold', color: '#1e293b', marginBottom: '16px' }}>Active Participant Matrix Profiles</h2>
            <p style={{ color: '#94a3b8', fontSize: '12px', fontStyle: 'italic' }}>Please add a participant via the director suite tab to generate clinical rows.</p>
          </div>
        )}

        {activeTab === 'availability' && (
          <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
            <h2 style={{ fontSize: '14px', fontWeight: 'bold', color: '#1e293b', marginBottom: '16px' }}>Roster Availability Logger</h2>
            <p style={{ color: '#94a3b8', fontSize: '12px', fontStyle: 'italic' }}>Roster blocks are currently locked by administration.</p>
          </div>
        )}

        {activeTab === 'timesheet' && (
          <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '16px', border: '1px solid #f1f5f9', maxWidth: '600px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '14px', fontWeight: 'bold', color: '#1e293b', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px', marginBottom: '16px' }}>Submit Care Roster Shift Log</h2>
            <p style={{ color: '#94a3b8', fontSize: '12px', fontStyle: 'italic' }}>Timesheet logic will initialize as soon as clients are registered.</p>
          </div>
        )}
      </main>

      <footer style={{ backgroundColor: '#ffffff', borderTop: '1px solid #e2e8f0', padding: '16px', textAlign: 'center', fontSize: '10px', color: '#94a3b8' }}>
        © 2026 Life Unbound Support Workspace. Immutable NDIS Log Archive Registry.
      </footer>
    </div>
  )
}
