import { api } from '../lib/axios'
import authHeader from './auth-header'

interface getMessageProps {
  userFrom: string
  userReceive: string
}

interface sendMessageProps {
  userFrom: string
  userReceive: string
  message: string
}

class UserService {
  async getMessages(request: getMessageProps) {
    return await api.post('/message/get', request, { headers: authHeader() })
  }

  async postMessage(request: sendMessageProps) {
    return await api.post('/message', request, { headers: authHeader() })
  }

  async getUsers(id: string) {
    return await api.get(`/users/${id}`, { headers: authHeader() })
  }
}

export default new UserService()
