import Browse from './Browse.jsx'
import { movies } from '../data/movies.js'

export default function Movies() {
  return <Browse title="Movies" items={movies} />
}
