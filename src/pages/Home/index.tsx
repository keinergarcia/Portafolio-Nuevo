import { Hero } from '@/sections/Hero'
import { About } from '@/sections/About'
import { Experience } from '@/sections/Experience'
import { Documents } from '@/sections/Documents'
import { Services } from '@/sections/Services'
import { Projects } from '@/sections/Projects'
import { Technologies } from '@/sections/Technologies'
import { Contact } from '@/sections/Contact'

export function Home() {
  return (
    <>
      <Hero />
      <About />
      <Experience />
      <Documents />
      <Services />
      <Projects />
      <Technologies />
      <Contact />
    </>
  )
}