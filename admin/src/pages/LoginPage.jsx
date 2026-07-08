import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router'
import apiRequest from '../utils/apiRequest'
import useAuthStore from '../utils/authStore'
import { HiShieldCheck } from 'react-icons/hi2'

function LoginPage() {
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { setCurrentUser } = useAuthStore()

  const stateError = location.state?.error

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const formData = new FormData(e.target)
    const data = Object.fromEntries(formData)

    try {
      const res = await apiRequest.post('/api/auth/login', data)
      const user = res.data.data

      if (user.role !== 'admin') {
        await apiRequest.post('/api/auth/logout')
        setError('This account does not have admin access')
        return
      }

      setCurrentUser(user)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const inputClass =
    'w-full rounded-2xl border border-line bg-canvas/80 px-4 py-3.5 text-fog outline-none transition-all placeholder:text-muted focus:border-accent/50 focus:ring-2 focus:ring-accent/20'

  return (
    <div className="mesh-bg flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-md animate-fade-up">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-soft text-accent">
            <HiShieldCheck size={28} />
          </div>
          <h1 className="text-3xl font-bold text-gradient">Admin Login</h1>
          <p className="mt-2 text-sm text-muted">Wallpaper-chan control panel</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 rounded-[28px] border border-line glass p-8">
          <div className="space-y-1.5">
            <label htmlFor="email" className="text-xs font-medium uppercase tracking-wider text-muted">Email</label>
            <input type="email" name="email" id="email" required placeholder="admin@wallpaper-chan.com" className={inputClass} />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="password" className="text-xs font-medium uppercase tracking-wider text-muted">Password</label>
            <input type="password" name="password" id="password" required placeholder="••••••••" className={inputClass} />
          </div>

          {(error || stateError) && (
            <div className="rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
              {error || stateError}
            </div>
          )}

          <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 text-sm">
            {loading ? 'Signing in…' : 'Sign in to admin'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default LoginPage
