import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import logo from '../assets/logo2.png' // make sure the file name matches your asset
import './Navbar.css'

const STORAGE_KEY = 'collegeUser'

// Safe read: a corrupted value in localStorage should never crash the app.
function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY))
  } catch {
    return null
  }
}

const linkClass = ({ isActive }) => `sp-nav__link${isActive ? ' is-active' : ''}`

function Navbar() {
  const navigate = useNavigate()
  const location = useLocation() // re-renders the navbar on every route change
  const user = getStoredUser()
  const isTeacher = user?.role === 'TEACHER'
  const isStudent = user?.role === 'STUDENT'

  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const headerRef = useRef(null)

  // Frosted background only after the page scrolls; transparent at the top.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close the mobile menu after navigating.
  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname])

  // While the menu is open: close on Escape / outside click, and lock page scroll.
  useEffect(() => {
    if (!menuOpen) return undefined

    const onKeyDown = (e) => e.key === 'Escape' && setMenuOpen(false)
    const onPointerDown = (e) => {
      if (headerRef.current && !headerRef.current.contains(e.target)) setMenuOpen(false)
    }

    document.addEventListener('keydown', onKeyDown)
    document.addEventListener('pointerdown', onPointerDown)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('pointerdown', onPointerDown)
      document.body.style.overflow = previousOverflow
    }
  }, [menuOpen])

  const handleLogout = () => {
    localStorage.removeItem(STORAGE_KEY)
    setMenuOpen(false)
    navigate('/', { replace: true })
  }

  return (
    <header
      ref={headerRef}
      className={`sp-nav${scrolled ? ' is-scrolled' : ''}${menuOpen ? ' is-open' : ''}`}
    >
      <div className="sp-nav__inner">
        {/* Brand */}
        <Link to="/" className="sp-nav__brand" aria-label="Sci-Phy home">
          <img src={logo} alt="" className="sp-nav__logo" />
          <span className="sp-nav__name">Sci-Phy</span>
        </Link>

        {/* Mobile menu toggle */}
        <button
          type="button"
          className="sp-nav__toggle"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          aria-controls="sp-nav-menu"
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span className="sp-nav__bar" />
          <span className="sp-nav__bar" />
          <span className="sp-nav__bar" />
        </button>

        {/* Links + actions */}
        <nav id="sp-nav-menu" className="sp-nav__menu" aria-label="Primary">
          <ul className="sp-nav__links">
            <li>
              <NavLink to="/" end className={linkClass}>
                Home
              </NavLink>
            </li>

            {/* Resources: any logged-in user */}
            {user && (
              <li>
                <NavLink to="/resources" className={linkClass}>
                  Resources
                </NavLink>
              </li>
            )}

            {/* Departments + dashboard: teachers only */}
            {isTeacher && (
              <>
                <li>
                  <NavLink to="/departments" className={linkClass}>
                    Departments
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/teacher-dashboard" className={linkClass}>
                    Teacher Dashboard
                  </NavLink>
                </li>
              </>
            )}
          </ul>

          <div className="sp-nav__actions">
            {isStudent && (
              <span className="sp-nav__user" title={user.email}>
                <span className="sp-nav__avatar" aria-hidden="true">
                  {user.email?.charAt(0).toUpperCase()}
                </span>
                <span className="sp-nav__email">{user.email}</span>
              </span>
            )}

            {user ? (
              <button type="button" className="sp-btn sp-btn--danger" onClick={handleLogout}>
                Log out
              </button>
            ) : (
              <>
                <NavLink to="/login" className="sp-btn sp-btn--ghost">
                  Log in
                </NavLink>
                <NavLink to="/register" className="sp-btn sp-btn--primary">
                  Sign up
                </NavLink>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  )
}

export default Navbar