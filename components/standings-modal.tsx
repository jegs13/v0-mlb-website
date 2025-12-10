"use client"

import { useState, useEffect } from "react"
import { X, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"

interface StandingsModalProps {
  isOpen: boolean
  onClose: () => void
}

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
}

interface DivisionStanding {
  id: string
  name: string
  teams: TeamStanding[]
}

export function StandingsModal({ isOpen, onClose }: StandingsModalProps) {
  const [standings, setStandings] = useState<DivisionStanding[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      fetchStandings()
    }
  }, [isOpen])

  const fetchStandings = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/standings')
      const data = await response.json()
      
      if (data.error) {
        throw new Error(data.error)
      }

      // Parse the Sportradar API response
      const divisions: DivisionStanding[] = []
      
      if (data.league && data.league.season) {
        // Process AL divisions
        data.league.season.leagues?.forEach((league: any) => {
          if (league.divisions) {
            league.divisions.forEach((division: any) => {
              divisions.push({
                id: division.id,
                name: division.name,
                teams: division.teams.map((team: any) => ({
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
                    : undefined
                }))
              })
            })
          }
        })
      }

      setStandings(divisions)
    } catch (err) {
      console.error('Error fetching standings:', err)
      setError('Failed to load standings data')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="bg-background rounded-lg w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-2xl md:text-3xl font-black text-foreground uppercase tracking-tight">
            MLB Standings 2025
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-foreground hover:bg-foreground/10"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading && (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2 text-muted-foreground">Loading standings...</span>
            </div>
          )}

          {error && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <p className="text-red-400 mb-4">{error}</p>
              <Button
                variant="outline"
                onClick={fetchStandings}
                className="border-foreground/30 text-foreground hover:bg-foreground/10"
              >
                Try Again
              </Button>
            </div>
          )}

          {!isLoading && !error && standings.length > 0 && (
            <div className="grid gap-8 md:grid-cols-2">
              {standings.map((division) => (
                <div key={division.id} className="bg-card rounded-lg border border-border overflow-hidden">
                  {/* Division Header */}
                  <div className="bg-primary/10 px-4 py-3 border-b border-border">
                    <h3 className="font-bold text-foreground uppercase tracking-wide">
                      {division.name}
                    </h3>
                  </div>

                  {/* Teams Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border text-xs text-muted-foreground">
                          <th className="text-left p-3 font-semibold">Team</th>
                          <th className="text-center p-3 font-semibold">W</th>
                          <th className="text-center p-3 font-semibold">L</th>
                          <th className="text-center p-3 font-semibold">PCT</th>
                          <th className="text-center p-3 font-semibold">GB</th>
                          <th className="text-center p-3 font-semibold">STRK</th>
                        </tr>
                      </thead>
                      <tbody>
                        {division.teams.map((team, index) => (
                          <tr
                            key={team.id}
                            className={`border-b border-border/50 hover:bg-foreground/5 transition-colors ${
                              index === 0 ? 'bg-primary/5' : ''
                            }`}
                          >
                            <td className="p-3">
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-muted-foreground w-4">{index + 1}</span>
                                <span className="font-semibold text-foreground">
                                  {team.market} {team.name}
                                </span>
                              </div>
                            </td>
                            <td className="text-center p-3 font-bold text-foreground">{team.win}</td>
                            <td className="text-center p-3 font-bold text-muted-foreground">{team.loss}</td>
                            <td className="text-center p-3 text-foreground">
                              {(team.win_p * 100).toFixed(1)}
                            </td>
                            <td className="text-center p-3 text-muted-foreground">
                              {team.games_back !== undefined ? team.games_back.toFixed(1) : '-'}
                            </td>
                            <td className="text-center p-3">
                              <span className={`text-xs font-semibold ${
                                team.streak?.startsWith('W') ? 'text-green-400' : 'text-red-400'
                              }`}>
                                {team.streak || '-'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
