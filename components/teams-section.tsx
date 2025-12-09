"use client"

import { useState } from "react"
import Image from "next/image"
import { ChevronRight, RefreshCw, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import useSWR from "swr"

const divisions = [
  { id: "al-east", name: "AL East" },
  { id: "al-central", name: "AL Central" },
  { id: "al-west", name: "AL West" },
  { id: "nl-east", name: "NL East" },
  { id: "nl-central", name: "NL Central" },
  { id: "nl-west", name: "NL West" },
]

interface Team {
  id: string
  name: string
  abbr: string
  location: string
  nickname: string
  division: string
  wins: number
  losses: number
  logo: string
  color: string
  alternateColor: string
  standingSummary: string
}

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function TeamsSection() {
  const [selectedDivision, setSelectedDivision] = useState<string | null>(null)

  const { data, error, isLoading, mutate } = useSWR<{ teams: Team[] }>("/api/teams", fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 3600000, // 1 hour
  })

  const teams = data?.teams || []
  const filteredTeams = selectedDivision ? teams.filter((team) => team.division === selectedDivision) : teams

  // Sort teams by wins (descending) within each view
  const sortedTeams = [...filteredTeams].sort((a, b) => b.wins - a.wins)

  return (
    <section id="teams" className="py-16 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h2 className="text-3xl md:text-4xl font-black text-foreground uppercase tracking-tight">All 30 Teams</h2>
            <p className="text-muted-foreground mt-1">Browse team standings, stats, and information</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => mutate()}
              disabled={isLoading}
              className="border-foreground/30 text-foreground hover:bg-foreground/10 bg-transparent"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            </Button>
            <Button
              variant="outline"
              className="w-fit border-foreground/30 text-foreground hover:bg-foreground/10 bg-transparent"
            >
              View Full Standings
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Division Filters */}
        <div className="flex flex-wrap gap-2 mb-8">
          <Button
            variant={selectedDivision === null ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedDivision(null)}
            className={
              selectedDivision === null
                ? "bg-primary text-primary-foreground"
                : "border-foreground/30 text-foreground hover:bg-foreground/10"
            }
          >
            All Teams
          </Button>
          {divisions.map((division) => (
            <Button
              key={division.id}
              variant={selectedDivision === division.id ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedDivision(division.id)}
              className={
                selectedDivision === division.id
                  ? "bg-primary text-primary-foreground"
                  : "border-foreground/30 text-foreground hover:bg-foreground/10"
              }
            >
              {division.name}
            </Button>
          ))}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">Loading teams...</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-red-400 mb-4">Failed to load teams data</p>
            <Button
              variant="outline"
              onClick={() => mutate()}
              className="border-foreground/30 text-foreground hover:bg-foreground/10"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          </div>
        )}

        {/* Teams Grid */}
        {!isLoading && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {sortedTeams.map((team) => (
              <div
                key={team.id}
                className="group bg-card rounded-lg p-4 border border-border hover:border-primary/50 transition-all cursor-pointer hover:scale-[1.02]"
              >
                {/* Team Logo & Name */}
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center overflow-hidden"
                    style={{ backgroundColor: team.color + "20" }}
                  >
                    <Image
                      src={team.logo || "/placeholder.svg"}
                      alt={`${team.name} logo`}
                      width={40}
                      height={40}
                      className="object-contain"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-foreground truncate">{team.name}</h3>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">
                      {team.standingSummary || divisions.find((d) => d.id === team.division)?.name}
                    </p>
                  </div>
                </div>

                {/* Record */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-black text-foreground">{team.wins}</span>
                    <span className="text-muted-foreground">-</span>
                    <span className="text-2xl font-black text-muted-foreground">{team.losses}</span>
                  </div>
                  <Badge
                    variant="secondary"
                    className={`text-xs ${
                      team.wins > team.losses
                        ? "bg-green-500/20 text-green-400"
                        : team.wins < team.losses
                          ? "bg-red-500/20 text-red-400"
                          : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {team.wins + team.losses > 0 ? ((team.wins / (team.wins + team.losses)) * 100).toFixed(1) : "0.0"}%
                  </Badge>
                </div>

                {/* Hover Effect Bar */}
                <div
                  className="h-1 mt-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ backgroundColor: team.color }}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
