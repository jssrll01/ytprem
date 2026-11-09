import './EmptyState.css'

export default function EmptyState({ catalog = false, title, text }) {
  return (
    <div className="empty" role="status">
      <h2 className="empty__title">{catalog ? 'No playable titles yet' : title}</h2>
      <p className="empty__text">
        {catalog
          ? 'Add verified YouTube links in the terminal, then reload:'
          : text}
      </p>
      {catalog && <code className="empty__code">npm run add-id nosferatu &lt;youtube-link&gt;</code>}
    </div>
  )
}
