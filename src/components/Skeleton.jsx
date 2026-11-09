import './Skeleton.css'

function RowSkeleton({ count = 6 }) {
  return (
    <div className="sk-row">
      <div className="skeleton sk-row__title" />
      <div className="sk-row__cards">
        {Array.from({ length: count }, (_, i) => (
          <div key={i} className="skeleton sk-card" />
        ))}
      </div>
    </div>
  )
}

export default function Skeleton({ variant = 'row' }) {
  if (variant === 'page') {
    return (
      <div className="sk-page" role="status" aria-label="Loading">
        <div className="skeleton sk-hero" />
        <RowSkeleton />
        <RowSkeleton />
      </div>
    )
  }
  return <RowSkeleton />
}
