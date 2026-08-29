import { NavLink, Navigate, Route, Routes } from 'react-router-dom'
import DashboardPage from './pages/DashboardPage'
import InventoryPage from './pages/InventoryPage'
import Login from './pages/Login'
import RestockOrdersPage from './pages/RestockOrdersPage'
import SalesPage from './pages/SalesPage'
import ProtectedRoute from './components/ProtectedRoute'
import { useAuth } from './hooks/useAuth'
import { Toaster } from 'react-hot-toast'
import { useEffect, useState } from 'react'
import { Plus } from 'lucide-react'
import OfflineIndicator from './components/OfflineIndicator'
import QuickSaleModal from './components/QuickSaleModal'

const links = [
  ['/dashboard', 'Dashboard'],
  ['/sales', 'Sales'],
  ['/inventory', 'Inventory'],
  ['/restock-orders', 'Restock Orders'],
] as const

function Shell() {
  const { logout, user } = useAuth()
  const [quickSaleOpen, setQuickSaleOpen] = useState(false)
  useEffect(() => { const onKey = (event: KeyboardEvent) => { if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); setQuickSaleOpen(true) } }; window.addEventListener('keydown', onKey); return () => window.removeEventListener('keydown', onKey) }, [])
  return (
    <div className="min-h-screen bg-paper font-sans"><OfflineIndicator />
      <header className="sticky top-0 z-10 border-b border-sokoni-green bg-board-green shadow-sm">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-4">
          <NavLink className="font-display text-xl tracking-tight text-chalk" to="/dashboard">DukaSync</NavLink>
          <div className="flex w-full items-center justify-between gap-3 sm:w-auto">
          <span className="truncate text-sm text-chalk/70">{user?.shop_name ?? `Shop #${user?.shop_id ?? ''}`}</span>
          <nav className="flex max-w-full gap-3 overflow-x-auto text-sm sm:gap-4">
            {links.map(([to, label]) => <NavLink key={to} className={({ isActive }) => isActive ? 'font-semibold text-chalk' : 'text-chalk/65 hover:text-chalk'} to={to}>{label}</NavLink>)}
            <button className="whitespace-nowrap text-chalk/80 hover:text-chalk hover:underline" onClick={logout}>Log out</button>
          </nav>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8"><Routes><Route path="/dashboard" element={<DashboardPage />} /><Route path="/sales" element={<SalesPage />} /><Route path="/inventory" element={<InventoryPage />} /><Route path="/restock-orders" element={<RestockOrdersPage />} /><Route path="*" element={<Navigate to="/dashboard" replace />} /></Routes></main><button className="fixed bottom-6 right-6 z-20 flex h-14 w-14 items-center justify-center rounded-full bg-indigo-600 text-white shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl active:scale-95" onClick={() => setQuickSaleOpen(true)} aria-label="Open quick sale (Ctrl+K)"><Plus size={24} /></button><QuickSaleModal open={quickSaleOpen} onClose={() => setQuickSaleOpen(false)} /><Toaster position="top-right" toastOptions={{ duration: 4000, style: { background: '#1F3D2E', color: '#F6F3EA' } }} />
    </div>
  )
}

export default function App() {
  return <Routes>
    <Route path="/login" element={<Login />} />
    <Route element={<ProtectedRoute />}><Route path="/*" element={<Shell />} /></Route>
  </Routes>
}
