"use client"

import { useEffect, useRef, useState } from "react"
import { ChevronLeft, ChevronRight, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import useSWR from "swr"
import Image from "next/image"

interface Team {
  name: string
  abbr: string
  score: number
  logo: string | null
}

interface Game {
  id: string
  homeTeam: Team
  awayTeam: Team
  status: string
  inning: string | null
}

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function ScoresTicker() {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  const { data, error, isLoading, mutate } = useSWR<{ games: Game[]; lastUpdated: string }>("/api/scores", fetcher, {
    refreshInterval: 30000, // Refresh every 30 seconds
    revalidateOnFocus: true,
  })

  const games = data?.games || []

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
      setCanScrollLeft(scrollLeft > 0)
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10)
    }
  }

  useEffect(() => {
    checkScroll()
    const ref = scrollRef.current
    ref?.addEventListener("scroll", checkScroll)
    return () => ref?.removeEventListener("scroll", checkScroll)
  }, [games])

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 300
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      })
    }
  }

  return (
    <section id="scores" className="bg-secondary py-4 border-y border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-4">
          {/* Label */}
          <div className="hidden sm:flex items-center gap-2 pr-4 border-r border-border">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground whitespace-nowrap">
              Live Scores
            </span>
          </div>

          {/* Scroll Left Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => scroll("left")}
            disabled={!canScrollLeft}
            className="shrink-0 text-muted-foreground hover:text-foreground disabled:opacity-30"
          >
            <ChevronLeft className="h-5 w-5" />
            <span className="sr-only">Scroll left</span>
          </Button>

          {/* Scores Container */}
          <div
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth flex-1"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {isLoading && (
              <div className="flex items-center justify-center w-full py-4">
                <RefreshCw className="h-5 w-5 animate-spin text-muted-foreground" />
                <span className="ml-2 text-sm text-muted-foreground">Loading scores...</span>
              </div>
            )}

            {error && !isLoading && (
              <div className="flex items-center justify-center w-full py-4">
                <span className="text-sm text-muted-foreground">Unable to load scores</span>
                <Button variant="ghost" size="sm" onClick={() => mutate()} className="ml-2">
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            )}

            {!isLoading && !error && games.length === 0 && (
              <div className="flex items-center justify-center w-full py-4">
                <span className="text-sm text-muted-foreground">No games scheduled today</span>
              </div>
            )}

            {games.map((game) => (
              <div
                key={game.id}
                className="flex-shrink-0 bg-card rounded-lg p-3 min-w-[180px] border border-border hover:border-primary/50 transition-colors cursor-pointer"
              >
                {/* Status */}
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`text-xs font-semibold uppercase tracking-wider ${
                      game.status === "Live"
                        ? "text-primary"
                        : game.status === "Final"
                          ? "text-muted-foreground"
                          : "text-accent"
                    }`}
                  >
                    {game.status}
                  </span>
                  {game.inning && <span className="text-xs text-muted-foreground">{game.inning}</span>}
                </div>

                {/* Teams */}
                <div className="space-y-1">
                  {/* Away Team */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {game.awayTeam.logo ? (
                        <Image
                          src={game.awayTeam.logo || "/placeholder.svg"}
                          alt={game.awayTeam.name}
                          width={20}
                          height={20}
                          className="object-contain"
                        />
                      ) : (
                        <div className="w-5 h-5 bg-muted rounded-full" />
                      )}
                      <span className="text-sm font-medium text-foreground">{game.awayTeam.abbr}</span>
                    </div>
                    <span
                      className={`text-sm font-bold ${
                        game.status === "Final" && game.awayTeam.score > game.homeTeam.score
                          ? "text-foreground"
                          : "text-muted-foreground"
                      }`}
                    >
                      {game.awayTeam.score}
                    </span>
                  </div>

                  {/* Home Team */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {game.homeTeam.logo ? (
                        <Image
                          src={game.homeTeam.logo || "/placeholder.svg"}
                          alt={game.homeTeam.name}
                          width={20}
                          height={20}
                          className="object-contain"
                        />
                      ) : (
                        <div className="w-5 h-5 bg-muted rounded-full" />
                      )}
                      <span className="text-sm font-medium text-foreground">{game.homeTeam.abbr}</span>
                    </div>
                    <span
                      className={`text-sm font-bold ${
                        game.status === "Final" && game.homeTeam.score > game.awayTeam.score
                          ? "text-foreground"
                          : "text-muted-foreground"
                      }`}
                    >
                      {game.homeTeam.score}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Scroll Right Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => scroll("right")}
            disabled={!canScrollRight}
            className="shrink-0 text-muted-foreground hover:text-foreground disabled:opacity-30"
          >
            <ChevronRight className="h-5 w-5" />
            <span className="sr-only">Scroll right</span>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => mutate()}
            className="shrink-0 text-muted-foreground hover:text-foreground"
            title="Refresh scores"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            <span className="sr-only">Refresh scores</span>
          </Button>
        </div>
      </div>
    </section>
  )
}
