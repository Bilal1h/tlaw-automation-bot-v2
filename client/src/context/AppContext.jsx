import { createContext, useContext, useMemo, useState } from 'react'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [query, setQuery] = useState('')
  const [businesses, setBusinesses] = useState([])
  const [auth, setAuth] = useState({ authenticated: false, checked: false })
  const [searchJob, setSearchJob] = useState({
    jobId: '',
    status: 'idle',
    fetchedCount: 0,
    totalDiscovered: 0,
    done: false,
    stopped: false,
    error: '',
  })

  const [filters, setFilters] = useState({
    ratingRanges: {
      '1-2': false,
      '2-3': false,
      '3-4': false,
      '4-5': false,
    },
    minReviews: 0,
    maxReviews: '',
    category: 'all',
    hasPainPointsOnly: false,
    hasWebsiteOnly: false,
    leadType: 'all',
    hotLeadsOnly: false,
  })

  const value = useMemo(
    () => ({
      query,
      setQuery,
      businesses,
      setBusinesses,
      auth,
      setAuth,
      filters,
      setFilters,
      searchJob,
      setSearchJob,
    }),
    [query, businesses, auth, filters, searchJob],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used inside AppProvider')
  }
  return context
}