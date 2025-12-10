"use client"

import { useState, useEffect } from "react"
import { X, Calendar, Users, Trophy, TrendingUp, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface Player {
  person: {
    id: number
    fullName: string
  }
  jerseyNumber?: string
  position: {
    name: string
    abbreviation: string
  }
}

interface Game {
  gamePk: number
  gameDate: string
  teams: {
    away: { team: { name: string }; score?: number; isWinner?: boolean }
    home: { team: { name: string }; score?: number; isWinner?: boolean }
  }
  status: {
    detailedState: string
  }
}

interface TeamDetailsModalProps {
  teamId: number
  teamName: string
  onClose: () => void
}

export function TeamDetailsModal({ teamId, teamName, onClose }: TeamDetailsModalProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [roster, setRoster] = useState<Player[]>([])
  const [lastGames, setLastGames] = useState<Game[]>([])
  const [nextGame, setNextGame] = useState<Game | null>(null)
  const [teamInfo, setTeamInfo] = useState<any>(null)

  useEffect(() => {
    const fetchTeamDetails = async () => {
      setIsLoading(true)
      try {
        const response = await fetch(`/api/team-details?teamId=${teamId}`)
        const data = await response.json()
        
        if (data.error) {
          throw new Error(data.error)
        }

        setRoster(data.roster || [])
        setLastGames(data.lastGames || [])
        setNextGame(data.nextGame)
        setTeamInfo(data.teamInfo)
      } catch (error) {
        console.error('Error fetching team details:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTeamDetails()
  }, [teamId])

  // Group players by position
  const pitchers = roster.filter(p => p.position.name.includes('Pitcher'))
  const catchers = roster.filter(p => p.position.abbreviation === 'C')
  const infielders = roster.filter(p => ['1B', '2B', '3B', 'SS'].includes(p.position.abbreviation))
  const outfielders = roster.filter(p => ['LF', 'CF', 'RF', 'OF'].includes(p.position.abbreviation))

  const getGameResult = (game: Game, teamName: string) => {
    const isHome = game.teams.home.team.name === teamName
    const isWin = isHome ? game.teams.home.isWinner : game.teams.away.isWinner
    const opponent = isHome ? game.teams.away.team.name : game.teams.home.team.name
    const score = isHome 
      ? `${game.teams.home.score}-${game.teams.away.score}`
      : `${game.teams.away.score}-${game.teams.home.score}`
    
    return { isWin, opponent, score, isHome }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-card rounded-lg border border-border max-w-6xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="sticky top-0 bg-primary text-primary-foreground px-6 py-4 flex items-center justify-between border-b border-border z-10">
          <div>
            <h2 className="text-2xl font-bold">{teamName}</h2>
            {teamInfo && (
              <p className="text-sm opacity-90 mt-1">
                {teamInfo.record?.items?.[0]?.stats?.find((s: any) => s.name === 'wins')?.value || 0}-
                {teamInfo.record?.items?.[0]?.stats?.find((s: any) => s.name === 'losses')?.value || 0} • 
                {teamInfo.groups?.name || teamInfo.location || ''}
              </p>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-primary-foreground hover:bg-primary-foreground/20"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">Loading team details...</span>
          </div>
        ) : (
          <div className="p-6 space-y-6">
            {/* Next Game */}
            {nextGame && (
              <div>
                <h3 className="text-xl font-bold text-foreground mb-3 flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Next Game
                </h3>
                <div className="bg-muted/50 rounded-lg p-4 border border-border">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-foreground text-lg">
                        {nextGame.teams.away.team.name} @ {nextGame.teams.home.team.name}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {new Date(nextGame.gameDate).toLocaleDateString('en-US', { 
                          weekday: 'long', 
                          month: 'long', 
                          day: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {nextGame.status.detailedState}
                    </Badge>
                  </div>
                </div>
              </div>
            )}

            {/* Last 5 Games */}
            <div>
              <h3 className="text-xl font-bold text-foreground mb-3 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Last 5 Games
              </h3>
              <div className="space-y-2">
                {lastGames.map((game) => {
                  const { isWin, opponent, score, isHome } = getGameResult(game, teamName)
                  return (
                    <div
                      key={game.gamePk}
                      className={`p-3 rounded-lg border ${
                        isWin
                          ? 'bg-green-500/10 border-green-500/30'
                          : 'bg-red-500/10 border-red-500/30'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <Badge variant={isWin ? "default" : "secondary"} className={isWin ? "bg-green-500" : "bg-red-500"}>
                            {isWin ? 'W' : 'L'}
                          </Badge>
                          <div>
                            <p className="font-semibold text-foreground">
                              {isHome ? 'vs' : '@'} {opponent}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(game.gameDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </p>
                          </div>
                        </div>
                        <span className="font-bold text-foreground text-lg">{score}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Active Roster */}
            <div>
              <h3 className="text-xl font-bold text-foreground mb-3 flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Active Roster ({roster.length})
              </h3>
              <div className="grid gap-4 md:grid-cols-2">
                {/* Pitchers */}
                <div>
                  <h4 className="font-semibold text-foreground mb-2 text-sm uppercase tracking-wide">
                    Pitchers ({pitchers.length})
                  </h4>
                  <div className="space-y-1 max-h-64 overflow-y-auto">
                    {pitchers.map((player) => (
                      <div key={player.person.id} className="flex justify-between items-center p-2 rounded bg-muted/30 text-sm">
                        <span className="text-foreground">{player.person.fullName}</span>
                        <Badge variant="outline" className="text-xs">
                          #{player.jerseyNumber || '—'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Position Players */}
                <div className="space-y-3">
                  {/* Catchers */}
                  {catchers.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-foreground mb-2 text-sm uppercase tracking-wide">
                        Catchers ({catchers.length})
                      </h4>
                      <div className="space-y-1">
                        {catchers.map((player) => (
                          <div key={player.person.id} className="flex justify-between items-center p-2 rounded bg-muted/30 text-sm">
                            <span className="text-foreground">{player.person.fullName}</span>
                            <Badge variant="outline" className="text-xs">
                              #{player.jerseyNumber || '—'}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Infielders */}
                  {infielders.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-foreground mb-2 text-sm uppercase tracking-wide">
                        Infielders ({infielders.length})
                      </h4>
                      <div className="space-y-1">
                        {infielders.map((player) => (
                          <div key={player.person.id} className="flex justify-between items-center p-2 rounded bg-muted/30 text-sm">
                            <span className="text-foreground">{player.person.fullName}</span>
                            <Badge variant="outline" className="text-xs">
                              #{player.jerseyNumber || '—'} • {player.position.abbreviation}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Outfielders */}
                  {outfielders.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-foreground mb-2 text-sm uppercase tracking-wide">
                        Outfielders ({outfielders.length})
                      </h4>
                      <div className="space-y-1">
                        {outfielders.map((player) => (
                          <div key={player.person.id} className="flex justify-between items-center p-2 rounded bg-muted/30 text-sm">
                            <span className="text-foreground">{player.person.fullName}</span>
                            <Badge variant="outline" className="text-xs">
                              #{player.jerseyNumber || '—'} • {player.position.abbreviation}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
