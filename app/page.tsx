import { Header } from "@/components/header"
import { NewsCarousel } from "@/components/news-carousel"
import { ScoresTicker } from "@/components/scores-ticker"
import { TeamsSection } from "@/components/teams-section"
import { Footer } from "@/components/footer"

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <Header />
      <NewsCarousel />
      <ScoresTicker />
      <TeamsSection />
      <Footer />
    </main>
  )
}
