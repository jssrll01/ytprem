import Browse from './Browse.jsx'
import { movies } from '../data/movies.js'

const items = movies.filter((m) => m.genres && m.genres.includes('Pinoy'))

export default function Pinoy() {
  return (
    <Browse
      title="Pinoy Movies"
      subtitle="Filipino films from official studio channels."
      items={items}
      emptyTitle="No Pinoy movies yet"
      emptyText="Check back soon."
    />
  )
}
