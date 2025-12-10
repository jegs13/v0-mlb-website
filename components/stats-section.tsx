"use client"

import { useState, useEffect } from "react"
import { RefreshCw, Loader2, TrendingUp, Award } from "lucide-react"
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
  
  const [battingAvgLeaders, setBattingAvgLeaders] = useState<StatLeader[]>([])
  const [homeRunLeaders, setHomeRunLeaders] = useState<StatLeader[]>([])
  const [rbiLeaders, setRbiLeaders] = useState<StatLeader[]>([])
  const [eraLeaders, setEraLeaders] = useState<StatLeader[]>([])
  const [winsLeaders, setWinsLeaders] = useState<StatLeader[]>([])
  const [strikeoutLeaders, setStrikeoutLeaders] = useState<StatLeader[]>([])

  const fetchStats = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/stats')
      const data = await response.json()
      
      if (data.error) {
        throw new Error(data.error)
      }

      // Process batting stats
      if (data.batting?.stats?.[0]?.splits) {
        const battingStats: PlayerStat[] = data.batting.stats[0].splits.map((s: any) => ({
          player: s.player,
          team: s.team,
          stat: s.stat
        }))

        // Batting Average Leaders
        const avgLeaders = battingStats
          .filter(s => s.stat.avg && parseFloat(s.stat.avg) > 0)
          .sort((a, b) => parseFloat(b.stat.avg!) - parseFloat(a.stat.avg!))
          .slice(0, 5)
          .map((s, i) => ({
            playerName: s.player.fullName,
            teamName: s.team.name,
            value: parseFloat(s.stat.avg!).toFixed(3),
            rank: i + 1
          }))
        setBattingAvgLeaders(avgLeaders)

        // Home Run Leaders
        const hrLeaders = battingStats
          .filter(s => s.stat.homeRuns)
          .sort((a, b) => (b.stat.homeRuns || 0) - (a.stat.homeRuns || 0))
          .slice(0, 5)
          .map((s, i) => ({
            playerName: s.player.fullName,
            teamName: s.team.name,
            value: String(s.stat.homeRuns),
            rank: i + 1
          }))
        setHomeRunLeaders(hrLeaders)

        // RBI Leaders
        const rbiLeadersList = battingStats
          .filter(s => s.stat.rbi)
          .sort((a, b) => (b.stat.rbi || 0) - (a.stat.rbi || 0))
          .slice(0, 5)
          .map((s, i) => ({
            playerName: s.player.fullName,
            teamName: s.team.name,
            value: String(s.stat.rbi),
            rank: i + 1
          }))
        setRbiLeaders(rbiLeadersList)
      }

      // Process pitching stats
      if (data.pitching?.stats?.[0]?.splits) {
        const pitchingStats: PlayerStat[] = data.pitching.stats[0].splits.map((s: any) => ({
          player: s.player,
          team: s.team,
          stat: s.stat
        }))

        // ERA Leaders (lowest is best)
        const eraLeadersList = pitchingStats
          .filter(s => s.stat.era && parseFloat(s.stat.era) > 0)
          .sort((a, b) => parseFloat(a.stat.era!) - parseFloat(b.stat.era!))
          .slice(0, 5)
          .map((s, i) => ({
            playerName: s.player.fullName,
            teamName: s.team.name,
            value: parseFloat(s.stat.era!).toFixed(2),
            rank: i + 1
          }))
        setEraLeaders(eraLeadersList)

        // Wins Leaders
        const winsLeadersList = pitchingStats
          .filter(s => s.stat.wins)
          .sort((a, b) => (b.stat.wins || 0) - (a.stat.wins || 0))
          .slice(0, 5)
          .map((s, i) => ({
            playerName: s.player.fullName,
            teamName: s.team.name,
            value: String(s.stat.wins),
            rank: i + 1
          }))
        setWinsLeaders(winsLeadersList)

        // Strikeout Leaders
        const soLeaders = pitchingStats
          .filter(s => s.stat.strikeOuts)
          .sort((a, b) => (b.stat.strikeOuts || 0) - (a.stat.strikeOuts || 0))
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
  }, [])

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
              2024 League Leaders
            </h2>
            <p className="text-muted-foreground mt-1">Top performers of the season</p>
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
            <div>
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
          </div>
        )}
      </div>
    </section>
  )
}
