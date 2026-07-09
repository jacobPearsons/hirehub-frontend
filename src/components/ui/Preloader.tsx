import { motion, AnimatePresence } from 'framer-motion'
import { useApp } from '../../context/AppContext'

export function Preloader() {
  const { loading } = useApp()

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          key="preloader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-canvas"
          aria-hidden="true"
        >
          <motion.img
            src="/logo-mark.svg"
            alt=""
            className="w-12 h-12"
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
