import { usePageMeta } from '../../utils/usePageMeta'
import { getLegalDocument } from './legalData'
import { LegalLayout } from './LegalLayout'

export default function PrivacyPolicyPage() {
  const meta = usePageMeta({
    title: 'Privacy Policy',
    description: 'How HireHub Community collects, uses, and protects your information.',
    url: '/privacy',
  })
  return (
    <>
      {meta}
      <LegalLayout doc={getLegalDocument('privacy')} />
    </>
  )
}
