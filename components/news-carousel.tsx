"use client"

import { useState, useEffect, useCallback } from "react"
import { ChevronLeft, ChevronRight, Play, Pause, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import useSWR from "swr"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

interface NewsItem {
  id: string
  title: string
  subtitle: string
  image: string
  category: string
  link: string
  published: string
}

// Fallback news in case API fails
const fallbackNews: NewsItem[] = [
  {
    id: "1",
    title: "WELCOME TO MLB CENTRAL",
    subtitle: "Your home for the latest baseball news, scores, and highlights",
    image: "/baseball-stadium-night.jpg",
    category: "MLB NEWS",
    link: "#",
    published: new Date().toISOString(),
  },
]

export function NewsCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)

  const { data, error, isLoading, mutate } = useSWR("/api/news", fetcher, {
    refreshInterval: 300000, // Refresh every 5 minutes
    revalidateOnFocus: false,
  })

  const newsItems: NewsItem[] = data?.news?.length > 0 ? data.news : fallbackNews

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % newsItems.length)
  }, [newsItems.length])

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + newsItems.length) % newsItems.length)
  }

  // Reset slide when news items change
  useEffect(() => {
    setCurrentSlide(0)
  }, [data])

  useEffect(() => {
    if (!isPlaying || newsItems.length <= 1) return
    const interval = setInterval(nextSlide, 5000)
    return () => clearInterval(interval)
  }, [isPlaying, nextSlide, newsItems.length])

  if (isLoading) {
    return (
      <section id="news" className="relative h-[50vh] min-h-[400px] bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading latest news...</p>
        </div>
      </section>
    )
  }

  return (
    <section id="news" className="relative h-[50vh] min-h-[400px] overflow-hidden">
      {/* Slides */}
      {newsItems.map((item, index) => (
        <div
          key={item.id}
          className={`absolute inset-0 transition-opacity duration-700 ${
            index === currentSlide ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          <div className="absolute inset-0">
            <Image
              src={item.image || "/placeholder.svg"}
              alt={item.title}
              fill
              className="object-cover object-center"
              priority={index === 0}
              quality={90}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
          </div>

          {/* Content */}
          <div className="relative h-full container mx-auto px-4 flex flex-col justify-end pb-16">
            <span className="inline-block px-3 py-1 bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider rounded mb-4 w-fit">
              {item.category}
            </span>
            <h2 className="text-3xl md:text-5xl font-black text-foreground mb-3 max-w-3xl leading-tight text-balance">
              {item.title}
            </h2>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl line-clamp-2">{item.subtitle}</p>
            <div className="mt-6 flex gap-4">
              <Button
                asChild
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold uppercase tracking-wider"
              >
                <a href={item.link} target="_blank" rel="noopener noreferrer">
                  Read Full Story
                </a>
              </Button>
              <Button
                variant="outline"
                className="border-foreground/30 text-foreground hover:bg-foreground/10 bg-transparent"
                onClick={() => mutate()}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh News
              </Button>
            </div>
          </div>
        </div>
      ))}

      {/* Controls */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={prevSlide}
          className="rounded-full bg-background/50 hover:bg-background/80 text-foreground"
        >
          <ChevronLeft className="h-5 w-5" />
          <span className="sr-only">Previous slide</span>
        </Button>

        {/* Dots */}
        <div className="flex items-center gap-2">
          {newsItems.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentSlide ? "w-8 bg-primary" : "bg-foreground/30 hover:bg-foreground/50"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={nextSlide}
          className="rounded-full bg-background/50 hover:bg-background/80 text-foreground"
        >
          <ChevronRight className="h-5 w-5" />
          <span className="sr-only">Next slide</span>
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsPlaying(!isPlaying)}
          className="rounded-full bg-background/50 hover:bg-background/80 text-foreground ml-2"
        >
          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          <span className="sr-only">{isPlaying ? "Pause" : "Play"} slideshow</span>
        </Button>
      </div>
    </section>
  )
}
