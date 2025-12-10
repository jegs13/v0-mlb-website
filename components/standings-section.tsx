"use client"

import { useState, useEffect } from "react"
import { RefreshCw, Loader2, Trophy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface TeamStanding {
  id: string
  name: string
  market: string
  abbr: string
  win: number
  loss: number
  games_back?: number
  win_p: number
  streak?: string
  is_division_leader?: boolean
  is_wildcard?: boolean
}

interface DivisionStanding {
  id: string
  name: string
  alias: string
  teams: TeamStanding[]
}

interface LeagueStanding {
  id: string
  name: string
  alias: string
  divisions: DivisionStanding[]
}

export function StandingsSection() {
  const [standings, setStandings] = useState<LeagueStanding[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedLeague, setSelectedLeague] = useState<"AL" | "NL">("AL")

  const fetchStandings = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/standings')
      const data = await response.json()
      
      console.log('Standings API Response:', data)
      
      if (data.error) {
        throw new Error(data.error)
      }

      // Parse the Sportradar API response
      const leagues: LeagueStanding[] = []
      
      if (data.league && data.league.season && data.league.season.leagues) {
        data.league.season.leagues.forEach((league: any) => {
          const divisions: DivisionStanding[] = []
          
          if (league.divisions) {
            league.divisions.forEach((division: any) => {
              divisions.push({
                id: division.id,
                name: division.name,
                alias: division.alias,
                teams: division.teams.map((team: any, index: number) => ({
                  id: team.id,
                  name: team.name,
                  market: team.market,
                  abbr: team.abbr,
                  win: team.win,
                  loss: team.loss,
                  games_back: team.games_back,
                  win_p: team.win_p,
                  streak: team.streak?.kind && team.streak?.length 
                    ? `${team.streak.kind === 'win' ? 'W' : 'L'}${team.streak.length}`
                    : undefined,
                  is_division_leader: index === 0
                }))
              })
            })
          }

          // Calculate wildcard positions
          const allTeams = divisions.flatMap(d => d.teams)
          const divisionLeaders = divisions.map(d => d.teams[0])
          const nonLeaders = allTeams.filter(t => !t.is_division_leader)
          const wildcardTeams = nonLeaders
            .sort((a, b) => b.win_p - a.win_p)
            .slice(0, 3)
          
          wildcardTeams.forEach(team => {
            team.is_wildcard = true
          })

          leagues.push({
            id: league.id,
            name: league.name,
            alias: league.alias,
            divisions
          })
        })
      }

      setStandings(leagues)
    } catch (err) {
      console.error('Error fetching standings:', err)
      setError('Failed to load standings data')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchStandings()
  }, [])

  const currentLeague = standings.find(l => l.alias === selectedLeague)

  // Get wildcard standings for selected league
  const getWildcardStandings = () => {
    if (!currentLeague) return []
    
    const allTeams = currentLeague.divisions.flatMap(d => d.teams)
    const nonLeaders = allTeams.filter(t => !t.is_division_leader)
    return nonLeaders.sort((a, b) => b.win_p - a.win_p).slice(0, 6)
  }

  const wildcardStandings = getWildcardStandings()

  return (
    <section id="standings" className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h2 className="text-3xl md:text-4xl font-black text-foreground uppercase tracking-tight">
              2024 Standings
            </h2>
            <p className="text-muted-foreground mt-1">Division leaders and wildcard race</p>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={fetchStandings}
            disabled={isLoading}
            className="border-foreground/30 text-foreground hover:bg-foreground/10 bg-transparent"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
        </div>

        {/* League Tabs */}
        <div className="flex gap-2 mb-8">
          <Button
            variant={selectedLeague === "AL" ? "default" : "outline"}
            onClick={() => setSelectedLeague("AL")}
            className={
              selectedLeague === "AL"
                ? "bg-primary text-primary-foreground"
                : "border-foreground/30 text-foreground hover:bg-foreground/10"
            }
          >
            American League
          </Button>
          <Button
            variant={selectedLeague === "NL" ? "default" : "outline"}
            onClick={() => setSelectedLeague("NL")}
            className={
              selectedLeague === "NL"
                ? "bg-primary text-primary-foreground"
                : "border-foreground/30 text-foreground hover:bg-foreground/10"
            }
          >
            National League
          </Button>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">Loading standings...</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-red-400 mb-4">{error}</p>
            <Button
              variant="outline"
              onClick={fetchStandings}
              className="border-foreground/30 text-foreground hover:bg-foreground/10"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          </div>
        )}

        {/* Standings Content */}
        {!isLoading && !error && currentLeague && (
          <div className="space-y-8">
            {/* Division Standings */}
            <div className="grid gap-6 lg:grid-cols-3">
              {currentLeague.divisions.map((division) => (
                <div key={division.id} className="bg-card rounded-lg border border-border overflow-hidden">
                  {/* Division Header */}
                  <div className="bg-primary/10 px-4 py-3 border-b border-border">
                    <h3 className="font-bold text-foreground uppercase tracking-wide">
                      {division.name}
                    </h3>
                  </div>

                  {/* Teams Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border text-xs text-muted-foreground">
                          <th className="text-left p-2 font-semibold">Team</th>
                          <th className="text-center p-2 font-semibold">W</th>
                          <th className="text-center p-2 font-semibold">L</th>
                          <th className="text-center p-2 font-semibold">PCT</th>
                          <th className="text-center p-2 font-semibold">GB</th>
                        </tr>
                      </thead>
                      <tbody>
                        {division.teams.map((team, index) => (
                          <tr
                            key={team.id}
                            className={`border-b border-border/50 hover:bg-foreground/5 transition-colors ${
                              team.is_division_leader ? 'bg-primary/5' : ''
                            }`}
                          >
                            <td className="p-2">
                              <div className="flex items-center gap-2">
                                {team.is_division_leader && (
                                  <Trophy className="h-3 w-3 text-yellow-500 flex-shrink-0" />
                                )}
                                {team.is_wildcard && !team.is_division_leader && (
                                  <div className="h-2 w-2 rounded-full bg-green-500 flex-shrink-0" />
                                )}
                                <span className="font-semibold text-foreground text-xs">
                                  {team.market}
                                </span>
                              </div>
                            </td>
                            <td className="text-center p-2 font-bold text-foreground">{team.win}</td>
                            <td className="text-center p-2 font-bold text-muted-foreground">{team.loss}</td>
                            <td className="text-center p-2 text-foreground">
                              {(team.win_p * 100).toFixed(0)}
                            </td>
                            <td className="text-center p-2 text-muted-foreground">
                              {team.games_back !== undefined && team.games_back > 0 
                                ? team.games_back.toFixed(1) 
                                : '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>

            {/* Wildcard Standings */}
            <div className="bg-card rounded-lg border border-border overflow-hidden">
              <div className="bg-green-500/10 px-4 py-3 border-b border-border">
                <h3 className="font-bold text-foreground uppercase tracking-wide flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-green-500" />
                  Wild Card Race
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border text-xs text-muted-foreground">
                      <th className="text-left p-3 font-semibold">Rank</th>
                      <th className="text-left p-3 font-semibold">Team</th>
                      <th className="text-center p-3 font-semibold">W</th>
                      <th className="text-center p-3 font-semibold">L</th>
                      <th className="text-center p-3 font-semibold">PCT</th>
                      <th className="text-center p-3 font-semibold">GB</th>
                      <th className="text-center p-3 font-semibold">STRK</th>
                    </tr>
                  </thead>
                  <tbody>
                    {wildcardStandings.map((team, index) => {
                      const wcGB = index === 0 ? 0 : (wildcardStandings[0].win_p - team.win_p) * 162
                      return (
                        <tr
                          key={team.id}
                          className={`border-b border-border/50 hover:bg-foreground/5 transition-colors ${
                            index < 3 ? 'bg-green-500/5' : ''
                          }`}
                        >
                          <td className="p-3">
                            <Badge 
                              variant={index < 3 ? "default" : "secondary"}
                              className={index < 3 ? "bg-green-500" : ""}
                            >
                              {index + 1}
                            </Badge>
                          </td>
                          <td className="p-3 font-semibold text-foreground">
                            {team.market} {team.name}
                          </td>
                          <td className="text-center p-3 font-bold text-foreground">{team.win}</td>
                          <td className="text-center p-3 font-bold text-muted-foreground">{team.loss}</td>
                          <td className="text-center p-3 text-foreground">
                            {(team.win_p * 100).toFixed(1)}
                          </td>
                          <td className="text-center p-3 text-muted-foreground">
                            {wcGB > 0 ? wcGB.toFixed(1) : '-'}
                          </td>
                          <td className="text-center p-3">
                            <span className={`text-xs font-semibold ${
                              team.streak?.startsWith('W') ? 'text-green-400' : 'text-red-400'
                            }`}>
                              {team.streak || '-'}
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <Trophy className="h-3 w-3 text-yellow-500" />
                <span>Division Leader</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                <span>Wild Card Position</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
