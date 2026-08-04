import { useEffect, useRef, useState, type FormEvent } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { useApp } from '../../context/AppContext'
import { openSupportConversation } from '../../api/messages'
import { listPricingTiers } from '../../api/pricing'
import type { PricingTier } from '../../data/pricing'

interface PaymentModalProps {
  tier: PricingTier
  open: boolean
  onOpenChange: (open: boolean) => void
  onPaid: (conversationId: string) => void
}

interface FieldErrors {
  cardNumber?: string
  expiry?: string
  cvc?: string
}

function luhnCheck(digits: string): boolean {
  let sum = 0
  let double = false
  for (let i = digits.length - 1; i >= 0; i--) {
    let d = digits.charCodeAt(i) - 48
    if (double) {
      d *= 2
      if (d > 9) d -= 9
    }
    sum += d
    double = !double
  }
  return sum % 10 === 0
}

function formatCardNumber(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 19)
  return digits.replace(/(\d{4})(?=\d)/g, '$1 ')
}

function formatExpiry(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 4)
  if (digits.length <= 2) return digits
  return `${digits.slice(0, 2)}/${digits.slice(2)}`
}

function validateCardNumber(value: string): string | undefined {
  const digits = value.replace(/\s/g, '')
  if (!digits) return 'Card number is required'
  if (!/^\d{13,19}$/.test(digits)) return 'Enter a valid card number'
  if (!luhnCheck(digits)) return 'This card number looks invalid'
  return undefined
}

function validateExpiry(value: string): string | undefined {
  const match = value.match(/^(\d{2})\/(\d{2})$/)
  if (!match) return 'Use MM/YY'
  const month = Number(match[1])
  const year = Number(match[2])
  if (month < 1 || month > 12) return 'Enter a valid month'
  const now = new Date()
  const currentYear = Number(String(now.getFullYear()).slice(-2))
  const currentMonth = now.getMonth() + 1
  if (year < currentYear || (year === currentYear && month < currentMonth)) return 'Card has expired'
  return undefined
}

function validateCvc(value: string): string | undefined {
  if (!value) return 'CVC is required'
  if (!/^\d{3,4}$/.test(value)) return 'CVC must be 3-4 digits'
  return undefined
}

export function PaymentModal({ tier, open, onOpenChange, onPaid }: PaymentModalProps) {
  const { user } = useApp()
  const [tiers, setTiers] = useState<PricingTier[]>([])
  const [selectedTier, setSelectedTier] = useState<PricingTier>(tier)
  const [cardNumber, setCardNumber] = useState('')
  const [expiry, setExpiry] = useState('')
  const [cvc, setCvc] = useState('')
  const [errors, setErrors] = useState<FieldErrors>({})
  const [paying, setPaying] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [navigating, setNavigating] = useState(false)
  const conversationIdRef = useRef<string | null>(null)
  const navigatingRef = useRef(false)
  const navigateTimerRef = useRef<number | undefined>(undefined)

  useEffect(() => () => window.clearTimeout(navigateTimerRef.current), [])

  useEffect(() => {
    let cancelled = false
    listPricingTiers()
      .then((res) => {
        if (cancelled) return
        const list = res.data
        setTiers(list)
        if (list.length > 0) {
          setSelectedTier(list.find((t) => t.tier === tier.tier) ?? list[0])
        }
      })
      .catch(() => {})
    return () => { cancelled = true }
  }, [tier.tier])

  function handleClose() {
    window.clearTimeout(navigateTimerRef.current)
    navigatingRef.current = false
    setNavigating(false)
    setCardNumber('')
    setExpiry('')
    setCvc('')
    setErrors({})
    setError(null)
    setSuccess(false)
    setTiers([])
    setSelectedTier(tier)
    onOpenChange(false)
  }

  function handleStartChatting() {
    const id = conversationIdRef.current
    if (!id || navigatingRef.current) return
    navigatingRef.current = true
    setNavigating(true)
    onPaid(id)
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const nextErrors: FieldErrors = {
      cardNumber: validateCardNumber(cardNumber),
      expiry: validateExpiry(expiry),
      cvc: validateCvc(cvc),
    }
    setErrors(nextErrors)
    if (nextErrors.cardNumber || nextErrors.expiry || nextErrors.cvc) return

    setPaying(true)
    setError(null)
    try {
      const res = await openSupportConversation()
      conversationIdRef.current = res.data.id
      setSuccess(true)
      navigateTimerRef.current = window.setTimeout(handleStartChatting, 1200)
    } catch {
      setError('Something went wrong with your payment. Please try again.')
    } finally {
      setPaying(false)
    }
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
                <img
                  src="/payment-modal-bg.png"
                  alt=""
                  aria-hidden="true"
                  loading="lazy"
                  className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-[0.15]"
                />
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
                      {success ? 'Payment received' : `Subscribe to ${selectedTier.tier}`}
                    </Dialog.Title>
                    <Dialog.Description className="sr-only">
                      {success
                        ? 'Your payment was successful. Start chatting with the HireHub team.'
                        : `Complete checkout for the ${selectedTier.tier} plan.`}
                    </Dialog.Description>
                    <Dialog.Close asChild>
                      <button
                        type="button"
                        className="p-1 rounded-md text-ink-tertiary hover:text-ink hover:bg-surface-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/30"
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
                        Please sign in to continue with your {selectedTier.tier} plan.
                      </p>
                      <Link to="/login">
                        <Button variant="accent" size="lg">
                          Sign in
                        </Button>
                      </Link>
                    </div>
                  ) : success ? (
                    <div className="flex flex-col items-center text-center py-8">
                      <img
                        src="/payment-success-check.png"
                        alt=""
                        aria-hidden="true"
                        loading="lazy"
                        className="w-24 h-24 mb-4"
                      />
                      <h2 className="text-xl font-semibold text-ink mb-2">
                        Thank you for choosing {selectedTier.tier}!
                      </h2>
                      <p className="text-sm text-ink-muted mb-8">
                        Your payment was successful. Our team is ready to help you get started.
                      </p>
                      <Button variant="accent" size="lg" className="w-full" onClick={handleStartChatting} disabled={navigating}>
                        {navigating ? 'Starting chat…' : 'Start chatting with the HireHub team'}
                      </Button>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                      {tiers.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-ink">Select your plan</p>
                          <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Billing plan">
                            {tiers.map((t) => {
                              const selected = t.tier === selectedTier.tier
                              return (
                                <button
                                  key={t.tier}
                                  type="button"
                                  role="radio"
                                  aria-checked={selected}
                                  onClick={() => setSelectedTier(t)}
                                  className={`flex flex-col items-start gap-0.5 rounded-lg border px-3 py-2.5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/30 ${
                                    selected
                                      ? 'border-accent bg-accent/10'
                                      : 'border-hairline hover:border-ink/30'
                                  }`}
                                >
                                  <span className="text-sm font-medium text-ink">{t.tier}</span>
                                  <span className="text-xs text-ink-muted">
                                    {t.price === 0 ? 'Custom' : `$${t.price}`}
                                    {t.price !== 0 && t.period === 'month' ? '/mo' : ''}
                                  </span>
                                </button>
                              )
                            })}
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between rounded-lg bg-surface-2 px-4 py-3">
                        <div>
                          <p className="text-sm font-medium text-ink">{selectedTier.tier} plan</p>
                          <p className="text-sm text-ink-muted">
                            Billed {selectedTier.period === 'custom' ? 'per agreement' : 'monthly'}
                          </p>
                        </div>
                        <p className="text-lg font-medium text-ink">
                          {selectedTier.price === 0 ? 'Custom' : `$${selectedTier.price}`}
                        </p>
                      </div>

                      <Input
                        label="Card number"
                        inputMode="numeric"
                        placeholder="4242 4242 4242 4242"
                        value={cardNumber}
                        error={errors.cardNumber}
                        onChange={(e) => {
                          setCardNumber(formatCardNumber(e.target.value))
                          setErrors((prev) => ({ ...prev, cardNumber: undefined }))
                        }}
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <Input
                          label="Expiry"
                          placeholder="MM/YY"
                          value={expiry}
                          error={errors.expiry}
                          onChange={(e) => {
                            setExpiry(formatExpiry(e.target.value))
                            setErrors((prev) => ({ ...prev, expiry: undefined }))
                          }}
                        />
                        <Input
                          label="CVC"
                          inputMode="numeric"
                          placeholder="123"
                          value={cvc}
                          error={errors.cvc}
                          onChange={(e) => {
                            setCvc(e.target.value.replace(/\D/g, '').slice(0, 4))
                            setErrors((prev) => ({ ...prev, cvc: undefined }))
                          }}
                        />
                      </div>

                      {error && (
                        <p className="text-sm text-error" role="alert">{error}</p>
                      )}

                      <Button variant="accent" size="lg" className="w-full" type="submit" disabled={paying}>
                        {paying
                          ? 'Processing…'
                          : selectedTier.price === 0
                            ? 'Contact Sales'
                            : `Pay $${selectedTier.price}`}
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
