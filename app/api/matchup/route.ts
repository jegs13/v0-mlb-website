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
    // Get all games for team1 in 2025
    const scheduleResponse = await fetch(
      `https://statsapi.mlb.com/api/v1/schedule?sportId=1&season=2025&teamId=${team1Id}&hydrate=team,linescore`,
      { cache: 'no-store' }
    )

    if (!scheduleResponse.ok) {
      console.error('Schedule fetch failed:', scheduleResponse.status)
      return NextResponse.json(
        { error: "Failed to fetch schedule data" },
        { status: 500 }
      )
    }

    const scheduleData = await scheduleResponse.json()
    
    // Extract all games and filter for games against team2
    const allGames = scheduleData.dates?.flatMap((date: any) => date.games) || []
    const games = allGames.filter((game: any) => {
      const awayTeamId = game.teams.away.team.id
      const homeTeamId = game.teams.home.team.id
      const team2IdNum = parseInt(team2Id)
      return (awayTeamId === team2IdNum || homeTeamId === team2IdNum)
    })

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
      }
    })
  } catch (error) {
    console.error("Error fetching matchup:", error)
    return NextResponse.json(
      { error: "Failed to fetch matchup data" },
      { status: 500 }
    )
  }
}
