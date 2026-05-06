import { useEffect } from 'react'
import { ContactDetails } from './contact/ContactDetails'
import { ContactFAQ } from './contact/ContactFAQ'
import { ContactHero } from './contact/ContactHero'

export function ContactPage() {
  useEffect(() => {
    document.title = 'The Ember Network | Contact'
  }, [])

  return (
    <main id="page-main" data-component="page-main" className="overflow-x-hidden">
      <ContactHero />
      <ContactDetails />
      <ContactFAQ />
    </main>
  )
}

