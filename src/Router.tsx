import { Routes, Route } from 'react-router-dom'
import { Login } from './pages/Login'
import { Messages } from './pages/Messages'
import { Register } from './pages/Register'

export function Router() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/messages" element={<Messages />} />
    </Routes>
  )
}
