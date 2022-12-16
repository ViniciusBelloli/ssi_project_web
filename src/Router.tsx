import { Routes, Route, Outlet } from 'react-router-dom'
import { Login } from './pages/Login'
import { Messages } from './pages/Messages'
import { Register } from './pages/Register'
import { ChatContext } from './contexts/ChatContext'
import { useContext, useEffect } from 'react'

export function Router() {
  const { userData } = useContext(ChatContext)

  useEffect(() => {
    // just to refresh
  }, [userData])

  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />
      {userData ? (
        <Route path="/messages" element={<Messages />} />
      ) : (
        <Outlet />
      )}
    </Routes>
  )
}
