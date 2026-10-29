import { useState, useEffect } from 'react'
import axios from 'axios'

const DEPT_API = 'http://localhost:8081/api/departments'
const RESOURCE_API = 'http://localhost:8081/api/resources'
const AUTH_API = 'http://localhost:8081/api/auth'

// All styles live here so no separate CSS file is needed
const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Figtree:wght@400;500;600;700&display=swap');

.tdb {
  --ink: #14213d; --ink-soft: #55607a; --paper: #f6f7fb; --card: #fff; --line: #e1e5ee;
  --accent: #3347d9; --accent-dark: #2636ad; --video: #c8301f;
  --ok: #15803d; --warn: #b45309; --warn-tint: #fef3c7; --danger: #b91c1c;
  font-family: 'Figtree', 'Segoe UI', system-ui, sans-serif;
  color: var(--ink); background: var(--paper); min-height: 100vh;
  padding: 16px 16px 56px; box-sizing: border-box;
}
.tdb *, .tdb *::before, .tdb *::after { box-sizing: border-box; }
.tdb__inner { max-width: 1100px; margin: 0 auto; }

/* Tabs */
.tdb__tabs {
  display: flex; gap: 6px; background: var(--ink); padding: 8px;
  border-radius: 10px; margin-bottom: 20px; overflow-x: auto;
  -webkit-overflow-scrolling: touch; scrollbar-width: none;
}
.tdb__tabs::-webkit-scrollbar { display: none; }
.tdb__tab {
  flex: 1 0 auto; min-height: 44px; padding: 0 18px; border: 0; border-radius: 8px;
  background: transparent; color: #c5cde3; font: inherit; font-weight: 600;
  font-size: 0.92rem; cursor: pointer; white-space: nowrap;
}
.tdb__tab:hover { background: rgba(255,255,255,0.08); }
.tdb__tab[aria-selected='true'] { background: var(--accent); color: #fff; }

/* Panels */
.tdb__panel {
  background: var(--card); border: 1px solid var(--line);
  border-radius: 10px; padding: 18px;
}
.tdb__h2 { margin: 0 0 14px; font-size: 1.15rem; font-weight: 700; }
.tdb__h3 { margin: 28px 0 12px; font-size: 1.05rem; font-weight: 700; }
.tdb__head-row {
  display: flex; flex-wrap: wrap; gap: 10px;
  align-items: center; justify-content: space-between; margin-bottom: 16px;
}
.tdb__head-row .tdb__h2 { margin: 0; }
.tdb__pill {
  background: #e9edff; color: var(--accent-dark); padding: 6px 14px;
  border-radius: 999px; font-size: 0.85rem; font-weight: 700;
}

/* Forms */
.tdb__form {
  display: grid; gap: 14px; background: var(--paper);
  border: 1px solid var(--line); border-radius: 10px; padding: 16px;
}
.tdb__form--dept { grid-template-columns: 1fr; }
.tdb__field { display: flex; flex-direction: column; gap: 6px; min-width: 0; }
.tdb__label { font-size: 0.8rem; font-weight: 600; color: var(--ink-soft); }
.tdb__input, .tdb__select {
  width: 100%; min-height: 44px; padding: 10px 12px; border: 1px solid #c9d0de;
  border-radius: 8px; background: #fff; color: var(--ink); font: inherit; font-size: 1rem;
}
.tdb__input[type='file'] { padding: 9px 12px; background: #fff; }
.tdb__form-actions { display: flex; gap: 8px; align-items: end; }
.tdb__form-actions .tdb__btn { flex: 1; }

.tdb__input:focus-visible, .tdb__select:focus-visible, .tdb__btn:focus-visible,
.tdb__tab:focus-visible, .tdb__a:focus-visible {
  outline: 3px solid rgba(51, 71, 217, 0.4); outline-offset: 2px;
}

/* Buttons */
.tdb__btn {
  display: inline-flex; align-items: center; justify-content: center;
  min-height: 44px; padding: 0 16px; border: 0; border-radius: 8px;
  font: inherit; font-size: 0.92rem; font-weight: 600; color: #fff;
  background: var(--accent); cursor: pointer; transition: background-color .15s ease;
}
.tdb__btn:hover { background: var(--accent-dark); }
.tdb__btn--ok { background: var(--ok); }
.tdb__btn--ok:hover { background: #116530; }
.tdb__btn--ghost { background: #fff; color: var(--ink); border: 1px solid #c9d0de; }
.tdb__btn--ghost:hover { background: var(--paper); }
.tdb__btn--edit { background: var(--warn-tint); color: var(--warn); border: 1px solid #f3d98b; }
.tdb__btn--edit:hover { background: #fde9a2; }
.tdb__btn--delete { background: #fff; color: var(--danger); border: 1px solid #f1b9b9; }
.tdb__btn--delete:hover { background: #fdeeee; }
.tdb__btn--danger { background: var(--danger); }
.tdb__btn--danger:hover { background: #991b1b; }
.tdb__btn--sm { min-height: 40px; padding: 0 12px; font-size: 0.85rem; }

.tdb__a { font-weight: 600; text-decoration: none; }
.tdb__a--file { color: var(--accent); }
.tdb__a--video { color: var(--video); }
.tdb__a:hover { text-decoration: underline; }

/* Tables */
.tdb__table-wrap { border: 1px solid var(--line); border-radius: 10px; overflow: hidden; }
.tdb__table { width: 100%; border-collapse: collapse; background: #fff; }
.tdb__table th {
  background: #eef1f7; text-align: left; padding: 12px 14px;
  font-size: 0.8rem; font-weight: 700; color: var(--ink-soft);
}
.tdb__table td { padding: 12px 14px; border-top: 1px solid var(--line); vertical-align: middle; }
.tdb__row-actions { display: flex; gap: 8px; flex-wrap: wrap; }
.tdb__inline-edit { display: flex; gap: 6px; flex-wrap: wrap; }
.tdb__inline-edit .tdb__input { min-height: 40px; flex: 1 1 160px; }

.tdb__status {
  display: inline-block; padding: 4px 10px; border-radius: 6px;
  font-size: 0.8rem; font-weight: 700; background: #dcfce7; color: #15803d;
}
.tdb__status--blocked { background: #fee2e2; color: #b91c1c; }

.tdb__empty { padding: 32px 16px; text-align: center; color: var(--ink-soft); }

/* Toast */
.tdb__toast {
  position: fixed; left: 16px; right: 16px; z-index: 60;
  bottom: calc(16px + env(safe-area-inset-bottom, 0px));
  padding: 14px 16px; border-radius: 10px; background: var(--ink); color: #fff;
  font-weight: 600; font-size: 0.95rem; border-left: 5px solid var(--ok);
  box-shadow: 0 8px 24px rgba(20,33,61,.25);
}
.tdb__toast--error { border-left-color: #ef4444; }

/* Dialog */
.tdb__overlay {
  position: fixed; inset: 0; z-index: 50; background: rgba(20,33,61,.55);
  display: flex; align-items: flex-end; justify-content: center;
}
.tdb__dialog {
  width: 100%; background: #fff; border-radius: 16px 16px 0 0;
  padding: 24px 20px calc(20px + env(safe-area-inset-bottom, 0px));
}
.tdb__dialog h2 { margin: 0 0 8px; font-size: 1.15rem; }
.tdb__dialog p { margin: 0 0 16px; color: var(--ink-soft); line-height: 1.5; overflow-wrap: anywhere; }
.tdb__dialog-actions { display: flex; flex-direction: column-reverse; gap: 10px; margin-top: 16px; }

/* Mobile: tables become stacked cards */
@media (max-width: 719px) {
  .tdb__table-wrap { border: 0; border-radius: 0; overflow: visible; }
  .tdb__table, .tdb__table tbody, .tdb__table tr, .tdb__table td { display: block; width: 100%; }
  .tdb__table thead { display: none; }
  .tdb__table tr {
    background: #fff; border: 1px solid var(--line); border-radius: 10px;
    padding: 6px 14px; margin-bottom: 12px;
  }
  .tdb__table td {
    display: flex; justify-content: space-between; align-items: center; gap: 16px;
    padding: 9px 0; border-top: 1px solid #f0f2f7; text-align: right; overflow-wrap: anywhere;
  }
  .tdb__table td:first-child { border-top: 0; }
  .tdb__table td::before {
    content: attr(data-label); flex: 0 0 auto; font-size: 0.78rem;
    font-weight: 700; color: var(--ink-soft); text-align: left;
  }
  .tdb__table td.tdb__cell-actions { display: block; padding-top: 12px; }
  .tdb__table td.tdb__cell-actions::before { content: none; }
  .tdb__row-actions .tdb__btn { flex: 1; }
  .tdb__inline-edit { justify-content: flex-end; width: 100%; }
  .tdb__empty-row td { display: block; text-align: center; }
  .tdb__empty-row td::before { content: none; }
}

/* Tablet & up */
@media (min-width: 640px) {
  .tdb { padding: 28px 24px 64px; }
  .tdb__panel { padding: 24px; }
  .tdb__form { grid-template-columns: 1fr 1fr; padding: 20px; }
  .tdb__form .tdb__field--wide, .tdb__form .tdb__submit-wide { grid-column: 1 / -1; }
  .tdb__form--dept { grid-template-columns: 2fr 1fr 1fr; }
  .tdb__form--dept .tdb__form-actions { grid-column: 1 / -1; }
  .tdb__toast { left: auto; right: 24px; max-width: 380px; }
  .tdb__overlay { align-items: center; padding: 16px; }
  .tdb__dialog { max-width: 420px; border-radius: 14px; padding: 24px; }
  .tdb__dialog-actions { flex-direction: row; justify-content: flex-end; }
}
@media (min-width: 1024px) {
  .tdb__form--dept { grid-template-columns: 2fr 1fr 1fr auto; }
  .tdb__form--dept .tdb__form-actions { grid-column: auto; }
}
@media (prefers-reduced-motion: reduce) { .tdb__btn { transition: none; } }
`

function TeacherDashboard() {
  const [activeTab, setActiveTab] = useState('resources') // 'resources' | 'departments' | 'students'

  // Department State
  const [departments, setDepartments] = useState([])
  const [deptForm, setDeptForm] = useState({ name: '', code: '', year: '' })
  const [editingDeptId, setEditingDeptId] = useState(null)

  // Resource State
  const [resources, setResources] = useState([])
  const [resForm, setResForm] = useState({ title: '', departmentId: '', type: 'file', url: '', file: null })
  const [editingResId, setEditingResId] = useState(null)
  const [editTitle, setEditTitle] = useState('')

  // Students State
  const [students, setStudents] = useState([])

  // UI-only state (no backend impact)
  const [toast, setToast] = useState(null)
  const [confirmTarget, setConfirmTarget] = useState(null) // { kind: 'dept' | 'resource', id, label }
  const [pwTarget, setPwTarget] = useState(null) // student object
  const [pwValue, setPwValue] = useState('')
  const [fileKey, setFileKey] = useState(0) // resets the file input after upload

  useEffect(() => {
    fetchDepartments()
    fetchResources()
    fetchStudents()
  }, [])

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 3500)
    return () => clearTimeout(t)
  }, [toast])

  useEffect(() => {
    if (!confirmTarget && !pwTarget) return
    const onKey = (e) => {
      if (e.key === 'Escape') { setConfirmTarget(null); setPwTarget(null); setPwValue('') }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [confirmTarget, pwTarget])

  const showToast = (message, type = 'success') => setToast({ message, type })

  // --- Department Handlers ---
  const fetchDepartments = async () => {
    try {
      const res = await axios.get(DEPT_API)
      setDepartments(Array.isArray(res.data) ? res.data : [])
    } catch (err) {
      console.error('Error fetching departments:', err)
    }
  }

  const handleDeptSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingDeptId) {
        await axios.put(`${DEPT_API}/${editingDeptId}`, deptForm)
        setEditingDeptId(null)
        showToast('Department updated')
      } else {
        await axios.post(DEPT_API, deptForm)
        showToast('Department added')
      }
      setDeptForm({ name: '', code: '', year: '' })
      fetchDepartments()
    } catch (err) {
      console.error('Error saving department:', err)
      showToast('Could not save the department. Try again.', 'error')
    }
  }

  const handleEditDept = (dept) => {
    setEditingDeptId(dept.id)
    setDeptForm({ name: dept.name, code: dept.code, year: dept.year })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Confirmation is handled by the in-page dialog
  const handleDeleteDept = async (id) => {
    try {
      await axios.delete(`${DEPT_API}/${id}`)
      fetchDepartments()
      showToast('Department deleted')
    } catch (err) {
      console.error('Error deleting department:', err)
      showToast('Could not delete the department. Try again.', 'error')
    }
  }

  // --- Resource Handlers ---
  const fetchResources = async () => {
    try {
      const res = await axios.get(RESOURCE_API)
      setResources(Array.isArray(res.data) ? res.data : [])
    } catch (err) {
      console.error('Error fetching resources:', err)
    }
  }

  const handleResourceSubmit = async (e) => {
    e.preventDefault()
    if (!resForm.departmentId) {
      showToast('Select a department before uploading.', 'error')
      return
    }

    const formData = new FormData()
    formData.append('title', resForm.title)
    formData.append('departmentId', resForm.departmentId)
    formData.append('type', resForm.type)

    if (resForm.type === 'youtube') {
      formData.append('url', resForm.url)
    } else if (resForm.file) {
      formData.append('file', resForm.file)
    }

    try {
      await axios.post(RESOURCE_API, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setResForm({ title: '', departmentId: '', type: 'file', url: '', file: null })
      setFileKey((k) => k + 1)
      fetchResources()
      showToast('Resource uploaded')
    } catch (err) {
      console.error('Error uploading resource:', err)
      showToast('Upload failed. Check the file and try again.', 'error')
    }
  }

  const handleUpdateResourceTitle = async (id) => {
    try {
      await axios.put(`${RESOURCE_API}/${id}`, { title: editTitle })
      setEditingResId(null)
      setEditTitle('')
      fetchResources()
      showToast('Title updated')
    } catch (err) {
      console.error('Error updating resource:', err)
      showToast('Could not update the title. Try again.', 'error')
    }
  }

  const handleDeleteResource = async (id) => {
    try {
      await axios.delete(`${RESOURCE_API}/${id}`)
      fetchResources()
      showToast('Resource deleted')
    } catch (err) {
      console.error('Error deleting resource:', err)
      showToast('Could not delete the resource. Try again.', 'error')
    }
  }

  // --- Students Handlers ---
  const fetchStudents = async () => {
    try {
      const res = await axios.get(`${AUTH_API}/students`)
      setStudents(Array.isArray(res.data) ? res.data : [])
    } catch (err) {
      console.error('Error fetching students:', err)
    }
  }

  // Opens the password dialog (replaces the browser prompt)
  const handleEditPassword = (student) => {
    setPwTarget(student)
    setPwValue('')
  }

  // Teacher updating student's password (same API call as before)
  const submitPassword = async (e) => {
    e.preventDefault()
    const newPassword = pwValue
    if (!newPassword) return
    const studentId = pwTarget.id

    try {
      await axios.put(`${AUTH_API}/update-student-password/${studentId}`, {
        password: newPassword
      })
      setPwTarget(null)
      setPwValue('')
      showToast('Student password updated')
    } catch (err) {
      console.error(err)
      showToast('Failed to update the student password.', 'error')
    }
  }

  const confirmDelete = async () => {
    const { kind, id } = confirmTarget
    setConfirmTarget(null)
    if (kind === 'dept') await handleDeleteDept(id)
    else await handleDeleteResource(id)
  }

  const tabs = [
    ['resources', '📂 Resources'],
    ['departments', '🏢 Departments'],
    ['students', '👥 Students']
  ]

  return (
    <div className="tdb">
      <style>{STYLES}</style>

      <div className="tdb__inner">
        {/* Tabs */}
        <div className="tdb__tabs" role="tablist" aria-label="Dashboard sections">
          {tabs.map(([key, label]) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={activeTab === key}
              className="tdb__tab"
              onClick={() => {
                setActiveTab(key)
                if (key === 'students') fetchStudents()
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* DEPARTMENT MANAGEMENT TAB */}
        {activeTab === 'departments' && (
          <section className="tdb__panel" role="tabpanel">
            <h2 className="tdb__h2">{editingDeptId ? 'Edit department' : 'Add a department'}</h2>
            <form onSubmit={handleDeptSubmit} className="tdb__form tdb__form--dept">
              <div className="tdb__field">
                <label className="tdb__label" htmlFor="dept-name">Name</label>
                <input
                  id="dept-name" className="tdb__input" type="text"
                  placeholder="e.g. Computer Science"
                  value={deptForm.name}
                  onChange={(e) => setDeptForm({ ...deptForm, name: e.target.value })} required
                />
              </div>
              <div className="tdb__field">
                <label className="tdb__label" htmlFor="dept-code">Code</label>
                <input
                  id="dept-code" className="tdb__input" type="text" placeholder="e.g. CSE"
                  value={deptForm.code}
                  onChange={(e) => setDeptForm({ ...deptForm, code: e.target.value })} required
                />
              </div>
              <div className="tdb__field">
                <label className="tdb__label" htmlFor="dept-year">Year</label>
                <input
                  id="dept-year" className="tdb__input" type="number" inputMode="numeric"
                  placeholder="e.g. 1"
                  value={deptForm.year}
                  onChange={(e) => setDeptForm({ ...deptForm, year: e.target.value })} required
                />
              </div>
              <div className="tdb__form-actions">
                <button type="submit" className={`tdb__btn ${editingDeptId ? '' : 'tdb__btn--ok'}`}>
                  {editingDeptId ? 'Save changes' : 'Add department'}
                </button>
                {editingDeptId && (
                  <button
                    type="button" className="tdb__btn tdb__btn--ghost"
                    onClick={() => { setEditingDeptId(null); setDeptForm({ name: '', code: '', year: '' }) }}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>

            <h3 className="tdb__h3">All departments</h3>
            {departments.length === 0 ? (
              <div className="tdb__empty">No departments yet. Add your first one above.</div>
            ) : (
              <div className="tdb__table-wrap">
                <table className="tdb__table">
                  <thead>
                    <tr><th>ID</th><th>Name</th><th>Code</th><th>Year</th><th>Actions</th></tr>
                  </thead>
                  <tbody>
                    {departments.map((d) => (
                      <tr key={d.id}>
                        <td data-label="ID">{d.id}</td>
                        <td data-label="Name">{d.name}</td>
                        <td data-label="Code">{d.code}</td>
                        <td data-label="Year">{d.year}</td>
                        <td className="tdb__cell-actions">
                          <div className="tdb__row-actions">
                            <button type="button" className="tdb__btn tdb__btn--sm tdb__btn--edit" onClick={() => handleEditDept(d)}>Edit</button>
                            <button
                              type="button" className="tdb__btn tdb__btn--sm tdb__btn--delete"
                              onClick={() => setConfirmTarget({ kind: 'dept', id: d.id, label: d.name })}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        {/* STUDENTS DIRECTORY TAB */}
        {activeTab === 'students' && (
          <section className="tdb__panel" role="tabpanel">
            <div className="tdb__head-row">
              <h2 className="tdb__h2">Registered students</h2>
              <span className="tdb__pill">Total: {students.length}</span>
            </div>

            {students.length === 0 ? (
              <div className="tdb__empty">No students have registered yet.</div>
            ) : (
              <div className="tdb__table-wrap">
                <table className="tdb__table">
                  <thead>
                    <tr><th>ID</th><th>Name</th><th>Email</th><th>Department</th><th>Status</th><th>Actions</th></tr>
                  </thead>
                  <tbody>
                    {students.map((s) => (
                      <tr key={s.id}>
                        <td data-label="ID">#{s.id}</td>
                        <td data-label="Name" style={{ fontWeight: 600 }}>{s.name}</td>
                        <td data-label="Email">{s.email}</td>
                        <td data-label="Department">
                          {s.department ? `${s.department.name} (${s.department.code})` : 'N/A'}
                        </td>
                        <td data-label="Status">
                          <span className={`tdb__status${s.blocked ? ' tdb__status--blocked' : ''}`}>
                            {s.blocked ? 'Blocked' : 'Active'}
                          </span>
                        </td>
                        <td className="tdb__cell-actions">
                          <div className="tdb__row-actions">
                            <button type="button" className="tdb__btn tdb__btn--sm" onClick={() => handleEditPassword(s)}>
                              Reset password
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        {/* RESOURCE MANAGEMENT TAB */}
        {activeTab === 'resources' && (
          <section className="tdb__panel" role="tabpanel">
            <h2 className="tdb__h2">Upload a file or YouTube link</h2>
            <form onSubmit={handleResourceSubmit} className="tdb__form">
              <div className="tdb__field tdb__field--wide">
                <label className="tdb__label" htmlFor="res-title">Title</label>
                <input
                  id="res-title" className="tdb__input" type="text"
                  placeholder="e.g. Unit 1 notes or Lecture 1"
                  value={resForm.title}
                  onChange={(e) => setResForm({ ...resForm, title: e.target.value })} required
                />
              </div>

              <div className="tdb__field">
                <label className="tdb__label" htmlFor="res-dept">Department</label>
                <select
                  id="res-dept" className="tdb__select"
                  value={resForm.departmentId}
                  onChange={(e) => setResForm({ ...resForm, departmentId: e.target.value })} required
                >
                  <option value="">Select a department</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>Year {d.year} - {d.name} ({d.code})</option>
                  ))}
                </select>
              </div>

              <div className="tdb__field">
                <label className="tdb__label" htmlFor="res-type">Type</label>
                <select
                  id="res-type" className="tdb__select"
                  value={resForm.type}
                  onChange={(e) => setResForm({ ...resForm, type: e.target.value })}
                >
                  <option value="file">📄 File (PDF, Excel, PPT, CSV)</option>
                  <option value="youtube">📺 YouTube video link</option>
                </select>
              </div>

              <div className="tdb__field tdb__field--wide">
                {resForm.type === 'youtube' ? (
                  <>
                    <label className="tdb__label" htmlFor="res-url">YouTube URL</label>
                    <input
                      id="res-url" className="tdb__input" type="url"
                      placeholder="Paste the video link"
                      value={resForm.url}
                      onChange={(e) => setResForm({ ...resForm, url: e.target.value })} required
                    />
                  </>
                ) : (
                  <>
                    <label className="tdb__label" htmlFor="res-file">File</label>
                    <input
                      key={fileKey} id="res-file" className="tdb__input" type="file"
                      accept=".pdf,.xlsx,.xls,.ppt,.pptx,.csv"
                      onChange={(e) => setResForm({ ...resForm, file: e.target.files[0] })} required
                    />
                  </>
                )}
              </div>

              <button type="submit" className="tdb__btn tdb__submit-wide">Upload resource</button>
            </form>

            <h3 className="tdb__h3">Uploaded resources</h3>
            {resources.length === 0 ? (
              <div className="tdb__empty">Nothing uploaded yet. Use the form above to add your first resource.</div>
            ) : (
              <div className="tdb__table-wrap">
                <table className="tdb__table">
                  <thead>
                    <tr><th>Title</th><th>Department</th><th>Type / Link</th><th>Actions</th></tr>
                  </thead>
                  <tbody>
                    {resources.map((r) => {
                      const dept = departments.find(d => String(d.id) === String(r.departmentId))
                      const isYoutube = r.fileUrl && (r.fileUrl.includes('youtube.com') || r.fileUrl.includes('youtu.be'))

                      return (
                        <tr key={r.id}>
                          <td data-label="Title">
                            {editingResId === r.id ? (
                              <div className="tdb__inline-edit">
                                <input
                                  className="tdb__input" type="text" value={editTitle} autoFocus
                                  aria-label="Resource title"
                                  onChange={(e) => setEditTitle(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter' && editTitle.trim()) handleUpdateResourceTitle(r.id)
                                    if (e.key === 'Escape') setEditingResId(null)
                                  }}
                                />
                                <button
                                  type="button" className="tdb__btn tdb__btn--sm tdb__btn--ok"
                                  disabled={!editTitle.trim()}
                                  onClick={() => handleUpdateResourceTitle(r.id)}
                                >
                                  Save
                                </button>
                                <button type="button" className="tdb__btn tdb__btn--sm tdb__btn--ghost" onClick={() => setEditingResId(null)}>
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              r.title
                            )}
                          </td>
                          <td data-label="Department">{dept ? `${dept.name} (${dept.code})` : `Dept ID: ${r.departmentId}`}</td>
                          <td data-label="Type">
                            {isYoutube ? (
                              <a className="tdb__a tdb__a--video" href={r.fileUrl} target="_blank" rel="noreferrer">📺 Watch video</a>
                            ) : (
                              <a className="tdb__a tdb__a--file" href={`http://localhost:8081${r.fileUrl}`} target="_blank" rel="noreferrer">📄 Open file</a>
                            )}
                          </td>
                          <td className="tdb__cell-actions">
                            <div className="tdb__row-actions">
                              <button
                                type="button" className="tdb__btn tdb__btn--sm tdb__btn--edit"
                                onClick={() => { setEditingResId(r.id); setEditTitle(r.title) }}
                              >
                                Rename
                              </button>
                              <button
                                type="button" className="tdb__btn tdb__btn--sm tdb__btn--delete"
                                onClick={() => setConfirmTarget({ kind: 'resource', id: r.id, label: r.title })}
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}
      </div>

      {/* Delete confirmation */}
      {confirmTarget && (
        <div className="tdb__overlay" onClick={() => setConfirmTarget(null)}>
          <div
            className="tdb__dialog" role="alertdialog" aria-modal="true" aria-labelledby="tdb-del-title"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="tdb-del-title">
              {confirmTarget.kind === 'dept' ? 'Delete this department?' : 'Delete this resource?'}
            </h2>
            <p>“{confirmTarget.label}” will be removed. This can't be undone.</p>
            <div className="tdb__dialog-actions">
              <button type="button" className="tdb__btn tdb__btn--ghost" onClick={() => setConfirmTarget(null)}>Cancel</button>
              <button type="button" className="tdb__btn tdb__btn--danger" onClick={confirmDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Reset student password */}
      {pwTarget && (
        <div className="tdb__overlay" onClick={() => { setPwTarget(null); setPwValue('') }}>
          <form
            className="tdb__dialog" role="dialog" aria-modal="true" aria-labelledby="tdb-pw-title"
            onClick={(e) => e.stopPropagation()} onSubmit={submitPassword}
          >
            <h2 id="tdb-pw-title">Reset password</h2>
            <p>Set a new password for {pwTarget.name}.</p>
            <div className="tdb__field">
              <label className="tdb__label" htmlFor="tdb-pw">New password</label>
              <input
                id="tdb-pw" className="tdb__input" type="text" autoFocus autoComplete="off"
                value={pwValue} onChange={(e) => setPwValue(e.target.value)}
              />
            </div>
            <div className="tdb__dialog-actions">
              <button type="button" className="tdb__btn tdb__btn--ghost" onClick={() => { setPwTarget(null); setPwValue('') }}>
                Cancel
              </button>
              <button type="submit" className="tdb__btn" disabled={!pwValue}>Update password</button>
            </div>
          </form>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className={`tdb__toast${toast.type === 'error' ? ' tdb__toast--error' : ''}`} role="status" aria-live="polite">
          {toast.message}
        </div>
      )}
    </div>
  )
}

export default TeacherDashboard