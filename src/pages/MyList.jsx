import { useMemo } from 'react'
import Browse from './Browse.jsx'
import { getMovie } from '../data/movies.js'
import { useMyList } from '../context/MyListContext.jsx'

export default function MyList() {
  const { list } = useMyList()
  const items = useMemo(() => list.map(getMovie).filter(Boolean), [list])
  return (
    <Browse
      title="My List"
      items={items}
      emptyTitle="Your list is empty"
      emptyText="Tap + on any title to save it here."
    />
  )
}
