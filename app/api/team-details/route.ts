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

    // Fetch team roster and recent/upcoming games
    const [rosterResponse, scheduleResponse, teamInfoResponse] = await Promise.all([
      fetch(`https://statsapi.mlb.com/api/v1/teams/${teamId}/roster?rosterType=active`, { cache: 'no-store' }),
      fetch(`https://statsapi.mlb.com/api/v1/schedule?teamId=${teamId}&season=2025&sportId=1&hydrate=team,linescore`, { cache: 'no-store' }),
      fetch(`https://statsapi.mlb.com/api/v1/teams/${teamId}?hydrate=record`, { cache: 'no-store' })
    ])

    if (!rosterResponse.ok || !scheduleResponse.ok || !teamInfoResponse.ok) {
      return NextResponse.json(
        { error: "Failed to fetch team details" },
        { status: 500 }
      )
    }

    const [rosterData, scheduleData, teamInfoData] = await Promise.all([
      rosterResponse.json(),
      scheduleResponse.json(),
      teamInfoResponse.json()
    ])

    // Get today's date
    const today = new Date()
    const todayStr = today.toISOString().split('T')[0]

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
      roster: rosterData.roster || [],
      lastGames: pastGames,
      nextGame: nextGame || null,
      teamInfo: teamInfoData.teams?.[0] || null
    })
  } catch (error) {
    console.error("Error fetching team details:", error)
    return NextResponse.json(
      { error: "Failed to fetch team details" },
      { status: 500 }
    )
  }
}
