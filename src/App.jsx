import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import DeleteAccount from './pages/DeleteAccount.jsx'
import Terms from './pages/Terms.jsx'
import Privacy from './pages/Privacy.jsx'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/delete-account" replace />} />
        <Route path="/delete-account" element={<DeleteAccount />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
