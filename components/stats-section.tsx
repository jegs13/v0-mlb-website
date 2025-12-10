"use client"

import { useState, useEffect } from "react"
import { RefreshCw, Loader2, TrendingUp, Award, Calendar, BarChart3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface PlayerStat {
  player: {
    id: number
    fullName: string
  }
  team: {
    id: number
    name: string
  }
  stat: {
    // Batting stats
    avg?: string
    homeRuns?: number
    rbi?: number
    hits?: number
    atBats?: number
    // Pitching stats
    era?: string
    wins?: number
    strikeOuts?: number
    inningsPitched?: string
    losses?: number
  }
}

interface StatLeader {
  playerName: string
  teamName: string
  value: string
  rank: number
}

export function StatsSection() {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedLeague, setSelectedLeague] = useState<'all' | 'AL' | 'NL'>('all')
  
  const [battingAvgLeaders, setBattingAvgLeaders] = useState<StatLeader[]>([])
  const [homeRunLeaders, setHomeRunLeaders] = useState<StatLeader[]>([])
  const [rbiLeaders, setRbiLeaders] = useState<StatLeader[]>([])
  const [eraLeaders, setEraLeaders] = useState<StatLeader[]>([])
  const [winsLeaders, setWinsLeaders] = useState<StatLeader[]>([])
  const [strikeoutLeaders, setStrikeoutLeaders] = useState<StatLeader[]>([])

  const [teams, setTeams] = useState<Array<{ id: number; name: string }>>([])

  // Matchup state
  const [selectedMatchupTeam1, setSelectedMatchupTeam1] = useState<string>("")
  const [selectedMatchupTeam2, setSelectedMatchupTeam2] = useState<string>("")
  const [matchupData, setMatchupData] = useState<any>(null)
  const [matchupLoading, setMatchupLoading] = useState(false)


  const fetchStats = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/stats?league=${selectedLeague}`)
      const data = await response.json()
      
      if (data.error) {
        throw new Error(data.error)
      }

      // Process batting average leaders
      if (data.battingAverage?.stats?.[0]?.splits) {
        const avgStats: PlayerStat[] = data.battingAverage.stats[0].splits.map((s: any) => ({
          player: s.player,
          team: s.team,
          stat: s.stat
        }))

        const avgLeaders = avgStats
          .filter(s => s.stat.avg && parseFloat(s.stat.avg) > 0)
          .slice(0, 5)
          .map((s, i) => ({
            playerName: s.player.fullName,
            teamName: s.team.name,
            value: parseFloat(s.stat.avg!).toFixed(3),
            rank: i + 1
          }))
        setBattingAvgLeaders(avgLeaders)
      }

      // Process home run leaders
      if (data.homeRuns?.stats?.[0]?.splits) {
        const hrStats: PlayerStat[] = data.homeRuns.stats[0].splits.map((s: any) => ({
          player: s.player,
          team: s.team,
          stat: s.stat
        }))

        const hrLeaders = hrStats
          .filter(s => s.stat.homeRuns)
          .slice(0, 5)
          .map((s, i) => ({
            playerName: s.player.fullName,
            teamName: s.team.name,
            value: String(s.stat.homeRuns),
            rank: i + 1
          }))
        setHomeRunLeaders(hrLeaders)
      }

      // Process RBI leaders
      if (data.rbi?.stats?.[0]?.splits) {
        const rbiStats: PlayerStat[] = data.rbi.stats[0].splits.map((s: any) => ({
          player: s.player,
          team: s.team,
          stat: s.stat
        }))

        const rbiLeadersList = rbiStats
          .filter(s => s.stat.rbi)
          .slice(0, 5)
          .map((s, i) => ({
            playerName: s.player.fullName,
            teamName: s.team.name,
            value: String(s.stat.rbi),
            rank: i + 1
          }))
        setRbiLeaders(rbiLeadersList)
      }

      // Process ERA leaders
      if (data.era?.stats?.[0]?.splits) {
        const eraStats: PlayerStat[] = data.era.stats[0].splits.map((s: any) => ({
          player: s.player,
          team: s.team,
          stat: s.stat
        }))

        const eraLeadersList = eraStats
          .filter(s => s.stat.era && parseFloat(s.stat.era) > 0)
          .slice(0, 5)
          .map((s, i) => ({
            playerName: s.player.fullName,
            teamName: s.team.name,
            value: parseFloat(s.stat.era!).toFixed(2),
            rank: i + 1
          }))
        setEraLeaders(eraLeadersList)
      }

      // Process Wins leaders
      if (data.wins?.stats?.[0]?.splits) {
        const winsStats: PlayerStat[] = data.wins.stats[0].splits.map((s: any) => ({
          player: s.player,
          team: s.team,
          stat: s.stat
        }))

        const winsLeadersList = winsStats
          .filter(s => s.stat.wins)
          .slice(0, 5)
          .map((s, i) => ({
            playerName: s.player.fullName,
            teamName: s.team.name,
            value: String(s.stat.wins),
            rank: i + 1
          }))
        setWinsLeaders(winsLeadersList)
      }

      // Process Strikeout leaders
      if (data.strikeouts?.stats?.[0]?.splits) {
        const soStats: PlayerStat[] = data.strikeouts.stats[0].splits.map((s: any) => ({
          player: s.player,
          team: s.team,
          stat: s.stat
        }))

        const soLeaders = soStats
          .filter(s => s.stat.strikeOuts)
          .slice(0, 5)
          .map((s, i) => ({
            playerName: s.player.fullName,
            teamName: s.team.name,
            value: String(s.stat.strikeOuts),
            rank: i + 1
          }))
        setStrikeoutLeaders(soLeaders)
      }

    } catch (err) {
      console.error('Error fetching stats:', err)
      setError('Failed to load stats data')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
    fetchTeams()
  }, [selectedLeague])

  const fetchTeams = async () => {
    try {
      const response = await fetch('/api/teams')
      const data = await response.json()
      
      if (data.teams) {
        setTeams(data.teams.map((t: any) => ({ id: t.id, name: t.name })))
      }
    } catch (err) {
      console.error('Error fetching teams:', err)
    }
  }

  const fetchMatchup = async (team1Id: string, team2Id: string) => {
    if (!team1Id || !team2Id) return
    
    setMatchupLoading(true)
    try {
      console.log('Fetching matchup for teams:', team1Id, team2Id)
      const response = await fetch(`/api/matchup?team1Id=${team1Id}&team2Id=${team2Id}`)
      const data = await response.json()
      console.log('Matchup response:', data)
      
      if (data.error) {
        console.error('Error fetching matchup:', data.error)
        setMatchupData(null)
        return
      }

      // Calculate wins for each team
      const team1Wins = data.games?.filter((game: any) => {
        const team1IsHome = game.teams.home.team.id === parseInt(team1Id)
        return team1IsHome ? game.teams.home.isWinner : game.teams.away.isWinner
      }).length || 0

      const team2Wins = data.games?.filter((game: any) => {
        const team2IsHome = game.teams.home.team.id === parseInt(team2Id)
        return team2IsHome ? game.teams.home.isWinner : game.teams.away.isWinner
      }).length || 0

      setMatchupData({
        ...data,
        record: {
          team1Wins,
          team2Wins
        }
      })
    } catch (err) {
      console.error('Error fetching matchup:', err)
      setMatchupData(null)
    } finally {
      setMatchupLoading(false)
    }
  }

  useEffect(() => {
    if (selectedMatchupTeam1 && selectedMatchupTeam2) {
      fetchMatchup(selectedMatchupTeam1, selectedMatchupTeam2)
    } else {
      setMatchupData(null)
    }
  }, [selectedMatchupTeam1, selectedMatchupTeam2])


  const StatCard = ({ title, leaders, icon }: { title: string; leaders: StatLeader[]; icon: React.ReactNode }) => (
    <div className="bg-card rounded-lg border border-border overflow-hidden">
      <div className="bg-primary/10 px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          {icon}
          <h3 className="font-bold text-foreground uppercase tracking-wide">{title}</h3>
        </div>
      </div>
      <div className="p-4">
        <div className="space-y-3">
          {leaders.map((leader) => (
            <div
              key={`${leader.playerName}-${leader.rank}`}
              className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3 flex-1">
                <Badge 
                  variant={leader.rank === 1 ? "default" : "secondary"}
                  className={leader.rank === 1 ? "bg-yellow-500 text-black font-bold" : ""}
                >
                  {leader.rank}
                </Badge>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-foreground truncate">{leader.playerName}</div>
                  <div className="text-xs text-muted-foreground truncate">{leader.teamName}</div>
                </div>
              </div>
              <div className="text-2xl font-black text-foreground ml-2">
                {leader.value}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  return (
    <section id="stats" className="py-16 bg-muted/50">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h2 className="text-3xl md:text-4xl font-black text-foreground uppercase tracking-tight">
              2025 League Leaders
            </h2>
            <p className="text-muted-foreground mt-1">Top performers of the season</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex bg-muted rounded-lg p-1 border border-border">
              <Button
                variant={selectedLeague === 'all' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setSelectedLeague('all')}
                className="text-xs font-semibold"
              >
                ALL
              </Button>
              <Button
                variant={selectedLeague === 'AL' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setSelectedLeague('AL')}
                className="text-xs font-semibold"
              >
                AL
              </Button>
              <Button
                variant={selectedLeague === 'NL' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setSelectedLeague('NL')}
                className="text-xs font-semibold"
              >
                NL
              </Button>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={fetchStats}
              disabled={isLoading}
              className="border-foreground/30 text-foreground hover:bg-foreground/10 bg-transparent"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">Loading stats...</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-red-400 mb-4">{error}</p>
            <Button
              variant="outline"
              onClick={fetchStats}
              className="border-foreground/30 text-foreground hover:bg-foreground/10"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          </div>
        )}

        {/* Stats Content */}
        {!isLoading && !error && (
          <div>
            {/* Batting Stats */}
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                <TrendingUp className="h-6 w-6 text-primary" />
                Batting Leaders
              </h3>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <StatCard 
                  title="Batting Average" 
                  leaders={battingAvgLeaders}
                  icon={<Award className="h-4 w-4 text-primary" />}
                />
                <StatCard 
                  title="Home Runs" 
                  leaders={homeRunLeaders}
                  icon={<Award className="h-4 w-4 text-primary" />}
                />
                <StatCard 
                  title="RBI" 
                  leaders={rbiLeaders}
                  icon={<Award className="h-4 w-4 text-primary" />}
                />
              </div>
            </div>

            {/* Pitching Stats */}
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                <TrendingUp className="h-6 w-6 text-primary" />
                Pitching Leaders
              </h3>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <StatCard 
                  title="ERA" 
                  leaders={eraLeaders}
                  icon={<Award className="h-4 w-4 text-primary" />}
                />
                <StatCard 
                  title="Wins" 
                  leaders={winsLeaders}
                  icon={<Award className="h-4 w-4 text-primary" />}
                />
                <StatCard 
                  title="Strikeouts" 
                  leaders={strikeoutLeaders}
                  icon={<Award className="h-4 w-4 text-primary" />}
                />
              </div>
            </div>

            {/* Team Matchup Section */}
            <div className="mt-12">
              <h3 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                <BarChart3 className="h-6 w-6 text-primary" />
                Team Matchup
              </h3>
              <div className="bg-card rounded-lg border border-border overflow-hidden">
                <div className="bg-primary/10 px-4 py-3 border-b border-border">
                  <h3 className="font-bold text-foreground uppercase tracking-wide">Head-to-Head Comparison</h3>
                </div>
                <div className="p-4">
                  {/* Team Selection */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-2">Team 1</label>
                      <select
                        value={selectedMatchupTeam1}
                        onChange={(e) => setSelectedMatchupTeam1(e.target.value)}
                        className="w-full p-2 rounded-lg bg-muted border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="">Select Team 1...</option>
                        {teams.map((team) => (
                          <option key={team.id} value={team.id}>
                            {team.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-2">Team 2</label>
                      <select
                        value={selectedMatchupTeam2}
                        onChange={(e) => setSelectedMatchupTeam2(e.target.value)}
                        className="w-full p-2 rounded-lg bg-muted border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="">Select Team 2...</option>
                        {teams.map((team) => (
                          <option key={team.id} value={team.id}>
                            {team.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {matchupLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : !selectedMatchupTeam1 || !selectedMatchupTeam2 ? (
                    <p className="text-muted-foreground text-center py-12">Select two teams to compare their matchup</p>
                  ) : matchupData ? (
                    <div className="space-y-6">
                      {/* Head-to-Head Record */}
                      <div className="grid grid-cols-3 gap-4 items-center">
                        <div className="text-center p-4 bg-muted/30 rounded-lg">
                          <p className="text-3xl font-bold text-foreground">{matchupData.record.team1Wins}</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            {teams.find(t => t.id === parseInt(selectedMatchupTeam1))?.name || 'Team 1'} Wins
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-bold text-muted-foreground">VS</p>
                        </div>
                        <div className="text-center p-4 bg-muted/30 rounded-lg">
                          <p className="text-3xl font-bold text-foreground">{matchupData.record.team2Wins}</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            {teams.find(t => t.id === parseInt(selectedMatchupTeam2))?.name || 'Team 2'} Wins
                          </p>
                        </div>
                      </div>

                      {/* Recent Games */}
                      {matchupData.games.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-foreground mb-3">2025 Season Games</h4>
                          <div className="space-y-2 max-h-64 overflow-y-auto">
                            {matchupData.games.slice(0, 10).map((game: any) => {
                              const team1IsHome = game.teams.home.team.id === parseInt(selectedMatchupTeam1)
                              const team1Score = team1IsHome ? game.teams.home.score : game.teams.away.score
                              const team2Score = team1IsHome ? game.teams.away.score : game.teams.home.score
                              const team1Won = team1IsHome ? game.teams.home.isWinner : game.teams.away.isWinner
                              
                              return (
                                <div
                                  key={game.gamePk}
                                  className={`p-3 rounded-lg border ${
                                    game.status.statusCode === 'F' 
                                      ? team1Won 
                                        ? 'bg-green-500/10 border-green-500/30' 
                                        : 'bg-red-500/10 border-red-500/30'
                                      : 'bg-muted/30 border-border'
                                  }`}
                                >
                                  <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                      <span className="text-sm font-semibold text-foreground">
                                        {new Date(game.gameDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                      </span>
                                      <span className="text-sm text-muted-foreground">
                                        {game.teams.away.team.name} @ {game.teams.home.team.name}
                                      </span>
                                    </div>
                                    {game.status.statusCode === 'F' && (
                                      <div className="flex items-center gap-2">
                                        <span className="font-bold text-foreground">{team1Score} - {team2Score}</span>
                                        <Badge variant={team1Won ? "default" : "secondary"} 
                                               className={team1Won ? "bg-green-500" : "bg-red-500"}>
                                          {team1Won ? 'W' : 'L'}
                                        </Badge>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-8">No matchup data available</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </section>
  )
}
