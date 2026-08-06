import { usePageMeta } from '../../utils/usePageMeta'
import { getLegalDocument } from './legalData'
import { LegalLayout } from './LegalLayout'

export default function TermsPage() {
  const meta = usePageMeta({
    title: 'Terms of Service',
    description: 'The rules that govern your use of HireHub Community.',
    url: '/terms',
  })
  return (
    <>
      {meta}
      <LegalLayout doc={getLegalDocument('terms')} />
    </>
  )
}
