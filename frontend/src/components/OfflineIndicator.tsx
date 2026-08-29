/**
 * OfflineIndicator — sticky top banner, visible when navigator.onLine is false.
 *
 * Animates in with a slide-down + fade so it doesn't startle the user,
 * and slides back up smoothly on reconnect.
 */
import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'

export default function OfflineIndicator() {
  const [offline, setOffline] = useState(() => !navigator.onLine)

  useEffect(() => {
    const goOnline = () => setOffline(false)
    const goOffline = () => setOffline(true)
    window.addEventListener('online', goOnline)
    window.addEventListener('offline', goOffline)
    return () => {
      window.removeEventListener('online', goOnline)
      window.removeEventListener('offline', goOffline)
    }
  }, [])

  return (
    <AnimatePresence>
      {offline && (
        <motion.div
          className="sticky top-0 z-30 bg-red-600 px-4 py-2 text-center text-sm font-medium text-white"
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -40, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 32 }}
          role="status"
          aria-live="polite"
        >
          🔴 You are offline. Changes will sync when connection returns.
        </motion.div>
      )}
    </AnimatePresence>
  )
}
