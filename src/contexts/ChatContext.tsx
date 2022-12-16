import { createContext, ReactNode, useState } from 'react'
import { LoginFormData } from '../pages/Login'

interface ChatContextProps {
  userData: LoginFormData[]
  updateUserData: (userData: LoginFormData[]) => void
}

export const ChatContext = createContext({} as ChatContextProps)

interface ChatContextProviderProps {
  children: ReactNode
}

const user = JSON.parse(
  localStorage.getItem('@encrypted-chat:user-1.0.0') || '{}',
)

export function ChatContextProvider({ children }: ChatContextProviderProps) {
  const [userData, setUserData] = useState<LoginFormData[]>(user)

  function updateUserData(newUserData: LoginFormData[]) {
    setUserData(newUserData)
  }

  return (
    <ChatContext.Provider value={{ userData, updateUserData }}>
      {children}
    </ChatContext.Provider>
  )
}
