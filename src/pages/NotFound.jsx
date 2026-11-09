import { Link } from 'react-router-dom'
import './NotFound.css'

export default function NotFound() {
  return (
    <div className="notfound">
      <h1>Lost your way?</h1>
      <p>We couldn’t find that page.</p>
      <Link to="/" className="btn btn-play">YT PREMIUM Home</Link>
    </div>
  )
}
