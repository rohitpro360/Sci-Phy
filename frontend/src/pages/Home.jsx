import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import QuoteCarousel from '../components/QuoteCarousel'
import './Home.css'

const USERS_API = 'http://localhost:8081/api/users'
const STORAGE_KEY = 'collegeUser'
const TEACHER_FALLBACK_NAME = 'Mrs. Vandana Patil'

const CONFIRM_COPY = {
  block: {
    title: 'Block this student?',
    button: 'Block student',
    tone: 'warning',
    body: (name) => `${name} will be marked as blocked. You can unblock the account at any time.`,
  },
  unblock: {
    title: 'Unblock this student?',
    button: 'Unblock student',
    tone: 'success',
    body: (name) => `${name} will be marked as active again.`,
  },
  delete: {
    title: 'Delete this record?',
    button: 'Delete permanently',
    tone: 'danger',
    body: (name) => `${name}’s record will be permanently deleted. This cannot be undone.`,
  },
}

const TOAST_COPY = {
  block: (name) => `${name} was blocked.`,
  unblock: (name) => `${name} was unblocked.`,
  delete: (name) => `${name} was deleted.`,
}

// Safe read: a corrupted value in localStorage should never crash the page.
function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY))
  } catch {
    return null
  }
}

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

const displayName = (student) => student.name || 'Student'

function Icon({ children }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="22"
      height="22"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  )
}

const FEATURES = [
  {
    title: 'Departments and subjects',
    text: 'Find study material organised the way your college is: by department and subject.',
    icon: (
      <Icon>
        <path d="M2 4h6a4 4 0 0 1 4 4v12a3 3 0 0 0-3-3H2z" />
        <path d="M22 4h-6a4 4 0 0 0-4 4v12a3 3 0 0 1 3-3h7z" />
      </Icon>
    ),
  },
  {
    title: 'Notes and resources',
    text: 'Access notes and study material shared by your teachers, all in one place.',
    icon: (
      <Icon>
        <path d="M12 2 2 7l10 5 10-5-10-5z" />
        <path d="m2 17 10 5 10-5" />
        <path d="m2 12 10 5 10-5" />
      </Icon>
    ),
  },
  {
    title: 'Role-based access',
    text: 'Teachers manage content and student accounts, while students browse and learn.',
    icon: (
      <Icon>
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </Icon>
    ),
  },
]

function Home() {
  const user = useMemo(getStoredUser, [])
  const isTeacher = user?.role === 'TEACHER'

  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(isTeacher)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [confirm, setConfirm] = useState(null) // { type, student }
  const [busy, setBusy] = useState(false)
  const [toast, setToast] = useState(null) // { type, message }

  const fetchStudents = useCallback(async ({ silent = false } = {}) => {
    try {
      if (!silent) setLoading(true)
      setError('')
      const res = await axios.get(`${USERS_API}/students`)
      setStudents(Array.isArray(res.data) ? res.data : [])
    } catch (err) {
      console.error('Error fetching students:', err)
      setError('We could not load the student records. Check that the server is running, then try again.')
    } finally {
      if (!silent) setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (isTeacher) fetchStudents()
  }, [isTeacher, fetchStudents])

  // Auto-dismiss the toast.
  useEffect(() => {
    if (!toast) return undefined
    const timer = setTimeout(() => setToast(null), 3500)
    return () => clearTimeout(timer)
  }, [toast])

  // Close the confirmation dialog with Escape.
  useEffect(() => {
    if (!confirm) return undefined
    const onKeyDown = (e) => e.key === 'Escape' && !busy && setConfirm(null)
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [confirm, busy])

  const visibleStudents = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return students
    return students.filter((s) =>
      [s.id, s.name, s.email].some((value) => String(value ?? '').toLowerCase().includes(q))
    )
  }, [students, query])

  const blockedCount = students.filter((s) => s.blocked).length
  const activeCount = students.length - blockedCount

  const runConfirmedAction = async () => {
    if (!confirm) return
    const { type, student } = confirm
    const name = displayName(student)

    try {
      setBusy(true)
      if (type === 'delete') {
        await axios.delete(`${USERS_API}/students/${student.id}`)
        setStudents((prev) => prev.filter((s) => s.id !== student.id))
      } else {
        await axios.put(`${USERS_API}/students/${student.id}/block`)
        await fetchStudents({ silent: true })
      }
      setToast({ type: 'success', message: TOAST_COPY[type](name) })
    } catch (err) {
      console.error(err)
      setToast({ type: 'error', message: `Could not ${type} ${name}. Please try again.` })
    } finally {
      setBusy(false)
      setConfirm(null)
    }
  }

  const welcomeName = user?.name || (isTeacher ? TEACHER_FALLBACK_NAME : user?.email)
  const confirmCopy = confirm ? CONFIRM_COPY[confirm.type] : null

  return (
    <div className="home">
      {/* ---------- Logged out ---------- */}
      {!user && (
        <>
          <section className="home-hero">
            <h1 className="home-hero__title">Welcome to Sci-Phy</h1>
            <p className="home-hero__lead">
              A unified platform for students and teachers to manage departments, subjects, notes and
              academic resources efficiently.
            </p>
            <div className="home-hero__actions">
              <Link to="/login" className="home-btn home-btn--primary home-btn--lg">
                Log in
              </Link>
              <Link to="/register" className="home-btn home-btn--secondary home-btn--lg">
                Student sign up
              </Link>
            </div>
            <p className="home-hero__note">
              Teachers and students can log in. Registration is open to students only.
            </p>
          </section>

          <ul className="home-features">
            {FEATURES.map((feature) => (
              <li key={feature.title} className="home-feature">
                <span className="home-feature__icon">{feature.icon}</span>
                <h2 className="home-feature__title">{feature.title}</h2>
                <p className="home-feature__text">{feature.text}</p>
              </li>
            ))}
          </ul>
        </>
      )}

      {/* ---------- Logged in ---------- */}
      {user && (
        <>
          <section className="home-welcome">
            <div>
              <p className="home-welcome__greeting">{getGreeting()},</p>
              <h1 className="home-welcome__name">Dr. Vandana Patil</h1>
              <p className="home-welcome__text">
                {isTeacher
                  ? 'You are logged in as a teacher. You can view, manage, block and delete registered student accounts below.'
                  : 'Welcome to your student dashboard. Access your department study materials from the resources section.'}
              </p>
            </div>
            {!isTeacher && (
              <Link to="/resources" className="home-btn home-btn--primary">
                Browse resources
              </Link>
            )}
          </section>

          {/* Teacher only: student directory */}
          {isTeacher && (
            <section className="home-panel" aria-labelledby="directory-title">
              <header className="home-panel__head">
                <div>
                  <h2 id="directory-title" className="home-panel__title">
                    Registered students
                  </h2>
                  <p className="home-panel__sub">Review, block or remove student accounts.</p>
                </div>
                <div className="home-stats">
                  <div className="home-stat">
                    <span className="home-stat__value">{students.length}</span>
                    <span className="home-stat__label">Total</span>
                  </div>
                  <div className="home-stat home-stat--ok">
                    <span className="home-stat__value">{activeCount}</span>
                    <span className="home-stat__label">Active</span>
                  </div>
                  <div className="home-stat home-stat--bad">
                    <span className="home-stat__value">{blockedCount}</span>
                    <span className="home-stat__label">Blocked</span>
                  </div>
                </div>
              </header>

              <div className="home-toolbar">
                <label className="home-search">
                  <svg
                    viewBox="0 0 24 24"
                    width="18"
                    height="18"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    aria-hidden="true"
                  >
                    <circle cx="11" cy="11" r="7" />
                    <path d="m21 21-4.3-4.3" />
                  </svg>
                  <input
                    type="search"
                    placeholder="Search by name, email or ID"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    aria-label="Search students"
                  />
                </label>
                <button
                  type="button"
                  className="home-btn home-btn--ghost"
                  onClick={() => fetchStudents()}
                  disabled={loading}
                >
                  Refresh
                </button>
              </div>

              {loading ? (
                <div className="home-state" role="status">
                  <span className="home-spinner" aria-hidden="true" />
                  Loading student records…
                </div>
              ) : error ? (
                <div className="home-state home-state--error" role="alert">
                  <p>{error}</p>
                  <button type="button" className="home-btn home-btn--secondary" onClick={() => fetchStudents()}>
                    Try again
                  </button>
                </div>
              ) : students.length === 0 ? (
                <div className="home-state">No students have registered on the portal yet.</div>
              ) : visibleStudents.length === 0 ? (
                <div className="home-state">No students match “{query}”.</div>
              ) : (
                <table className="home-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Student</th>
                      <th>Email</th>
                      <th>Status</th>
                      <th className="home-table__right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleStudents.map((st) => (
                      <tr key={st.id}>
                        <td className="home-table__id" data-label="ID">
                          #{st.id}
                        </td>
                        <td data-label="Student">
                          <div className="home-person">
                            <span className="home-person__avatar" aria-hidden="true">
                              {displayName(st).charAt(0).toUpperCase()}
                            </span>
                            <span className="home-person__name">{displayName(st)}</span>
                          </div>
                        </td>
                        <td className="home-email" data-label="Email">
                          {st.email}
                        </td>
                        <td data-label="Status">
                          <span className={`home-pill ${st.blocked ? 'home-pill--blocked' : 'home-pill--active'}`}>
                            {st.blocked ? 'Blocked' : 'Active'}
                          </span>
                        </td>
                        <td className="home-cell-actions" data-label="Actions">
                          <div className="home-actions">
                            <button
                              type="button"
                              className={`home-act ${st.blocked ? 'home-act--ok' : 'home-act--warn'}`}
                              onClick={() => setConfirm({ type: st.blocked ? 'unblock' : 'block', student: st })}
                            >
                              {st.blocked ? 'Unblock' : 'Block'}
                            </button>
                            <button
                              type="button"
                              className="home-act home-act--danger"
                              onClick={() => setConfirm({ type: 'delete', student: st })}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </section>
          )}
        </>
      )}

      {/* ---------- Quotes (everyone) ---------- */}
      <section className="home-section" aria-labelledby="quotes-title">
        <div className="home-section__head">
          <h2 id="quotes-title" className="home-section__title">
            Inspiration from the greats
          </h2>
          <p className="home-section__sub">A fresh thought from the minds that shaped science and learning.</p>
        </div>
        <QuoteCarousel />
      </section>

      {/* ---------- Confirmation dialog ---------- */}
      {confirm && (
        <div className="home-modal" onClick={() => !busy && setConfirm(null)}>
          <div
            className="home-modal__box"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="confirm-title"
            aria-describedby="confirm-text"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 id="confirm-title" className="home-modal__title">
              {confirmCopy.title}
            </h3>
            <p id="confirm-text" className="home-modal__text">
              {confirmCopy.body(displayName(confirm.student))}
            </p>
            <div className="home-modal__actions">
              <button
                type="button"
                className="home-btn home-btn--ghost"
                onClick={() => setConfirm(null)}
                disabled={busy}
                autoFocus
              >
                Cancel
              </button>
              <button
                type="button"
                className={`home-btn home-btn--${confirmCopy.tone}`}
                onClick={runConfirmedAction}
                disabled={busy}
              >
                {busy ? 'Please wait…' : confirmCopy.button}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------- Toast ---------- */}
      {toast && (
        <div className={`home-toast home-toast--${toast.type}`} role="status" aria-live="polite">
          {toast.message}
        </div>
      )}
    </div>
  )
}

export default Home