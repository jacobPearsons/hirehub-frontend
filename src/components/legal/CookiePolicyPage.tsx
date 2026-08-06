import { usePageMeta } from '../../utils/usePageMeta'
import { getLegalDocument } from './legalData'
import { LegalLayout } from './LegalLayout'

export default function CookiePolicyPage() {
  const meta = usePageMeta({
    title: 'Cookie Policy',
    description: 'How HireHub Community uses cookies and similar technologies.',
    url: '/cookies',
  })
  return (
    <>
      {meta}
      <LegalLayout doc={getLegalDocument('cookies')} />
    </>
  )
}
