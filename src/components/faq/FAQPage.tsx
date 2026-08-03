import { usePageMeta } from '../../utils/usePageMeta'
import { FAQSection } from './FAQSection'

export default function FAQPage() {
  const meta = usePageMeta({ title: 'FAQ | HireHub Community', description: 'Answers about registering, hiring, and interviews.' })

  return <>{meta}<FAQSection /></>
}
