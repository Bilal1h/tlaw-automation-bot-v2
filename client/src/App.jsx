import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Navbar } from './components/Navbar.jsx'
import { HomePage } from './pages/HomePage.jsx'
import { ResultsPage } from './pages/ResultsPage.jsx'
import { AuthCallbackPage } from './pages/AuthCallbackPage.jsx'

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-transparent text-slate-100">
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/results" element={<ResultsPage />} />
          <Route path="/auth/callback" element={<AuthCallbackPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}
