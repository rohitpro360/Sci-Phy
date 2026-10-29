import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import axios from 'axios'

const AUTH_API = 'http://localhost:8081/api/auth'

function ForgotPassword() {
  const [step, setStep] = useState(1) // 1: Email, 2: OTP, 3: New Password
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  // Helper to safely extract error message from axios response
  const extractErrorMessage = (err, defaultMsg) => {
    const resData = err.response?.data
    if (typeof resData === 'string') return resData
    if (resData && typeof resData === 'object' && resData.message) return resData.message
    return defaultMsg
  }

  // Step 1: Send OTP request
  const handleSendOtp = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      setError('')
      setMessage('')
      await axios.post(`${AUTH_API}/forgot-password`, { email })
      setMessage('OTP sent to your email! (Check Spring Boot console)')
      setStep(2)
    } catch (err) {
      setError(extractErrorMessage(err, 'User not found with this email!'))
    } finally {
      setLoading(false)
    }
  }

  // Step 2: Verify OTP request
  const handleVerifyOtp = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      setError('')
      setMessage('')
      await axios.post(`${AUTH_API}/verify-otp`, { email, otp })
      setMessage('OTP verified successfully! Now set your new password.')
      setStep(3)
    } catch (err) {
      setError(extractErrorMessage(err, 'Invalid or expired OTP!'))
    } finally {
      setLoading(false)
    }
  }

  // Step 3: Reset Password request
  const handleResetPassword = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      setError('')
      setMessage('')
      await axios.post(`${AUTH_API}/reset-password`, { email, password })
      alert('Password reset successful! Please login with your new password.')
      navigate('/login')
    } catch (err) {
      setError(extractErrorMessage(err, 'Failed to reset password. Please try again.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page" style={{ padding: '40px', maxWidth: '420px', margin: '40px auto', background: '#fff', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', fontFamily: 'Segoe UI, sans-serif' }}>
      <h2 style={{ color: '#1e293b', marginBottom: '10px', textAlign: 'center' }}>🔑 Password Recovery</h2>
      <p style={{ textAlign: 'center', color: '#64748b', fontSize: '0.9rem', marginBottom: '25px' }}>
        {step === 1 && 'Enter your registered email to receive an OTP.'}
        {step === 2 && 'Enter the 6-digit OTP sent to your email.'}
        {step === 3 && 'Enter your new secure password.'}
      </p>

      {error && <p style={{ color: '#dc2626', background: '#fee2e2', padding: '10px', borderRadius: '6px', fontSize: '0.85rem', marginBottom: '15px', textAlign: 'center' }}>{error}</p>}
      {message && <p style={{ color: '#16a34a', background: '#dcfce7', padding: '10px', borderRadius: '6px', fontSize: '0.85rem', marginBottom: '15px', textAlign: 'center' }}>{message}</p>}

      {/* Step 1: Email Form */}
      {step === 1 && (
        <form onSubmit={handleSendOtp} style={{ display: 'grid', gap: '15px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', fontSize: '0.9rem' }}>Email Address</label>
            <input 
              type="email" 
              placeholder="student@college.edu" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
            />
          </div>
          <button type="submit" disabled={loading} style={{ background: '#2563eb', color: '#fff', padding: '12px', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: 'pointer', fontSize: '1rem' }}>
            {loading ? 'Sending OTP...' : 'Send OTP'}
          </button>
        </form>
      )}

      {/* Step 2: OTP Form */}
      {step === 2 && (
        <form onSubmit={handleVerifyOtp} style={{ display: 'grid', gap: '15px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', fontSize: '0.9rem' }}>Enter 6-Digit OTP</label>
            <input 
              type="text" 
              maxLength="6"
              placeholder="123456" 
              value={otp} 
              onChange={(e) => setOtp(e.target.value)} 
              required 
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box', letterSpacing: '2px', textAlign: 'center', fontSize: '1.1rem', fontWeight: 'bold' }}
            />
          </div>
          <button type="submit" disabled={loading} style={{ background: '#16a34a', color: '#fff', padding: '12px', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: 'pointer', fontSize: '1rem' }}>
            {loading ? 'Verifying...' : 'Verify OTP'}
          </button>
        </form>
      )}

      {/* Step 3: New Password Form */}
      {step === 3 && (
        <form onSubmit={handleResetPassword} style={{ display: 'grid', gap: '15px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', fontSize: '0.9rem' }}>New Password</label>
            <input 
              type="password" 
              placeholder="Enter new password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
            />
          </div>
          <button type="submit" disabled={loading} style={{ background: '#2563eb', color: '#fff', padding: '12px', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: 'pointer', fontSize: '1rem' }}>
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
      )}

      <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.9rem', color: '#64748b' }}>
        Remembered your password? <Link to="/login" style={{ color: '#2563eb', textDecoration: 'none', fontWeight: '500' }}>Login here</Link>
      </p>
    </div>
  )
}

export default ForgotPassword