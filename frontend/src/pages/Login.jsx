import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'

const LOGIN_API = 'http://localhost:8081/api/auth/login'
const STORAGE_KEY = 'collegeUser'
const ROLE_LABEL = { STUDENT: 'Student', TEACHER: 'Teacher' }

// Turns any failed request into a clear, human-readable message.
function getErrorMessage(err) {
  if (!err.response) return 'Cannot reach the server. Check your connection and try again.'

  const { status, data } = err.response
  if (status === 401) return 'Incorrect email or password.'

  const serverMessage = typeof data === 'string' ? data : data?.message
  if (serverMessage && serverMessage.length < 140) return serverMessage
  if (status === 400) return 'Incorrect email or password.'
  return 'Something went wrong. Please try again.'
}

function Login() {
  const navigate = useNavigate()
  const [role, setRole] = useState('STUDENT')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e) => {
    e.preventDefault()
    if (loading) return
    setError('')

    try {
      setLoading(true)
      const res = await axios.post(LOGIN_API, { email: email.trim(), password })
      const userData = res.data
      const actualRole = userData?.role

      // The "Log in as" choice must match the account's real role.
      if (actualRole !== role) {
        setError(
          ROLE_LABEL[actualRole]
            ? `This is a ${ROLE_LABEL[actualRole].toLowerCase()} account. Select “${ROLE_LABEL[actualRole]}” above and try again.`
            : 'Unexpected response from the server. Please try again.'
        )
        return
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(userData))
      navigate(actualRole === 'TEACHER' ? '/teacher-dashboard' : '/resources', { replace: true })
    } catch (err) {
      console.error(err)
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <style>{STYLES}</style>

      <div className="lg">
        <div className="lg-card">
          <header className="lg-head">
            <span className="lg-icon" aria-hidden="true">
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
                <rect x="3" y="11" width="18" height="11" rx="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </span>
            <h1 className="lg-title">Welcome back</h1>
            <p className="lg-sub">Log in to access your college resources.</p>
          </header>

          <form className="lg-form" onSubmit={handleLogin} noValidate={false}>
            {/* Role selector */}
            <fieldset className="lg-field lg-fieldset">
              <legend className="lg-label">Log in as</legend>
              <div className="lg-seg">
                {Object.entries(ROLE_LABEL).map(([value, label]) => (
                  <label key={value} className="lg-seg__opt">
                    <input
                      type="radio"
                      name="role"
                      value={value}
                      checked={role === value}
                      onChange={() => {
                        setRole(value)
                        setError('')
                      }}
                    />
                    <span>{label}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            {/* Email */}
            <div className="lg-field">
              <label className="lg-label" htmlFor="lg-email">
                Email address
              </label>
              <input
                id="lg-email"
                className="lg-input"
                type="email"
                inputMode="email"
                autoComplete="email"
                autoCapitalize="none"
                spellCheck="false"
                placeholder={role === 'TEACHER' ? 'teacher@college.com' : 'student@college.edu'}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-describedby={error ? 'lg-error' : undefined}
                required
              />
            </div>

            {/* Password */}
            <div className="lg-field">
              <div className="lg-row">
                <label className="lg-label" htmlFor="lg-password">
                  Password
                </label>
                <Link to="/forgot-password" className="lg-link">
                  Forgot password?
                </Link>
              </div>
              <div className="lg-pass">
                <input
                  id="lg-password"
                  className="lg-input"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  aria-describedby={error ? 'lg-error' : undefined}
                  required
                />
                <button
                  type="button"
                  className="lg-toggle"
                  onClick={() => setShowPassword((s) => !s)}
                  aria-pressed={showPassword}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div id="lg-error" className="lg-error" role="alert">
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

            <button type="submit" className="lg-submit" disabled={loading}>
              {loading && <span className="lg-spinner" aria-hidden="true" />}
              {loading ? 'Logging in…' : 'Log in'}
            </button>
          </form>

          <footer className="lg-foot">
            <p>
              New student? <Link to="/register" className="lg-link">Create an account</Link>
            </p>
            <p>Registration is open to students only.</p>
          </footer>
        </div>
      </div>
    </>
  )
}

/* ---------------------------------------------------------------------------
   Styles (kept in this file on purpose; every class is prefixed "lg-")
--------------------------------------------------------------------------- */
const STYLES = `
.lg {
  --lg-ink: #0f172a;
  --lg-text: #334155;
  --lg-muted: #64748b;
  --lg-line: #e2e8f0;
  --lg-blue: #2563eb;
  --lg-blue-dark: #1d4ed8;

  box-sizing: border-box;
  display: grid;
  place-items: center;
  min-height: calc(100vh - 96px);
  min-height: calc(100dvh - 96px);
  padding: clamp(16px, 4vw, 40px) 16px 56px;
  font-family: 'Segoe UI', system-ui, -apple-system, Roboto, sans-serif;
  color: var(--lg-text);
  text-align: left;
}

.lg *,
.lg *::before,
.lg *::after {
  box-sizing: border-box;
}

.lg h1,
.lg p {
  margin: 0;
}

/* ---------- Card ---------- */

.lg-card {
  width: 100%;
  max-width: 440px;
  padding: clamp(24px, 5vw, 40px);
  background: #fff;
  border: 1px solid var(--lg-line);
  border-radius: 16px;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04), 0 12px 32px -16px rgba(15, 23, 42, 0.18);
}

.lg-head {
  margin-bottom: 28px;
  text-align: center;
}

.lg-icon {
  display: grid;
  place-items: center;
  width: 52px;
  height: 52px;
  margin: 0 auto 16px;
  background: #eff6ff;
  border-radius: 14px;
  color: var(--lg-blue);
}

.lg-title {
  font-family: Georgia, 'Times New Roman', serif;
  font-size: clamp(1.6rem, 2vw + 1rem, 2rem);
  font-weight: 700;
  line-height: 1.2;
  color: var(--lg-ink);
}

.lg-sub {
  margin-top: 8px;
  line-height: 1.5;
  color: var(--lg-muted);
}

/* ---------- Form ---------- */

.lg-form {
  display: grid;
  gap: 18px;
}

.lg-field {
  display: grid;
  gap: 6px;
}

.lg-fieldset {
  min-width: 0;
  margin: 0;
  padding: 0;
  border: 0;
}

.lg-label {
  padding: 0;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--lg-ink);
}

.lg-row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
}

.lg-input {
  width: 100%;
  height: 46px;
  padding: 0 14px;
  background: #fff;
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  font: inherit;
  font-size: 1rem; /* 16px stops iOS from zooming into the field */
  color: var(--lg-ink);
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.lg-input::placeholder {
  color: #94a3b8;
}

.lg-input:hover {
  border-color: #94a3b8;
}

.lg-input:focus {
  outline: none;
  border-color: var(--lg-blue);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.18);
}

/* ---------- Role selector (segmented control) ---------- */

.lg-seg {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4px;
  padding: 4px;
  background: #f1f5f9;
  border-radius: 12px;
}

.lg-seg__opt {
  position: relative;
}

.lg-seg__opt input {
  position: absolute;
  inset: 0;
  margin: 0;
  opacity: 0;
  cursor: pointer;
}

.lg-seg__opt span {
  display: block;
  padding: 10px 12px;
  border-radius: 9px;
  text-align: center;
  font-weight: 600;
  color: var(--lg-muted);
  transition: background-color 0.2s ease, color 0.2s ease, box-shadow 0.2s ease;
}

.lg-seg__opt input:checked + span {
  background: #fff;
  color: var(--lg-ink);
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.14);
}

.lg-seg__opt input:focus-visible + span {
  outline: 2px solid var(--lg-blue);
  outline-offset: 2px;
}

/* ---------- Password field ---------- */

.lg-pass {
  position: relative;
}

.lg-pass .lg-input {
  padding-right: 72px;
}

.lg-toggle {
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
  color: var(--lg-blue);
  cursor: pointer;
  transform: translateY(-50%);
}

.lg-toggle:hover {
  background: #eff6ff;
}

/* ---------- Links ---------- */

.lg-link {
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--lg-blue);
  text-decoration: none;
}

.lg-link:hover {
  text-decoration: underline;
}

.lg-card a:focus-visible,
.lg-card button:focus-visible {
  outline: 2px solid var(--lg-blue);
  outline-offset: 2px;
  border-radius: 6px;
}

/* ---------- Error ---------- */

.lg-error {
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

.lg-error svg {
  flex-shrink: 0;
  margin-top: 1px;
}

/* ---------- Submit ---------- */

.lg-submit {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: 100%;
  height: 48px;
  background: var(--lg-blue);
  border: 0;
  border-radius: 10px;
  box-shadow: 0 1px 2px rgba(37, 99, 235, 0.35);
  font: inherit;
  font-size: 1rem;
  font-weight: 600;
  color: #fff;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.lg-submit:hover:not(:disabled) {
  background: var(--lg-blue-dark);
}

.lg-submit:disabled {
  opacity: 0.8;
  cursor: progress;
}

.lg-spinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.4);
  border-top-color: #fff;
  border-radius: 50%;
  animation: lg-spin 0.7s linear infinite;
}

@keyframes lg-spin {
  to {
    transform: rotate(360deg);
  }
}

/* ---------- Footer ---------- */

.lg-foot {
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid var(--lg-line);
  text-align: center;
  font-size: 0.92rem;
  line-height: 1.6;
  color: var(--lg-muted);
}

.lg-foot .lg-link {
  font-size: inherit;
}

/* ---------- Small screens ---------- */

@media (max-width: 480px) {
  .lg {
    align-items: start;
    padding-top: 12px;
  }

  .lg-card {
    border-radius: 14px;
  }

  .lg-head {
    margin-bottom: 22px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .lg-spinner {
    animation-duration: 2s;
  }
  .lg-input,
  .lg-seg__opt span,
  .lg-submit {
    transition: none;
  }
}
`

export default Login