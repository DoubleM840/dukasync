import { FormEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import toast from 'react-hot-toast'

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  async function submit(event: FormEvent) {
    event.preventDefault()
    try {
      await login(email, password)
      toast.success('Signed in successfully')
      navigate('/dashboard')
    } catch {
      toast.error('Unable to sign in')
      setError('Unable to sign in. Check your credentials.')
    }
  }

  return (
    <main className="mx-auto mt-20 max-w-md rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Sign in to DukaSync</h1>
      <form className="space-y-4" onSubmit={submit}>
        <input className="w-full rounded border p-3" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input className="w-full rounded border p-3" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button className="w-full rounded bg-indigo-600 px-4 py-3 font-semibold text-white hover:bg-indigo-700" type="submit">Sign in</button>
      </form>
    </main>
  )
}
