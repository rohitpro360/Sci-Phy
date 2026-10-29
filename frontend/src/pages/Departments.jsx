import { useEffect, useState } from 'react'
import axios from 'axios'

const DEPT_API = 'http://localhost:8081/api/departments'

// All styles live here so no separate CSS file is needed
const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Figtree:wght@400;500;600;700&display=swap');

.dp {
  --ink: #14213d; --ink-soft: #55607a; --paper: #f6f7fb; --card: #fff; --line: #e1e5ee;
  --accent: #3347d9; --accent-dark: #2636ad; --ok: #15803d;
  --warn: #b45309; --warn-tint: #fef3c7; --danger: #b91c1c;
  font-family: 'Figtree', 'Segoe UI', system-ui, sans-serif;
  color: var(--ink); background: var(--paper); min-height: 100vh;
  padding: 24px 16px 56px; box-sizing: border-box;
}
.dp *, .dp *::before, .dp *::after { box-sizing: border-box; }
.dp__inner { max-width: 1000px; margin: 0 auto; }

.dp__header { background: var(--ink); color: #fff; border-radius: 10px; padding: 26px 22px; margin-bottom: 20px; }
.dp__title { margin: 0 0 6px; font-size: clamp(1.4rem, 4.5vw, 2rem); font-weight: 700; letter-spacing: -0.01em; line-height: 1.2; }
.dp__subtitle { margin: 0; color: #b8c1d9; font-size: 0.95rem; line-height: 1.5; max-width: 60ch; }

.dp__panel { background: var(--card); border: 1px solid var(--line); border-radius: 10px; padding: 18px; margin-bottom: 28px; }
.dp__h2 { margin: 0 0 14px; font-size: 1.1rem; font-weight: 700; }
.dp__list-head { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin: 0 0 14px; }
.dp__list-head .dp__h2 { margin: 0; }
.dp__pill { background: #e9edff; color: var(--accent-dark); padding: 6px 14px; border-radius: 999px; font-size: 0.85rem; font-weight: 700; }

.dp__form { display: grid; grid-template-columns: 1fr; gap: 14px; }
.dp__field { display: flex; flex-direction: column; gap: 6px; min-width: 0; }
.dp__label { font-size: 0.8rem; font-weight: 600; color: var(--ink-soft); }
.dp__input {
  width: 100%; min-height: 44px; padding: 10px 12px; border: 1px solid #c9d0de;
  border-radius: 8px; background: #fff; color: var(--ink); font: inherit; font-size: 1rem;
}
.dp__input:focus-visible, .dp__btn:focus-visible { outline: 3px solid rgba(51,71,217,.4); outline-offset: 2px; }
.dp__form-actions { display: flex; gap: 8px; }
.dp__form-actions .dp__btn { flex: 1; }

.dp__btn {
  display: inline-flex; align-items: center; justify-content: center; min-height: 44px;
  padding: 0 18px; border: 0; border-radius: 8px; font: inherit; font-size: 0.92rem;
  font-weight: 600; color: #fff; background: var(--accent); cursor: pointer; transition: background-color .15s ease;
}
.dp__btn:hover { background: var(--accent-dark); }
.dp__btn--ghost { background: #fff; color: var(--ink); border: 1px solid #c9d0de; }
.dp__btn--ghost:hover { background: var(--paper); }
.dp__btn--edit { background: var(--warn-tint); color: var(--warn); border: 1px solid #f3d98b; }
.dp__btn--edit:hover { background: #fde9a2; }
.dp__btn--delete { background: #fff; color: var(--danger); border: 1px solid #f1b9b9; }
.dp__btn--delete:hover { background: #fdeeee; }
.dp__btn--danger { background: var(--danger); }
.dp__btn--danger:hover { background: #991b1b; }
.dp__btn--sm { min-height: 40px; padding: 0 14px; font-size: 0.85rem; }

.dp__table-wrap { background: #fff; border: 1px solid var(--line); border-radius: 10px; overflow: hidden; }
.dp__table { width: 100%; border-collapse: collapse; text-align: left; }
.dp__table th { background: #eef1f7; padding: 12px 18px; font-size: 0.8rem; font-weight: 700; color: var(--ink-soft); }
.dp__table td { padding: 12px 18px; border-top: 1px solid var(--line); vertical-align: middle; }
.dp__table th.dp__center, .dp__table td.dp__center { text-align: center; }
.dp__code { background: #e9edff; color: var(--accent-dark); padding: 3px 8px; border-radius: 6px; font-size: 0.82rem; font-weight: 700; }
.dp__row-actions { display: flex; gap: 8px; justify-content: center; }

.dp__state { background: var(--card); border: 1px solid var(--line); border-radius: 10px; padding: 36px 20px; text-align: center; color: var(--ink-soft); }
.dp__state h3 { margin: 0 0 6px; font-size: 1.05rem; color: var(--ink); }
.dp__state p { margin: 0 auto; max-width: 44ch; line-height: 1.5; }
.dp__state .dp__btn { margin-top: 14px; }
.dp__state--error { background: #fef2f2; border-color: #f4b4b4; }
.dp__state--error h3 { color: var(--danger); }

.dp__skel { height: 64px; border-radius: 10px; margin-bottom: 10px;
  background: linear-gradient(90deg, #eceff5 25%, #f6f7fb 50%, #eceff5 75%); background-size: 200% 100%;
  animation: dp-shimmer 1.4s linear infinite; }
@keyframes dp-shimmer { to { background-position: -200% 0; } }

.dp__toast {
  position: fixed; left: 16px; right: 16px; z-index: 60; bottom: calc(16px + env(safe-area-inset-bottom, 0px));
  padding: 14px 16px; border-radius: 10px; background: var(--ink); color: #fff; font-weight: 600;
  font-size: 0.95rem; border-left: 5px solid var(--ok); box-shadow: 0 8px 24px rgba(20,33,61,.25);
}
.dp__toast--error { border-left-color: #ef4444; }

.dp__overlay { position: fixed; inset: 0; z-index: 50; background: rgba(20,33,61,.55); display: flex; align-items: flex-end; justify-content: center; }
.dp__dialog { width: 100%; background: #fff; border-radius: 16px 16px 0 0; padding: 24px 20px calc(20px + env(safe-area-inset-bottom, 0px)); }
.dp__dialog h2 { margin: 0 0 8px; font-size: 1.15rem; }
.dp__dialog p { margin: 0 0 20px; color: var(--ink-soft); line-height: 1.5; overflow-wrap: anywhere; }
.dp__dialog-actions { display: flex; flex-direction: column-reverse; gap: 10px; }

/* Mobile: table becomes stacked cards */
@media (max-width: 719px) {
  .dp__table-wrap { border: 0; border-radius: 0; background: transparent; overflow: visible; }
  .dp__table, .dp__table tbody, .dp__table tr, .dp__table td { display: block; width: 100%; }
  .dp__table thead { display: none; }
  .dp__table tr { background: #fff; border: 1px solid var(--line); border-radius: 10px; padding: 6px 14px; margin-bottom: 12px; }
  .dp__table td { display: flex; justify-content: space-between; align-items: center; gap: 16px; padding: 9px 0; border-top: 1px solid #f0f2f7; text-align: right; overflow-wrap: anywhere; }
  .dp__table td:first-child { border-top: 0; }
  .dp__table td::before { content: attr(data-label); flex: 0 0 auto; font-size: 0.78rem; font-weight: 700; color: var(--ink-soft); text-align: left; }
  .dp__table td.dp__cell-actions { display: block; padding-top: 12px; }
  .dp__table td.dp__cell-actions::before { content: none; }
  .dp__row-actions .dp__btn { flex: 1; }
}

@media (min-width: 640px) {
  .dp { padding: 32px 24px 64px; }
  .dp__header { padding: 30px 28px; }
  .dp__panel { padding: 24px; }
  .dp__form { grid-template-columns: 2fr 1fr 1fr; }
  .dp__form-actions { grid-column: 1 / -1; }
  .dp__form-actions .dp__btn { flex: 0 0 auto; }
  .dp__toast { left: auto; right: 24px; max-width: 380px; }
  .dp__overlay { align-items: center; padding: 16px; }
  .dp__dialog { max-width: 420px; border-radius: 14px; padding: 24px; }
  .dp__dialog-actions { flex-direction: row; justify-content: flex-end; }
}
@media (prefers-reduced-motion: reduce) { .dp__skel { animation: none; } .dp__btn { transition: none; } }
`

function Departments() {
  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Form states for Add / Modify
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [year, setYear] = useState('')
  const [editingId, setEditingId] = useState(null)

  // UI-only state (no backend impact)
  const [toast, setToast] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const fetchDepartments = async (signal) => {
    try {
      setLoading(true)
      setError(null)
      const response = await axios.get(DEPT_API, { signal })
      setDepartments(Array.isArray(response.data) ? response.data : [])
    } catch (err) {
      if (axios.isCancel(err)) return
      setError('Failed to fetch departments from the server. Make sure backend is running on port 8081.')
    } finally {
      if (!signal?.aborted) setLoading(false)
    }
  }

  useEffect(() => {
    const controller = new AbortController()
    fetchDepartments(controller.signal)
    return () => controller.abort()
  }, [])

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 3500)
    return () => clearTimeout(t)
  }, [toast])

  useEffect(() => {
    if (!deleteTarget) return
    const onKey = (e) => { if (e.key === 'Escape') setDeleteTarget(null) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [deleteTarget])

  const showToast = (message, type = 'success') => setToast({ message, type })

  const resetForm = () => {
    setName('')
    setCode('')
    setYear('')
    setEditingId(null)
  }

  // Handle Form Submit (Add New or Update Existing Department)
  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const deptData = { name, code, year: Number(year) }
      if (editingId) {
        await axios.put(`${DEPT_API}/${editingId}`, deptData)
        showToast('Department updated')
      } else {
        await axios.post(DEPT_API, deptData)
        showToast('Department added')
      }

      // Reset Form
      resetForm()

      // Refresh list
      const controller = new AbortController()
      fetchDepartments(controller.signal)
    } catch (err) {
      console.error(err)
      showToast('Could not save the department. Check the backend and try again.', 'error')
    }
  }

  // Handle Edit Click
  const handleEdit = (dept) => {
    setEditingId(dept.id)
    setName(dept.name)
    setCode(dept.code)
    setYear(dept.year)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Handle Delete Department (confirmation handled by the in-page dialog)
  const handleDelete = async (id) => {
    try {
      await axios.delete(`${DEPT_API}/${id}`)
      setDepartments(departments.filter(d => d.id !== id))
      showToast('Department deleted')
    } catch (err) {
      console.error(err)
      showToast('Could not delete the department. Try again.', 'error')
    }
  }

  const confirmDelete = async () => {
    const id = deleteTarget.id
    setDeleteTarget(null)
    await handleDelete(id)
  }

  const retry = () => fetchDepartments(new AbortController().signal)

  return (
    <div className="dp">
      <style>{STYLES}</style>

      <div className="dp__inner">
        {/* Header */}
        <header className="dp__header">
          <h1 className="dp__title">Departments</h1>
          <p className="dp__subtitle">Add, edit and remove the departments that students and resources are assigned to.</p>
        </header>

        {/* Add / Edit form */}
        <section className="dp__panel" aria-label={editingId ? 'Edit department' : 'Add department'}>
          <h2 className="dp__h2">{editingId ? 'Edit department' : 'Add a department'}</h2>
          <form onSubmit={handleSubmit} className="dp__form">
            <div className="dp__field">
              <label className="dp__label" htmlFor="dp-name">Name</label>
              <input
                id="dp-name" className="dp__input" type="text"
                placeholder="e.g. Computer Science"
                value={name} onChange={(e) => setName(e.target.value)} required
              />
            </div>
            <div className="dp__field">
              <label className="dp__label" htmlFor="dp-code">Code</label>
              <input
                id="dp-code" className="dp__input" type="text"
                placeholder="e.g. CSE"
                value={code} onChange={(e) => setCode(e.target.value)} required
              />
            </div>
            <div className="dp__field">
              <label className="dp__label" htmlFor="dp-year">Year</label>
              <input
                id="dp-year" className="dp__input" type="number" inputMode="numeric"
                placeholder="e.g. 1"
                value={year} onChange={(e) => setYear(e.target.value)} required
              />
            </div>

            <div className="dp__form-actions">
              <button type="submit" className="dp__btn">
                {editingId ? 'Save changes' : 'Add department'}
              </button>
              {editingId && (
                <button type="button" className="dp__btn dp__btn--ghost" onClick={resetForm}>
                  Cancel
                </button>
              )}
            </div>
          </form>
        </section>

        {/* List */}
        <div className="dp__list-head">
          <h2 className="dp__h2">All departments</h2>
          <span className="dp__pill">{departments.length}</span>
        </div>

        {loading && (
          <div aria-busy="true" aria-label="Loading departments">
            {[0, 1, 2].map((i) => <div key={i} className="dp__skel" />)}
          </div>
        )}

        {error && (
          <div className="dp__state dp__state--error" role="alert">
            <h3>Can't reach the server</h3>
            <p>{error}</p>
            <button type="button" className="dp__btn dp__btn--ghost" onClick={retry}>Try again</button>
          </div>
        )}

        {!loading && !error && departments.length === 0 && (
          <div className="dp__state">
            <h3>No departments yet</h3>
            <p>Use the form above to add your first department.</p>
          </div>
        )}

        {!loading && !error && departments.length > 0 && (
          <div className="dp__table-wrap">
            <table className="dp__table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Code</th>
                  <th>Year</th>
                  <th className="dp__center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {departments.map((d) => (
                  <tr key={d.id}>
                    <td data-label="ID" style={{ fontWeight: 600 }}>#{d.id}</td>
                    <td data-label="Name">{d.name}</td>
                    <td data-label="Code"><span className="dp__code">{d.code}</span></td>
                    <td data-label="Year">Year {d.year}</td>
                    <td className="dp__cell-actions dp__center">
                      <div className="dp__row-actions">
                        <button type="button" className="dp__btn dp__btn--sm dp__btn--edit" onClick={() => handleEdit(d)}>
                          Edit
                        </button>
                        <button type="button" className="dp__btn dp__btn--sm dp__btn--delete" onClick={() => setDeleteTarget(d)}>
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
      </div>

      {/* Delete confirmation */}
      {deleteTarget && (
        <div className="dp__overlay" onClick={() => setDeleteTarget(null)}>
          <div
            className="dp__dialog" role="alertdialog" aria-modal="true" aria-labelledby="dp-del-title"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="dp-del-title">Delete this department?</h2>
            <p>“{deleteTarget.name}” will be removed. This can't be undone.</p>
            <div className="dp__dialog-actions">
              <button type="button" className="dp__btn dp__btn--ghost" onClick={() => setDeleteTarget(null)}>Cancel</button>
              <button type="button" className="dp__btn dp__btn--danger" onClick={confirmDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className={`dp__toast${toast.type === 'error' ? ' dp__toast--error' : ''}`} role="status" aria-live="polite">
          {toast.message}
        </div>
      )}
    </div>
  )
}

export default Departments