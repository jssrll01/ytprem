import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import Icon from './Icon.jsx'
import './Navbar.css'

export const NAV_LINKS = [
  { to: '/', label: 'Home', end: true },
  { to: '/tv', label: 'TV Shows' },
  { to: '/movies', label: 'Movies' },
  { to: '/pinoy', label: 'Pinoy' },
  { to: '/new', label: 'New & Popular' },
  { to: '/my-list', label: 'My List' }
]

const BOTTOM_LINKS = [
  { to: '/', label: 'Home', icon: 'home', end: true },
  { to: '/search', label: 'Search', icon: 'search' },
  { to: '/new', label: 'New', icon: 'new' },
  { to: '/my-list', label: 'My List', icon: 'list' },
  { to: '/settings', label: 'Settings', icon: 'settings' }
]

export default function Navbar() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [query, setQuery] = useState(params.get('q') || '')
  const inputRef = useRef(null)
  const profileRef = useRef(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setMenuOpen(false)
    setProfileOpen(false)
    if (pathname !== '/search') {
      setSearchOpen(false)
      setQuery('')
    }
  }, [pathname])

  useEffect(() => {
    if (searchOpen) inputRef.current?.focus()
  }, [searchOpen])

  useEffect(() => {
    if (!profileOpen) return undefined
    const onDown = (e) => {
      if (!profileRef.current?.contains(e.target)) setProfileOpen(false)
    }
    const onKey = (e) => e.key === 'Escape' && setProfileOpen(false)
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [profileOpen])

  const onSearchChange = (e) => {
    const value = e.target.value
    setQuery(value)
    navigate(value.trim() ? `/search?q=${encodeURIComponent(value)}` : '/search', {
      replace: pathname === '/search'
    })
  }

  const onSearchKey = (e) => {
    if (e.key === 'Escape') {
      setQuery('')
      setSearchOpen(false)
    }
  }

  return (
    <>
      <header className={`navbar${scrolled || menuOpen ? ' navbar--solid' : ''}`}>
        <Link to="/" className="logo" aria-label="YT PREMIUM home">YT PREMIUM</Link>

        <nav className="navbar__links" aria-label="Primary">
          {NAV_LINKS.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} className="navbar__link">
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="navbar__right">
          <div className={`navbar__search${searchOpen ? ' is-open' : ''}`} role="search">
            <button
              type="button"
              className="icon-btn"
              aria-label="Search"
              aria-expanded={searchOpen}
              onClick={() => setSearchOpen((v) => !v)}
            >
              <Icon name="search" size={22} />
            </button>
            <input
              ref={inputRef}
              type="search"
              value={query}
              placeholder="Titles, genres, cast"
              aria-label="Search titles, genres, cast"
              onChange={onSearchChange}
              onKeyDown={onSearchKey}
              onBlur={() => !query && setSearchOpen(false)}
            />
          </div>

          <Link to="/settings" className="icon-btn navbar__settings" aria-label="Settings">
            <Icon name="settings" size={22} />
          </Link>

          <div className="navbar__profile" ref={profileRef}>
            <button
              type="button"
              className="navbar__avatar-btn"
              aria-label="Profile menu"
              aria-expanded={profileOpen}
              onClick={() => setProfileOpen((v) => !v)}
            >
              <svg className="avatar" viewBox="0 0 32 32" aria-hidden="true">
                <rect width="32" height="32" rx="4" />
                <circle cx="11" cy="13" r="2" fill="#fff" />
                <circle cx="21" cy="13" r="2" fill="#fff" />
                <path d="M9 20c2 3 12 3 14 0" stroke="#fff" fill="none" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <Icon name="chevron-down" size={16} />
            </button>
            {profileOpen && (
              <ul className="navbar__dropdown" role="menu">
                <li role="none"><Link role="menuitem" to="/my-list">My List</Link></li>
                <li role="none"><Link role="menuitem" to="/settings">Settings</Link></li>
              </ul>
            )}
          </div>
        </div>

        <button
          type="button"
          className="icon-btn navbar__burger"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
        >
          <Icon name={menuOpen ? 'close' : 'menu'} size={26} />
        </button>
      </header>

      {menuOpen && (
        <nav className="sheet" aria-label="Menu">
          {NAV_LINKS.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} className="sheet__link">
              {l.label}
            </NavLink>
          ))}
          <NavLink to="/settings" className="sheet__link">Settings</NavLink>
        </nav>
      )}

      <nav className="bottom-nav" aria-label="Bottom">
        {BOTTOM_LINKS.map((l) => (
          <NavLink key={l.to} to={l.to} end={l.end} className="bottom-nav__item">
            <Icon name={l.icon} size={22} />
            <span>{l.label}</span>
          </NavLink>
        ))}
      </nav>
    </>
  )
}
