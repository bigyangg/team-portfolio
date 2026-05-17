const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD
const ADMIN_SESSION_KEY = 'team-collector-admin-auth'

export const restoreAdminSession = async () =>
  sessionStorage.getItem(ADMIN_SESSION_KEY) === 'true'

export const signInAdmin = async ({ password }) => {
  if (!ADMIN_PASSWORD) {
    throw new Error('Admin password is not configured.')
  }
  if (password !== ADMIN_PASSWORD) {
    throw new Error('Incorrect admin password.')
  }
  sessionStorage.setItem(ADMIN_SESSION_KEY, 'true')
}

export const signOutAdmin = async () => {
  sessionStorage.removeItem(ADMIN_SESSION_KEY)
}
