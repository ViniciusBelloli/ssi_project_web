export default function authHeader() {
  const data = localStorage.getItem('@encrypted-chat:user-1.0.0') || '{}'

  const user = JSON.parse(data)
  if (user && user.accessToken) {
    return { Authorization: 'Bearer ' + user.accessToken }
  } else {
    return {}
  }
}
