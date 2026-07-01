import { useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useAuth, useUser } from '@clerk/clerk-react'
import { setAuthToken, usersApi } from './utils/api'
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute'
import Navbar         from './components/Navbar/Navbar'
import Footer         from './components/Footer/Footer'
import Home           from './pages/Home/Home'
import Dashboard      from './pages/Dashboard/Dashboard'
import PublicPage     from './pages/PublicPage/PublicPage'
import NotFound       from './pages/NotFound/NotFound'
import './App.css'

function TokenSync() {
  const { getToken, isSignedIn } = useAuth()
  const { user } = useUser()

  useEffect(() => {
    if (!isSignedIn) { setAuthToken(null); return }

    const sync = async () => {
      const token = await getToken()
      setAuthToken(token)
      await usersApi.sync(
        user?.fullName ?? user?.firstName ?? '',
        user?.imageUrl ?? '',
      ).catch(() => {})
    }

    sync()
    const interval = setInterval(async () => {
      const token = await getToken()
      setAuthToken(token)
    }, 55 * 60 * 1000)

    return () => clearInterval(interval)
  }, [isSignedIn, getToken, user])

  return null
}

export default function App() {
  return (
    <BrowserRouter>
      <TokenSync />
      <Routes>
        {/* Public salami page — NO navbar/footer, full custom theme */}
        <Route path="/s/:username" element={<PublicPage />} />

        {/* All other routes — with navbar + footer */}
        <Route path="/*" element={
          <div className="app-shell">
            <Navbar />
            <main className="app-main">
              <Routes>
                <Route path="/"           element={<Home />} />
                <Route
                  path="/dashboard/*"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route path="*"           element={<NotFound />} />
              </Routes>
            </main>
            <Footer />
          </div>
        } />
      </Routes>
    </BrowserRouter>
  )
}
