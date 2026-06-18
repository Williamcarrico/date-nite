import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Heart, Sparkles, RefreshCw, ArrowRight, Check } from 'lucide-react'
import Link from 'next/link'
import { FeatureCards } from '@/components/landing/feature-cards'
import { Reveal, StaggerGroup, StaggerItem } from '@/components/motion/reveal'

const steps = [
  {
    number: '1',
    title: 'Set Your Preferences',
    description: 'Tell us your location, budget, and what kind of dates you enjoy.',
  },
  {
    number: '2',
    title: 'Get Unique Ideas',
    description: 'We\'ll suggest personalized date ideas you\'ll both love.',
  },
  {
    number: '3',
    title: 'Plan & Track',
    description: 'Schedule your date, book reservations, and rate your experience.',
  },
]

export default function LandingPage() {
  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative py-20 sm:py-32 px-4 sm:px-6">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />
        </div>

        <div className="max-w-4xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            Never run out of date ideas again
          </div>

          <h1 className="font-display text-4xl sm:text-6xl font-semibold tracking-tight mb-6">
            Your{' '}
            <span className="text-gradient-primary">Perfect Date Night</span>
            <br />
            Starts Here
          </h1>

          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            Get personalized, budget-friendly date ideas tailored to your preferences.
            No repeats for 90 days. Schedule with a tap.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/signup">
              <Button size="lg" className="gradient-primary text-white shadow-playful-lg hover:shadow-playful transition-shadow rounded-xl h-14 px-8 text-lg">
                Get Started Free
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="rounded-xl h-14 px-8 text-lg">
                Sign In
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap items-center justify-center gap-8 mt-16 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-success/10 flex items-center justify-center">
                <Check className="w-4 h-4 text-success" />
              </div>
              <span>150+ curated ideas</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Heart className="w-4 h-4 text-primary" />
              </div>
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center">
                <RefreshCw className="w-4 h-4 text-accent" />
              </div>
              <span>90-day no-repeat guarantee</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <Reveal className="text-center mb-16">
            <h2 className="font-display text-3xl sm:text-4xl font-semibold mb-4">
              Everything You Need for{' '}
              <span className="text-gradient-primary">Amazing Dates</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              We&apos;ve thought of everything so you can focus on what matters - spending quality time together.
            </p>
          </Reveal>

          <FeatureCards />
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <Reveal className="text-center mb-16">
            <h2 className="font-display text-3xl sm:text-4xl font-semibold mb-4">
              How It Works
            </h2>
            <p className="text-lg text-muted-foreground">
              Three simple steps to your next great date
            </p>
          </Reveal>

          <StaggerGroup className="space-y-8">
            {steps.map((step) => (
              <StaggerItem key={step.number}>
                <div className="flex items-start gap-6">
                  <div className="shrink-0 w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center text-white text-xl font-bold shadow-playful">
                    {step.number}
                  </div>
                  <div className="flex-1 pt-2">
                    <h3 className="font-semibold text-xl mb-2">{step.title}</h3>
                    <p className="text-muted-foreground">{step.description}</p>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <Card className="border-0 shadow-xl overflow-hidden">
            <div className="gradient-primary p-12 text-center text-white">
              <h2 className="font-display text-3xl sm:text-4xl font-semibold mb-4">
                Ready to Plan Your Next Date?
              </h2>
              <p className="text-lg opacity-90 mb-8 max-w-xl mx-auto">
                Never run out of amazing date ideas.
                Start free today!
              </p>
              <Link href="/signup">
                <Button size="lg" variant="secondary" className="rounded-xl h-14 px-8 text-lg shadow-lg">
                  Get Started Free
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </section>
    </div>
  )
}
