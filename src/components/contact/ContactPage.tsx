import { usePageMeta } from '../../utils/usePageMeta'
import { ContactInfo } from './ContactInfo'

export default function ContactPage() {
  {usePageMeta({ title: 'Contact Us | HireHub Community', description: 'Get in touch with the HireHub team. We\'d love to hear from you.' })}

  return <ContactInfo />
}
