import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0]
    
    // Fetch schedule for the specified date
    const response = await fetch(
      `https://statsapi.mlb.com/api/v1/schedule?sportId=1&date=${date}&hydrate=team,linescore,probablePitcher`,
      { cache: 'no-store' }
    )

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch schedule data" },
        { status: 500 }
      )
    }

    const data = await response.json()
    
    return NextResponse.json({
      date: date,
      games: data.dates?.[0]?.games || [],
      totalGames: data.totalGames || 0
    })
  } catch (error) {
    console.error("Error fetching schedule:", error)
    return NextResponse.json(
      { error: "Failed to fetch schedule data" },
      { status: 500 }
    )
  }
}
