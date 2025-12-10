import { Header } from "@/components/header"
import { NewsCarousel } from "@/components/news-carousel"
import { ScoresTicker } from "@/components/scores-ticker"
import { TeamsSection } from "@/components/teams-section"
import { StandingsSection } from "@/components/standings-section"
import { Footer } from "@/components/footer"
import { ScrollToTop } from "@/components/scroll-to-top"

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <Header />
      <NewsCarousel />
      <ScoresTicker />
      <StandingsSection />
      <TeamsSection />
      <Footer />
      <ScrollToTop />
    </main>
  )
}
