import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const team1Id = searchParams.get('team1Id')
    const team2Id = searchParams.get('team2Id')
    
    if (!team1Id || !team2Id) {
      return NextResponse.json(
        { error: "Both team IDs are required" },
        { status: 400 }
      )
    }

    // Fetch head-to-head games for 2025 season
    const scheduleResponse = await fetch(
      `https://statsapi.mlb.com/api/v1/schedule?sportId=1&season=2025&teamId=${team1Id}&opponentId=${team2Id}&hydrate=team,linescore`,
      { cache: 'no-store' }
    )

    // Fetch current season stats for both teams
    const [team1StatsResponse, team2StatsResponse] = await Promise.all([
      fetch(`https://statsapi.mlb.com/api/v1/teams/${team1Id}/stats?stats=season&group=hitting,pitching&season=2025`, { cache: 'no-store' }),
      fetch(`https://statsapi.mlb.com/api/v1/teams/${team2Id}/stats?stats=season&group=hitting,pitching&season=2025`, { cache: 'no-store' })
    ])

    if (!scheduleResponse.ok || !team1StatsResponse.ok || !team2StatsResponse.ok) {
      return NextResponse.json(
        { error: "Failed to fetch matchup data" },
        { status: 500 }
      )
    }

    const scheduleData = await scheduleResponse.json()
    const team1Stats = await team1StatsResponse.json()
    const team2Stats = await team2StatsResponse.json()

    // Extract games from schedule
    const games = scheduleData.dates?.flatMap((date: any) => date.games) || []

    // Calculate head-to-head record
    let team1Wins = 0
    let team2Wins = 0

    games.forEach((game: any) => {
      if (game.status.statusCode === 'F') {
        const team1IsHome = game.teams.home.team.id === parseInt(team1Id)
        const team1Won = team1IsHome ? game.teams.home.isWinner : game.teams.away.isWinner
        
        if (team1Won) {
          team1Wins++
        } else {
          team2Wins++
        }
      }
    })

    return NextResponse.json({
      games,
      record: {
        team1Wins,
        team2Wins
      },
      team1Stats: team1Stats.stats || [],
      team2Stats: team2Stats.stats || []
    })
  } catch (error) {
    console.error("Error fetching matchup:", error)
    return NextResponse.json(
      { error: "Failed to fetch matchup data" },
      { status: 500 }
    )
  }
}
