import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const teamId = searchParams.get('teamId')
    
    if (!teamId) {
      return NextResponse.json(
        { error: "Team ID is required" },
        { status: 400 }
      )
    }

    // Fetch team info from ESPN API and games from MLB Stats API
    const [espnResponse, scheduleResponse, rosterResponse] = await Promise.all([
      fetch(`http://site.api.espn.com/apis/site/v2/sports/baseball/mlb/teams/${teamId}`, { cache: 'no-store' }),
      fetch(`https://statsapi.mlb.com/api/v1/schedule?teamId=${teamId}&season=2025&sportId=1&hydrate=team,linescore`, { cache: 'no-store' }),
      fetch(`https://statsapi.mlb.com/api/v1/teams/${teamId}/roster?rosterType=active`, { cache: 'no-store' })
    ])

    if (!espnResponse.ok || !scheduleResponse.ok || !rosterResponse.ok) {
      return NextResponse.json(
        { error: "Failed to fetch team details" },
        { status: 500 }
      )
    }

    const [espnData, scheduleData, rosterData] = await Promise.all([
      espnResponse.json(),
      scheduleResponse.json(),
      rosterResponse.json()
    ])

    // Get today's date
    const today = new Date()

    // Process all games
    const allGames = scheduleData.dates?.flatMap((date: any) => date.games) || []
    
    // Filter last 5 games (completed)
    const pastGames = allGames
      .filter((game: any) => {
        const gameDate = new Date(game.gameDate)
        return gameDate < today && game.status.statusCode === 'F'
      })
      .sort((a: any, b: any) => new Date(b.gameDate).getTime() - new Date(a.gameDate).getTime())
      .slice(0, 5)

    // Find next game (upcoming)
    const nextGame = allGames
      .filter((game: any) => {
        const gameDate = new Date(game.gameDate)
        return gameDate >= today && game.status.statusCode !== 'F'
      })
      .sort((a: any, b: any) => new Date(a.gameDate).getTime() - new Date(b.gameDate).getTime())[0]

    return NextResponse.json({
      teamInfo: espnData.team || null,
      roster: rosterData.roster || [],
      lastGames: pastGames,
      nextGame: nextGame || null
    })
  } catch (error) {
    console.error("Error fetching team details:", error)
    return NextResponse.json(
      { error: "Failed to fetch team details" },
      { status: 500 }
    )
  }
}
