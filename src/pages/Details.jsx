import { Navigate, useParams } from 'react-router-dom'

// Shareable /title/:id link: opens the details modal over Home
export default function Details() {
  const { id } = useParams()
  return <Navigate to={`/?d=${encodeURIComponent(id)}`} replace />
}
