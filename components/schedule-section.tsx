"use client"

import { useState, useEffect } from "react"
import { Calendar, ChevronLeft, ChevronRight, RefreshCw, Loader2, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface Game {
  gamePk: number
  gameDate: string
  status: {
    detailedState: string
    statusCode: string
  }
  teams: {
    away: {
      team: { id: number; name: string }
      score?: number
      isWinner?: boolean
      probablePitcher?: { fullName: string }
    }
    home: {
      team: { id: number; name: string }
      score?: number
      isWinner?: boolean
      probablePitcher?: { fullName: string }
    }
  }
  linescore?: {
    currentInning?: number
    inningState?: string
    balls?: number
    strikes?: number
    outs?: number
  }
  venue?: {
    name: string
  }
}

export function ScheduleSection() {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [games, setGames] = useState<Game[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSchedule = async (date: Date) => {
    setIsLoading(true)
    setError(null)
    try {
      const dateStr = date.toISOString().split('T')[0]
      const response = await fetch(`/api/schedule?date=${dateStr}`)
      const data = await response.json()
      
      if (data.error) {
        throw new Error(data.error)
      }

      setGames(data.games || [])
    } catch (err) {
      console.error('Error fetching schedule:', err)
      setError('Failed to load schedule')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchSchedule(selectedDate)
  }, [selectedDate])

  const changeDate = (days: number) => {
    const newDate = new Date(selectedDate)
    newDate.setDate(newDate.getDate() + days)
    setSelectedDate(newDate)
  }

  const goToToday = () => {
    setSelectedDate(new Date())
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }

  const formatGameTime = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      timeZoneName: 'short'
    })
  }

  const getGameStatus = (game: Game) => {
    if (game.status.statusCode === 'F') {
      return { text: 'Final', color: 'bg-gray-500' }
    } else if (game.status.statusCode === 'I' || game.status.statusCode === 'IR') {
      return { 
        text: game.linescore?.inningState && game.linescore?.currentInning 
          ? `${game.linescore.inningState} ${game.linescore.currentInning}` 
          : 'In Progress', 
        color: 'bg-green-500' 
      }
    } else if (game.status.statusCode === 'P' || game.status.statusCode === 'S') {
      return { text: formatGameTime(game.gameDate), color: 'bg-blue-500' }
    } else {
      return { text: game.status.detailedState, color: 'bg-yellow-500' }
    }
  }

  return (
    <section id="schedule" className="py-16 bg-muted/50">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h2 className="text-3xl md:text-4xl font-black text-foreground uppercase tracking-tight">
              Game Schedule
            </h2>
            <p className="text-muted-foreground mt-1">View daily MLB game schedules</p>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => fetchSchedule(selectedDate)}
            disabled={isLoading}
            className="border-foreground/30 text-foreground hover:bg-foreground/10 bg-transparent"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
        </div>

        {/* Date Navigation */}
        <div className="flex items-center justify-between mb-6 bg-card rounded-lg p-4 border border-border">
          <Button
            variant="outline"
            size="icon"
            onClick={() => changeDate(-1)}
            className="border-foreground/30 text-foreground hover:bg-foreground/10"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-bold text-foreground">
              {formatDate(selectedDate)}
            </h3>
            {selectedDate.toDateString() !== new Date().toDateString() && (
              <Button
                variant="outline"
                size="sm"
                onClick={goToToday}
                className="border-foreground/30 text-foreground hover:bg-foreground/10 text-xs"
              >
                Today
              </Button>
            )}
          </div>

          <Button
            variant="outline"
            size="icon"
            onClick={() => changeDate(1)}
            className="border-foreground/30 text-foreground hover:bg-foreground/10"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">Loading schedule...</span>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="text-center py-16">
            <p className="text-red-500 mb-4">{error}</p>
            <Button onClick={() => fetchSchedule(selectedDate)} variant="outline">
              Try Again
            </Button>
          </div>
        )}

        {/* Games List */}
        {!isLoading && !error && (
          <>
            {games.length === 0 ? (
              <div className="text-center py-16">
                <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground text-lg">No games scheduled for this date</p>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground mb-4">
                  {games.length} game{games.length !== 1 ? 's' : ''} scheduled
                </p>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {games.map((game) => {
                    const status = getGameStatus(game)
                    const isLive = game.status.statusCode === 'I' || game.status.statusCode === 'IR'
                    const isFinal = game.status.statusCode === 'F'

                    return (
                      <div
                        key={game.gamePk}
                        className={`bg-card rounded-lg border ${
                          isLive ? 'border-green-500/50 shadow-lg shadow-green-500/10' : 'border-border'
                        } overflow-hidden hover:shadow-lg transition-shadow`}
                      >
                        {/* Game Status Header */}
                        <div className={`${status.color} px-4 py-2 flex items-center justify-between`}>
                          <Badge variant="secondary" className="bg-white/20 text-white text-xs">
                            {status.text}
                          </Badge>
                          {isLive && game.linescore && (
                            <div className="flex items-center gap-2 text-white text-xs">
                              <span>B: {game.linescore.balls}</span>
                              <span>S: {game.linescore.strikes}</span>
                              <span>O: {game.linescore.outs}</span>
                            </div>
                          )}
                        </div>

                        {/* Teams */}
                        <div className="p-4 space-y-3">
                          {/* Away Team */}
                          <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              <p className={`font-semibold text-foreground truncate ${
                                isFinal && game.teams.away.isWinner ? 'text-green-500' : ''
                              }`}>
                                {game.teams.away.team.name}
                              </p>
                              {game.teams.away.probablePitcher && !isFinal && (
                                <p className="text-xs text-muted-foreground truncate">
                                  {game.teams.away.probablePitcher.fullName}
                                </p>
                              )}
                            </div>
                            {(isFinal || isLive) && (
                              <span className={`text-3xl font-bold ml-3 ${
                                isFinal && game.teams.away.isWinner ? 'text-green-500' : 'text-foreground'
                              }`}>
                                {game.teams.away.score ?? 0}
                              </span>
                            )}
                          </div>

                          {/* Home Team */}
                          <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              <p className={`font-semibold text-foreground truncate ${
                                isFinal && game.teams.home.isWinner ? 'text-green-500' : ''
                              }`}>
                                {game.teams.home.team.name}
                              </p>
                              {game.teams.home.probablePitcher && !isFinal && (
                                <p className="text-xs text-muted-foreground truncate">
                                  {game.teams.home.probablePitcher.fullName}
                                </p>
                              )}
                            </div>
                            {(isFinal || isLive) && (
                              <span className={`text-3xl font-bold ml-3 ${
                                isFinal && game.teams.home.isWinner ? 'text-green-500' : 'text-foreground'
                              }`}>
                                {game.teams.home.score ?? 0}
                              </span>
                            )}
                          </div>

                          {/* Venue */}
                          {game.venue && (
                            <div className="pt-2 border-t border-border">
                              <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {game.venue.name}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  )
}
