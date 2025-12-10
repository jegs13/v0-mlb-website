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

    console.log(`Found ${games.length} games between teams ${team1Id} and ${team2Id}`)

    games.forEach((game: any) => {
      if (game.status.statusCode === 'F' || game.status.abstractGameState === 'Final') {
        const team1IdNum = parseInt(team1Id)
        const team1IsHome = game.teams.home.team.id === team1IdNum
        const team1IsAway = game.teams.away.team.id === team1IdNum
        
        let team1Won = false
        
        if (team1IsHome) {
          // Team 1 is home team
          const homeScore = game.teams.home.score || 0
          const awayScore = game.teams.away.score || 0
          team1Won = homeScore > awayScore
        } else if (team1IsAway) {
          // Team 1 is away team
          const homeScore = game.teams.home.score || 0
          const awayScore = game.teams.away.score || 0
          team1Won = awayScore > homeScore
        }
        
        if (team1Won) {
          team1Wins++
        } else {
          team2Wins++
        }
        
        console.log(`Game: ${game.teams.away.team.name} ${game.teams.away.score} @ ${game.teams.home.team.name} ${game.teams.home.score} - Team1 won: ${team1Won}`)
      }
    })

    console.log(`Final record - Team1: ${team1Wins}, Team2: ${team2Wins}`)

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
