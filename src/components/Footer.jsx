import { Link } from 'react-router-dom'
import './Footer.css'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__cols">
        <nav aria-label="Browse">
          <h3>Browse</h3>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/movies">Movies</Link></li>
            <li><Link to="/tv">TV Shows</Link></li>
            <li><Link to="/new">New &amp; Popular</Link></li>
          </ul>
        </nav>
        <nav aria-label="Account">
          <h3>Account</h3>
          <ul>
            <li><Link to="/my-list">My List</Link></li>
            <li><Link to="/settings">Settings</Link></li>
            <li><Link to="/settings#about">Install app</Link></li>
          </ul>
        </nav>
        <div>
          <h3>About</h3>
          <p>Filipino films and videos, streamed from YouTube.</p>
        </div>
      </div>
      <p className="footer__copy">© {new Date().getFullYear()} YT PREMIUM</p>
    </footer>
  )
}
