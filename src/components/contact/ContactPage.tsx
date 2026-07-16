import { usePageMeta } from '../../utils/usePageMeta'
import { ContactInfo } from './ContactInfo'

export default function ContactPage() {
  const meta = usePageMeta({ title: 'Contact Us | HireHub Community', description: 'Get in touch with the HireHub team. We\'d love to hear from you.' })

  return <>{meta}<ContactInfo /></>
}
