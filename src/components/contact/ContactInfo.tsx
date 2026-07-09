import { HeroContent } from '../ui/HeroContent'
import { Mail, MapPin, Phone } from 'lucide-react'
import { Section } from '../ui/Section'
import { Container } from '../ui/Container'
import { ContactForm } from './ContactForm'

export function ContactInfo() {
  return (
    <Section className="relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.06]">
        <img
          src="/contact-bg.png"
          alt=""
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>
      <Container className="relative">
        <div className="grid md:grid-cols-2 gap-12">
          <div>
            <HeroContent variant="card" className="mb-8">
              <h1 className="text-[40px] font-medium">Get in touch</h1>
              <p className="text-base text-ink-muted mt-2">
                Have a question, suggestion, or want to partner with us? We'd love to hear from you.
              </p>
            </HeroContent>
            <div className="flex items-center gap-3 text-sm text-ink-muted mb-4">
              <Mail className="w-5 h-5 text-ink-muted shrink-0" aria-hidden="true" />
              <span>hello@hirehub.community</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-ink-muted mb-4">
              <MapPin className="w-5 h-5 text-ink-muted shrink-0" aria-hidden="true" />
              <span>San Francisco, CA</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-ink-muted mb-4">
              <Phone className="w-5 h-5 text-ink-muted shrink-0" aria-hidden="true" />
              <span>+1 (555) 123-4567</span>
            </div>
          </div>
          <div>
            <ContactForm />
          </div>
        </div>
      </Container>
    </Section>
  )
}
