import { useState } from 'react'
import { signInAdmin } from '../../lib/adminAuth'

function AdminLogin({ onSuccess }) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      await signInAdmin({ password })
      onSuccess()
    } catch (loginError) {
      setError(loginError?.message || 'Login failed. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="mx-auto mt-10 w-full max-w-md rounded-2xl border border-[var(--border)] bg-white p-6">
      <h2 className="font-heading text-4xl text-[var(--navy)]">Admin Access</h2>
      <p className="mt-2 text-sm text-[var(--muted)]">
        Enter the admin password to access submissions.
      </p>

      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        <label className="space-y-1 text-sm font-medium">
          <span>Password</span>
          <input
            type="password"
            className="h-11 w-full rounded-md border border-[var(--border)] bg-white px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)] focus-visible:ring-offset-2"
            value={password}
            onChange={(event) => {
              setPassword(event.target.value)
              setError('')
            }}
            placeholder="Enter admin password"
            autoComplete="current-password"
            required
          />
        </label>
        {error && <p className="text-sm text-[var(--red)]">{error}</p>}
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex min-h-10 w-full items-center justify-center rounded-md border border-[var(--navy)] bg-[var(--navy)] px-4 text-sm font-semibold text-[var(--white)] transition hover:bg-[var(--navy2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)] focus-visible:ring-offset-2"
        >
          {isSubmitting ? 'Signing In...' : 'Access Dashboard'}
        </button>
      </form>
    </section>
  )
}

export default AdminLogin
