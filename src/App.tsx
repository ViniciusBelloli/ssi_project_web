import { BrowserRouter } from 'react-router-dom'
import { ChatContextProvider } from './contexts/ChatContext'
import { Router } from './Router'

import './styles/global.css'

function App() {
  return (
    <BrowserRouter>
      <ChatContextProvider>
        <Router />
      </ChatContextProvider>
    </BrowserRouter>
  )
}

export default App
