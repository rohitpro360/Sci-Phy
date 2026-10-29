import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'

const AUTH_API = 'http://localhost:8081/api/auth/register'
const DEPT_API = 'http://localhost:8081/api/departments'
const MIN_PASSWORD_LENGTH = 6
const REDIRECT_DELAY_MS = 2500

// Simple visual strength hint (does not block submission).
function getPasswordStrength(password) {
  if (!password) return { score: 0, label: '' }
  let score = 0
  if (password.length >= 8) score += 1
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1
  if (/\d/.test(password)) score += 1
  if (/[^A-Za-z0-9]/.test(password)) score += 1
  if (password.length < MIN_PASSWORD_LENGTH) score = Math.min(score, 1)
  score = Math.max(score, 1)
  return { score, label: ['', 'Weak', 'Fair', 'Good', 'Strong'][score] }
}

// Turns any failed request into a clear, human-readable message.
function getErrorMessage(err) {
  if (!err.response) return 'Cannot reach the server. Check your connection and try again.'

  const { status, data } = err.response
  if (status === 409) return 'An account with this email already exists. Try logging in instead.'

  const serverMessage = typeof data === 'string' ? data : data?.message
  if (serverMessage && serverMessage.length < 140) return serverMessage
  return 'Registration failed. Please check your details and try again.'
}

function Register() {
  const navigate = useNavigate()
  const redirectTimer = useRef(null)

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [departmentId, setDepartmentId] = useState('')

  const [departments, setDepartments] = useState([])
  const [deptStatus, setDeptStatus] = useState('loading') // 'loading' | 'ready' | 'error'
  const [deptReload, setDeptReload] = useState(0)

  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  // Load departments for the dropdown.
  useEffect(() => {
    const controller = new AbortController()
    setDeptStatus('loading')

    axios
      .get(DEPT_API, { signal: controller.signal })
      .then((res) => {
        setDepartments(Array.isArray(res.data) ? res.data : [])
        setDeptStatus('ready')
      })
      .catch((err) => {
        if (axios.isCancel(err)) return
        console.error('Could not fetch departments:', err)
        setDeptStatus('error')
      })

    return () => controller.abort()
  }, [deptReload])

  // Never leave a pending redirect behind if the user leaves the page.
  useEffect(() => () => clearTimeout(redirectTimer.current), [])

  const strength = getPasswordStrength(password)
  const mismatch = confirm.length > 0 && confirm !== password

  const handleRegister = async (e) => {
    e.preventDefault()
    if (loading) return
    setError('')

    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters long.`)
      return
    }
    if (password !== confirm) {
      setError('The two passwords do not match.')
      return
    }
    if (!departmentId) {
      setError('Please select your department.')
      return
    }

    try {
      setLoading(true)
      await axios.post(AUTH_API, {
        name: name.trim(),
        email: email.trim(),
        password,
        role: 'STUDENT',
        departmentId: Number(departmentId),
      })

      setSuccess(true)
      redirectTimer.current = setTimeout(() => navigate('/login'), REDIRECT_DELAY_MS)
    } catch (err) {
      console.error(err)
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  const deptPlaceholder =
    deptStatus === 'loading'
      ? 'Loading departments…'
      : deptStatus === 'error'
        ? 'Could not load departments'
        : departments.length === 0
          ? 'No departments available'
          : 'Select your department'

  return (
    <>
      <style>{STYLES}</style>

      <div className="rg">
        <div className="rg-card">
          {success ? (
            /* ---------- Success ---------- */
            <div className="rg-done" role="status">
              <span className="rg-icon rg-icon--ok" aria-hidden="true">
                <svg
                  viewBox="0 0 24 24"
                  width="28"
                  height="28"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              </span>
              <h1 className="rg-title">Account created</h1>
              <p className="rg-sub">Your student account is ready. Taking you to the login page…</p>
              <Link to="/login" className="rg-submit rg-submit--link">
                Go to login now
              </Link>
            </div>
          ) : (
            <>
              <header className="rg-head">
                <span className="rg-icon" aria-hidden="true">
                  <svg
                    viewBox="0 0 24 24"
                    width="26"
                    height="26"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M19 8v6M22 11h-6" />
                  </svg>
                </span>
                <h1 className="rg-title">Create your student account</h1>
                <p className="rg-sub">Register to access your department’s study materials.</p>
              </header>

              <form className="rg-form" onSubmit={handleRegister}>
                {/* Full name */}
                <div className="rg-field">
                  <label className="rg-label" htmlFor="rg-name">
                    Full name
                  </label>
                  <input
                    id="rg-name"
                    className="rg-input"
                    type="text"
                    autoComplete="name"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                {/* Email */}
                <div className="rg-field">
                  <label className="rg-label" htmlFor="rg-email">
                    Email address
                  </label>
                  <input
                    id="rg-email"
                    className="rg-input"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    autoCapitalize="none"
                    spellCheck="false"
                    placeholder="student@college.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                {/* Department */}
                <div className="rg-field">
                  <label className="rg-label" htmlFor="rg-dept">
                    Department
                  </label>
                  <select
                    id="rg-dept"
                    className="rg-input rg-select"
                    value={departmentId}
                    onChange={(e) => setDepartmentId(e.target.value)}
                    disabled={deptStatus !== 'ready' || departments.length === 0}
                    required
                  >
                    <option value="">{deptPlaceholder}</option>
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                  {deptStatus === 'error' && (
                    <p className="rg-hint rg-hint--error">
                      We couldn’t load the departments.{' '}
                      <button type="button" className="rg-linkbtn" onClick={() => setDeptReload((k) => k + 1)}>
                        Try again
                      </button>
                    </p>
                  )}
                </div>

                {/* Password */}
                <div className="rg-field">
                  <label className="rg-label" htmlFor="rg-password">
                    Password
                  </label>
                  <div className="rg-pass">
                    <input
                      id="rg-password"
                      className="rg-input"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      placeholder="Create a password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      minLength={MIN_PASSWORD_LENGTH}
                      required
                    />
                    <button
                      type="button"
                      className="rg-toggle"
                      onClick={() => setShowPassword((s) => !s)}
                      aria-pressed={showPassword}
                      aria-label={showPassword ? 'Hide passwords' : 'Show passwords'}
                    >
                      {showPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>

                  {password ? (
                    <div className="rg-strength" aria-live="polite">
                      <div className="rg-strength__bars" aria-hidden="true">
                        {[1, 2, 3, 4].map((n) => (
                          <span
                            key={n}
                            className={`rg-strength__bar${n <= strength.score ? ` is-on is-${strength.score}` : ''}`}
                          />
                        ))}
                      </div>
                      <span className="rg-strength__label">{strength.label}</span>
                    </div>
                  ) : (
                    <p className="rg-hint">Use at least {MIN_PASSWORD_LENGTH} characters.</p>
                  )}
                </div>

                {/* Confirm password */}
                <div className="rg-field">
                  <label className="rg-label" htmlFor="rg-confirm">
                    Confirm password
                  </label>
                  <input
                    id="rg-confirm"
                    className="rg-input"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    placeholder="Re-enter your password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    aria-invalid={mismatch}
                    required
                  />
                  {mismatch && <p className="rg-hint rg-hint--error">Passwords don’t match.</p>}
                </div>

                {/* Error */}
                {error && (
                  <div className="rg-error" role="alert">
                    <svg
                      viewBox="0 0 24 24"
                      width="18"
                      height="18"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <path d="M12 8v4M12 16h.01" />
                    </svg>
                    <span>{error}</span>
                  </div>
                )}

                <button type="submit" className="rg-submit" disabled={loading}>
                  {loading && <span className="rg-spinner" aria-hidden="true" />}
                  {loading ? 'Creating account…' : 'Create account'}
                </button>
              </form>

              <footer className="rg-foot">
                <p>
                  Already have an account?{' '}
                  <Link to="/login" className="rg-link">
                    Log in
                  </Link>
                </p>
              </footer>
            </>
          )}
        </div>
      </div>
    </>
  )
}

/* ---------------------------------------------------------------------------
   Styles (kept in this file on purpose; every class is prefixed "rg-")
--------------------------------------------------------------------------- */
const STYLES = `
.rg {
  --rg-ink: #0f172a;
  --rg-text: #334155;
  --rg-muted: #64748b;
  --rg-line: #e2e8f0;
  --rg-blue: #2563eb;
  --rg-blue-dark: #1d4ed8;

  box-sizing: border-box;
  display: grid;
  place-items: center;
  min-height: calc(100vh - 96px);
  min-height: calc(100dvh - 96px);
  padding: clamp(16px, 4vw, 40px) 16px 56px;
  font-family: 'Segoe UI', system-ui, -apple-system, Roboto, sans-serif;
  color: var(--rg-text);
  text-align: left;
}

.rg *,
.rg *::before,
.rg *::after {
  box-sizing: border-box;
}

.rg h1,
.rg p {
  margin: 0;
}

/* ---------- Card ---------- */

.rg-card {
  width: 100%;
  max-width: 480px;
  padding: clamp(24px, 5vw, 40px);
  background: #fff;
  border: 1px solid var(--rg-line);
  border-radius: 16px;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04), 0 12px 32px -16px rgba(15, 23, 42, 0.18);
}

.rg-head {
  margin-bottom: 28px;
  text-align: center;
}

.rg-icon {
  display: grid;
  place-items: center;
  width: 52px;
  height: 52px;
  margin: 0 auto 16px;
  background: #eff6ff;
  border-radius: 14px;
  color: var(--rg-blue);
}

.rg-icon--ok {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: #d1fae5;
  color: #047857;
}

.rg-title {
  font-family: Georgia, 'Times New Roman', serif;
  font-size: clamp(1.5rem, 2vw + 1rem, 1.9rem);
  font-weight: 700;
  line-height: 1.2;
  color: var(--rg-ink);
}

.rg-sub {
  margin-top: 8px;
  line-height: 1.5;
  color: var(--rg-muted);
}

/* ---------- Form ---------- */

.rg-form {
  display: grid;
  gap: 18px;
}

.rg-field {
  display: grid;
  gap: 6px;
}

.rg-label {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--rg-ink);
}

.rg-input {
  width: 100%;
  height: 46px;
  padding: 0 14px;
  background: #fff;
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  font: inherit;
  font-size: 1rem; /* 16px stops iOS from zooming into the field */
  color: var(--rg-ink);
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.rg-input::placeholder {
  color: #94a3b8;
}

.rg-input:hover:not(:disabled) {
  border-color: #94a3b8;
}

.rg-input:focus {
  outline: none;
  border-color: var(--rg-blue);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.18);
}

.rg-input[aria-invalid='true'] {
  border-color: #dc2626;
}

.rg-input:disabled {
  background-color: #f8fafc;
  color: var(--rg-muted);
  cursor: not-allowed;
}

.rg-select {
  appearance: none;
  -webkit-appearance: none;
  padding-right: 40px;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 14px center;
  cursor: pointer;
}

/* ---------- Password field ---------- */

.rg-pass {
  position: relative;
}

.rg-pass .rg-input {
  padding-right: 72px;
}

.rg-toggle {
  position: absolute;
  top: 50%;
  right: 6px;
  height: 34px;
  padding: 0 10px;
  background: transparent;
  border: 0;
  border-radius: 8px;
  font: inherit;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--rg-blue);
  cursor: pointer;
  transform: translateY(-50%);
}

.rg-toggle:hover {
  background: #eff6ff;
}

.rg-strength {
  display: flex;
  align-items: center;
  gap: 10px;
}

.rg-strength__bars {
  display: flex;
  flex: 1;
  gap: 4px;
}

.rg-strength__bar {
  flex: 1;
  height: 4px;
  border-radius: 4px;
  background: var(--rg-line);
  transition: background-color 0.2s ease;
}

.rg-strength__bar.is-on.is-1 { background: #dc2626; }
.rg-strength__bar.is-on.is-2 { background: #f59e0b; }
.rg-strength__bar.is-on.is-3 { background: #65a30d; }
.rg-strength__bar.is-on.is-4 { background: #059669; }

.rg-strength__label {
  min-width: 48px;
  font-size: 0.8rem;
  font-weight: 600;
  text-align: right;
  color: var(--rg-muted);
}

.rg-hint {
  font-size: 0.82rem;
  line-height: 1.4;
  color: var(--rg-muted);
}

.rg-hint--error {
  color: #b91c1c;
}

/* ---------- Links ---------- */

.rg-link,
.rg-linkbtn {
  font-weight: 600;
  color: var(--rg-blue);
  text-decoration: none;
}

.rg-link:hover,
.rg-linkbtn:hover {
  text-decoration: underline;
}

.rg-linkbtn {
  padding: 0;
  background: none;
  border: 0;
  font: inherit;
  cursor: pointer;
}

.rg-card a:focus-visible,
.rg-card button:focus-visible,
.rg-card select:focus-visible {
  outline: 2px solid var(--rg-blue);
  outline-offset: 2px;
  border-radius: 6px;
}

/* ---------- Error ---------- */

.rg-error {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px 14px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 10px;
  font-size: 0.92rem;
  line-height: 1.45;
  color: #991b1b;
}

.rg-error svg {
  flex-shrink: 0;
  margin-top: 1px;
}

/* ---------- Submit ---------- */

.rg-submit {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: 100%;
  height: 48px;
  background: var(--rg-blue);
  border: 0;
  border-radius: 10px;
  box-shadow: 0 1px 2px rgba(37, 99, 235, 0.35);
  font: inherit;
  font-size: 1rem;
  font-weight: 600;
  color: #fff;
  text-decoration: none;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.rg-submit:hover:not(:disabled) {
  background: var(--rg-blue-dark);
}

.rg-submit:disabled {
  opacity: 0.8;
  cursor: progress;
}

.rg-submit--link {
  margin-top: 24px;
}

.rg-spinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.4);
  border-top-color: #fff;
  border-radius: 50%;
  animation: rg-spin 0.7s linear infinite;
}

@keyframes rg-spin {
  to {
    transform: rotate(360deg);
  }
}

/* ---------- Success ---------- */

.rg-done {
  text-align: center;
}

.rg-done .rg-icon {
  margin-bottom: 20px;
}

/* ---------- Footer ---------- */

.rg-foot {
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid var(--rg-line);
  text-align: center;
  font-size: 0.92rem;
  line-height: 1.6;
  color: var(--rg-muted);
}

/* ---------- Small screens ---------- */

@media (max-width: 480px) {
  .rg {
    align-items: start;
    padding-top: 12px;
  }

  .rg-card {
    border-radius: 14px;
  }

  .rg-head {
    margin-bottom: 22px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .rg-spinner {
    animation-duration: 2s;
  }
  .rg-input,
  .rg-submit,
  .rg-strength__bar {
    transition: none;
  }
}
`

export default Register