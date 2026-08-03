import { useState, type FormEvent } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { AnimatePresence, motion } from 'framer-motion'
import { X, CheckCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { useApp } from '../../context/AppContext'
import { openSupportConversation } from '../../api/messages'
import type { PricingTier } from '../../data/pricing'

interface PaymentModalProps {
  tier: PricingTier
  open: boolean
  onOpenChange: (open: boolean) => void
  onPaid: (conversationId: string) => void
}

export function PaymentModal({ tier, open, onOpenChange, onPaid }: PaymentModalProps) {
  const { user } = useApp()
  const [cardNumber, setCardNumber] = useState('')
  const [expiry, setExpiry] = useState('')
  const [cvc, setCvc] = useState('')
  const [paying, setPaying] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  function handleClose() {
    setCardNumber('')
    setExpiry('')
    setCvc('')
    setError(null)
    setConversationId(null)
    setSuccess(false)
    onOpenChange(false)
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setPaying(true)
    setError(null)
    try {
      const res = await openSupportConversation()
      setConversationId(res.data.id)
      setSuccess(true)
    } catch {
      setError('Something went wrong with your payment. Please try again.')
    } finally {
      setPaying(false)
    }
  }

  function handleStartChatting() {
    if (conversationId) onPaid(conversationId)
  }

  return (
    <Dialog.Root open={open} onOpenChange={(o) => !o && handleClose()}>
      <AnimatePresence>
        {open && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild>
              <motion.div
                className="fixed inset-0 bg-black/50 z-50"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              />
            </Dialog.Overlay>
            <Dialog.Content asChild>
              <motion.div
                className="fixed inset-0 z-50 flex items-center justify-center p-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.div
                  className="bg-surface-1 rounded-xl p-6 w-full max-w-lg shadow-xl border border-hairline"
                  initial={{ opacity: 0, y: 16, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 16, scale: 0.96 }}
                  transition={{ duration: 0.25, ease: 'easeOut' }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between mb-4">
                    <Dialog.Title className="text-lg font-semibold text-ink">
                      {success ? 'Payment received' : `Subscribe to ${tier.tier}`}
                    </Dialog.Title>
                    <Dialog.Close asChild>
                      <button
                        className="p-1 rounded-md text-ink-tertiary hover:text-ink hover:bg-surface-2 transition-colors"
                        aria-label="Close"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </Dialog.Close>
                  </div>

                  {!user ? (
                    <div className="flex flex-col items-center text-center py-8">
                      <h2 className="text-xl font-semibold text-ink mb-2">Sign in required</h2>
                      <p className="text-sm text-ink-muted mb-6">
                        Please sign in to continue with your {tier.tier} plan.
                      </p>
                      <Link to="/login">
                        <Button variant="accent" size="lg">
                          Sign in
                        </Button>
                      </Link>
                    </div>
                  ) : success ? (
                    <div className="flex flex-col items-center text-center py-8">
                      <CheckCircle className="w-16 h-16 text-success mb-4" aria-hidden="true" />
                      <h2 className="text-xl font-semibold text-ink mb-2">
                        Thank you for choosing {tier.tier}!
                      </h2>
                      <p className="text-sm text-ink-muted mb-8">
                        Your payment was successful. Our team is ready to help you get started.
                      </p>
                      <Button variant="accent" size="lg" className="w-full" onClick={handleStartChatting}>
                        Start chatting with the HireHub team
                      </Button>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="flex items-center justify-between rounded-lg bg-surface-2 px-4 py-3 mb-4">
                        <div>
                          <p className="text-sm font-medium text-ink">{tier.tier} plan</p>
                          <p className="text-sm text-ink-muted">Billed {tier.period === 'custom' ? 'per agreement' : 'monthly'}</p>
                        </div>
                        <p className="text-lg font-medium text-ink">
                          {tier.price === 0 ? 'Custom' : `$${tier.price}`}
                        </p>
                      </div>

                      <Input
                        label="Card number"
                        inputMode="numeric"
                        placeholder="4242 4242 4242 4242"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <Input
                          label="Expiry"
                          placeholder="MM/YY"
                          value={expiry}
                          onChange={(e) => setExpiry(e.target.value)}
                        />
                        <Input
                          label="CVC"
                          inputMode="numeric"
                          placeholder="123"
                          value={cvc}
                          onChange={(e) => setCvc(e.target.value)}
                        />
                      </div>

                      {error && (
                        <p className="text-sm text-error" role="alert">{error}</p>
                      )}

                      <Button variant="accent" size="lg" className="w-full" type="submit" disabled={paying}>
                        {paying ? 'Processing…' : tier.price === 0 ? 'Contact Sales' : `Pay $${tier.price}`}
                      </Button>
                      <p className="text-xs text-ink-tertiary text-center">
                        Demo checkout — no real charge will be made.
                      </p>
                    </form>
                  )}
                </motion.div>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  )
}
