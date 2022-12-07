import { createContext, ReactNode } from 'react'

export const ChatContext = createContext({})

interface ChatContextProviderProps {
  children: ReactNode
}

export function ChatContextProvider({ children }: ChatContextProviderProps) {
  return <ChatContext.Provider value={{}}>{children}</ChatContext.Provider>
}
