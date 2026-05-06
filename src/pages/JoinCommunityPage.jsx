import { useRef } from 'react'
import { ExperienceAndWhyJoinSection } from './joinCommunity/ExperienceAndWhyJoinSection'
import { HeroSection } from './joinCommunity/HeroSection'
import { JoinForm } from './joinCommunity/JoinForm'
import { TestimonialsSection } from './joinCommunity/TestimonialsSection'

export function JoinCommunityPage() {
  const formRef = useRef(null)

  return (
    <main id="page-main" data-component="page-main" className="overflow-x-hidden">
      <HeroSection
        onCtaClick={() => {
          formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }}
      />
      <ExperienceAndWhyJoinSection />
      <JoinForm formRef={formRef} />
      <TestimonialsSection />
    </main>
  )
}

