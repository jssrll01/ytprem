import { lazy, Suspense } from 'react'
import { Route, Routes, useLocation, useSearchParams } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import Footer from './components/Footer.jsx'
import InstallPrompt from './components/InstallPrompt.jsx'
import Skeleton from './components/Skeleton.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'

const Home = lazy(() => import('./pages/Home.jsx'))
const TvShows = lazy(() => import('./pages/TvShows.jsx'))
const Movies = lazy(() => import('./pages/Movies.jsx'))
const Pinoy = lazy(() => import('./pages/Pinoy.jsx'))
const NewPopular = lazy(() => import('./pages/NewPopular.jsx'))
const MyList = lazy(() => import('./pages/MyList.jsx'))
const Search = lazy(() => import('./pages/Search.jsx'))
const Watch = lazy(() => import('./pages/Watch.jsx'))
const WatchYT = lazy(() => import('./pages/WatchYT.jsx'))
const YouTubeResults = lazy(() => import('./components/YouTubeResults.jsx'))
const Details = lazy(() => import('./pages/Details.jsx'))
const Settings = lazy(() => import('./pages/Settings.jsx'))
const NotFound = lazy(() => import('./pages/NotFound.jsx'))
const DetailsModal = lazy(() => import('./components/DetailsModal.jsx'))

export default function App() {
  const { pathname } = useLocation()
  const [params, setParams] = useSearchParams()
  const detailId = params.get('d')
  const immersive = pathname.startsWith('/watch') || pathname.startsWith('/play')

  const closeDetails = () => {
    const next = new URLSearchParams(params)
    next.delete('d')
    setParams(next, { replace: true })
  }

  return (
    <>
      {!immersive && <Navbar />}
      <main className="app-main">
        <Suspense fallback={<Skeleton variant="page" />}>
          <div className="page-fade" key={pathname}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/tv" element={<TvShows />} />
              <Route path="/movies" element={<Movies />} />
              <Route path="/pinoy" element={<Pinoy />} />
              <Route path="/new" element={<NewPopular />} />
              <Route path="/my-list" element={<MyList />} />
              <Route path="/search" element={<><Search /><YouTubeResults /></>} />
              <Route path="/play/:vid" element={<ErrorBoundary><WatchYT /></ErrorBoundary>} />
              <Route path="/watch/:id" element={<ErrorBoundary><Watch /></ErrorBoundary>} />
              <Route path="/title/:id" element={<Details />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
          {detailId && <DetailsModal id={detailId} onClose={closeDetails} />}
        </Suspense>
        {!immersive && <Footer />}
      </main>
      {!immersive && <InstallPrompt />}
    </>
  )
}
