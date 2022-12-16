import { api } from '../lib/axios'
import { LoginFormData } from '../pages/Login'
import { NewUserFormData } from '../pages/Register'

class AuthService {
  async login(request: LoginFormData) {
    return await api.post('/auth', request).then((response) => {
      if (response.data.accessToken) {
        localStorage.setItem(
          '@encrypted-chat:user-1.0.0',
          JSON.stringify(response.data),
        )
      }

      return response
    })
  }

  logout() {
    localStorage.removeItem('@encrypted-chat:user-1.0.0')
    localStorage.removeItem('@encrypted-chat:latest-user-message-1.0.0')
  }

  async register(request: NewUserFormData) {
    return await api.post('/users', request)
  }

  getCurrentUser() {
    const defauser = JSON.stringify({
      accessToken: '',
      refreshToken: '',
      id: '',
    })

    const cookiesGet = localStorage.getItem('@encrypted-chat:user-1.0.0')

    return JSON.parse(cookiesGet || defauser)
  }
}

export default new AuthService()
