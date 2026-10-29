import { useEffect, useState } from 'react'
import axios from 'axios'
import './Resources.css'

const API_URL = 'http://localhost:8081/api/resources'
const DEPT_API = 'http://localhost:8081/api/departments'

function Resources() {
  const [resources, setResources] = useState([])
  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedDeptId, setSelectedDeptId] = useState('')

  // Edit / Modify states
  const [editingResId, setEditingResId] = useState(null)
  const [editTitle, setEditTitle] = useState('')

  // UI-only states (no backend impact)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('all') // all | video | file
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [toast, setToast] = useState(null)

  const user = JSON.parse(localStorage.getItem('collegeUser'))
  const isStudent = user && user.role === 'STUDENT'

  const fetchData = async (signal) => {
    try {
      setLoading(true)
      setError(null)

      const [deptResponse, resResponse] = await Promise.all([
        axios.get(DEPT_API, { signal }),
        user && user.role === 'STUDENT' && user.department
          ? axios.get(`http://localhost:8081/api/resources/department/${user.department.id}`, { signal })
          : axios.get(API_URL, { signal })
      ])

      setDepartments(Array.isArray(deptResponse.data) ? deptResponse.data : [])
      setResources(Array.isArray(resResponse.data) ? resResponse.data : [])

      if (user && user.role === 'STUDENT' && user.department) {
        setSelectedDeptId(String(user.department.id))
      }

    } catch (err) {
      if (axios.isCancel(err)) return
      setError('Failed to connect to the server. Please check if the backend is running on port 8081.')
    } finally {
      if (!signal?.aborted) setLoading(false)
    }
  }

  useEffect(() => {
    const controller = new AbortController()
    fetchData(controller.signal)
    return () => controller.abort()
  }, [])

  // Auto-dismiss toast
  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 3500)
    return () => clearTimeout(t)
  }, [toast])

  // Close confirm dialog with Escape
  useEffect(() => {
    if (!deleteTarget) return
    const onKey = (e) => { if (e.key === 'Escape') setDeleteTarget(null) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [deleteTarget])

  const showToast = (message, type = 'success') => setToast({ message, type })

  // Modify / Update Resource Title
  const handleUpdateTitle = async (id) => {
    try {
      await axios.put(`${API_URL}/${id}`, { title: editTitle })
      setEditingResId(null)
      setEditTitle('')
      const controller = new AbortController()
      fetchData(controller.signal)
      showToast('Title updated')
    } catch (err) {
      console.error(err)
      showToast('Could not update the title. Try again.', 'error')
    }
  }

  // Delete Resource (confirmation now handled by the in-page dialog)
  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`)
      setResources(resources.filter(r => r.id !== id))
      showToast('Resource deleted')
    } catch (err) {
      console.error(err)
      showToast('Could not delete the resource. Try again.', 'error')
    }
  }

  const confirmDelete = async () => {
    const id = deleteTarget.id
    setDeleteTarget(null)
    await handleDelete(id)
  }

  const isYoutubeUrl = (url) =>
    url && (url.includes('youtube.com') || url.includes('youtu.be'))

  // Filter resources by selected department (same logic as before)
  const deptFiltered = isStudent
    ? resources
    : (selectedDeptId ? resources.filter(r => String(r.departmentId) === String(selectedDeptId)) : resources)

  // Extra client-side filters: search + type
  const filteredResources = deptFiltered.filter((r) => {
    const yt = isYoutubeUrl(r.fileUrl)
    if (typeFilter === 'video' && !yt) return false
    if (typeFilter === 'file' && yt) return false
    if (search.trim() && !String(r.title || '').toLowerCase().includes(search.trim().toLowerCase())) return false
    return true
  })

  const retry = () => fetchData(new AbortController().signal)

  return (
    <div className="rp">
      <div className="rp__inner">

        {/* Header */}
        <header className="rp__header">
          <h1 className="rp__title">Study resources</h1>
          <p className="rp__subtitle">
            {isStudent
              ? `Notes and video lectures for ${user.department?.name || 'your department'}.`
              : 'Browse, rename and remove study materials and video lectures by department.'}
          </p>
        </header>

        {/* Toolbar */}
        <section className="rp__toolbar" aria-label="Filter resources">
          <div className="rp__field">
            <label className="rp__label" htmlFor="rp-search">Search by title</label>
            <input
              id="rp-search"
              className="rp__input"
              type="search"
              placeholder="e.g. Signals and Systems"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {!isStudent && (
            <div className="rp__field">
              <label className="rp__label" htmlFor="rp-dept">Department</label>
              <select
                id="rp-dept"
                className="rp__select"
                value={selectedDeptId}
                onChange={(e) => setSelectedDeptId(e.target.value)}
              >
                <option value="">All departments</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>Year {d.year} - {d.name} ({d.code})</option>
                ))}
              </select>
            </div>
          )}

          <div className="rp__chips" role="group" aria-label="Resource type">
            {[
              ['all', 'All'],
              ['file', 'Documents'],
              ['video', 'Videos']
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                className="rp__chip"
                aria-pressed={typeFilter === value}
                onClick={() => setTypeFilter(value)}
              >
                {label}
              </button>
            ))}
          </div>
        </section>

        {/* Loading skeletons */}
        {loading && (
          <div className="rp__grid" aria-busy="true" aria-label="Loading resources">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="rp__card rp__skeleton">
                <div>
                  <div className="rp__bar rp__bar--short" />
                  <div className="rp__bar rp__bar--mid" />
                  <div className="rp__bar" />
                </div>
                <div className="rp__bar" style={{ height: 44, marginBottom: 0 }} />
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="rp__state rp__state--error" role="alert">
            <h2>Can't reach the server</h2>
            <p>{error}</p>
            <button type="button" className="rp__btn rp__btn--ghost" onClick={retry}>Try again</button>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && filteredResources.length === 0 && (
          <div className="rp__state">
            <h2>No resources found</h2>
            <p>
              {search || typeFilter !== 'all'
                ? 'Nothing matches your search or filter. Try clearing them.'
                : 'No resources have been added for this department yet.'}
            </p>
            {(search || typeFilter !== 'all') && (
              <button
                type="button"
                className="rp__btn rp__btn--ghost"
                onClick={() => { setSearch(''); setTypeFilter('all') }}
              >
                Clear filters
              </button>
            )}
          </div>
        )}

        {/* Results */}
        {!loading && !error && filteredResources.length > 0 && (
          <>
            <p className="rp__count" aria-live="polite">
              {filteredResources.length} {filteredResources.length === 1 ? 'resource' : 'resources'}
            </p>

            <div className="rp__grid">
              {filteredResources.map((r) => {
                const dept = departments.find(d => String(d.id) === String(r.departmentId))
                const isYoutube = isYoutubeUrl(r.fileUrl)

                return (
                  <article key={r.id} className={`rp__card${isYoutube ? ' rp__card--video' : ''}`}>
                    <div>
                      <div className="rp__meta">
                        <span className={`rp__badge${isYoutube ? ' rp__badge--video' : ''}`}>
                          {isYoutube ? '📺 Video' : '📄 Document'}
                        </span>
                        <span className="rp__code">{dept ? dept.code : 'General'}</span>
                      </div>

                      {/* Inline editing for title */}
                      {editingResId === r.id ? (
                        <div className="rp__edit">
                          <label className="rp__label" htmlFor={`edit-${r.id}`}>Resource title</label>
                          <input
                            id={`edit-${r.id}`}
                            className="rp__input"
                            type="text"
                            value={editTitle}
                            autoFocus
                            onChange={(e) => setEditTitle(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && editTitle.trim()) handleUpdateTitle(r.id)
                              if (e.key === 'Escape') setEditingResId(null)
                            }}
                          />
                          <div className="rp__edit-actions">
                            <button
                              type="button"
                              className="rp__btn rp__btn--save"
                              disabled={!editTitle.trim()}
                              onClick={() => handleUpdateTitle(r.id)}
                            >
                              Save
                            </button>
                            <button
                              type="button"
                              className="rp__btn rp__btn--ghost"
                              onClick={() => setEditingResId(null)}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <h3 className="rp__card-title">{r.title}</h3>
                      )}

                      <p className="rp__dept">
                        {dept ? `${dept.name} · Year ${dept.year}` : `Department ID: ${r.departmentId}`}
                      </p>
                    </div>

                    <div className="rp__footer">
                      <a
                        className={`rp__link${isYoutube ? ' rp__link--video' : ''}`}
                        href={isYoutube ? r.fileUrl : `http://localhost:8081${r.fileUrl}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {isYoutube ? 'Watch video' : 'Open file'}
                      </a>

                      {/* Teacher modify & delete options */}
                      {user && user.role === 'TEACHER' && editingResId !== r.id && (
                        <div className="rp__actions">
                          <button
                            type="button"
                            className="rp__btn rp__btn--edit"
                            onClick={() => { setEditingResId(r.id); setEditTitle(r.title) }}
                          >
                            ✏️ Rename
                          </button>
                          <button
                            type="button"
                            className="rp__btn rp__btn--delete"
                            onClick={() => setDeleteTarget(r)}
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </article>
                )
              })}
            </div>
          </>
        )}
      </div>

      {/* Delete confirmation */}
      {deleteTarget && (
        <div className="rp__overlay" onClick={() => setDeleteTarget(null)}>
          <div
            className="rp__dialog"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="rp-del-title"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="rp-del-title">Delete this resource?</h2>
            <p>“{deleteTarget.title}” will be removed for everyone. This can't be undone.</p>
            <div className="rp__dialog-actions">
              <button type="button" className="rp__btn rp__btn--ghost" onClick={() => setDeleteTarget(null)}>
                Cancel
              </button>
              <button type="button" className="rp__btn rp__btn--danger" onClick={confirmDelete}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div
          className={`rp__toast${toast.type === 'error' ? ' rp__toast--error' : ''}`}
          role="status"
          aria-live="polite"
        >
          {toast.message}
        </div>
      )}
    </div>
  )
}

export default Resources