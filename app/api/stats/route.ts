import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const league = searchParams.get('league') || 'all' // 'all', 'AL' (103), or 'NL' (104)
    
    // Determine leagueId parameter
    const leagueParam = league === 'AL' ? '&leagueIds=103' : league === 'NL' ? '&leagueIds=104' : ''
    
    // Fetch batting and pitching leaders from MLB Stats API
    const [battingResponse, pitchingResponse] = await Promise.all([
      fetch(`https://statsapi.mlb.com/api/v1/stats?stats=season&group=hitting&season=2025&sportId=1&limit=10&sortStat=battingAverage${leagueParam}`, { cache: 'no-store' }),
      fetch(`https://statsapi.mlb.com/api/v1/stats?stats=season&group=pitching&season=2025&sportId=1&limit=10&sortStat=earnedRunAverage${leagueParam}`, { cache: 'no-store' })
    ])

    if (!battingResponse.ok || !pitchingResponse.ok) {
      return NextResponse.json(
        { error: "Failed to fetch stats data" },
        { status: 500 }
      )
    }

    const [battingData, pitchingData] = await Promise.all([
      battingResponse.json(),
      pitchingResponse.json()
    ])

    return NextResponse.json({
      batting: battingData,
      pitching: pitchingData
    })
  } catch (error) {
    console.error("Error fetching stats:", error)
    return NextResponse.json(
      { error: "Failed to fetch stats data" },
      { status: 500 }
    )
  }
}
