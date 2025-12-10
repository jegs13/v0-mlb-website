import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const league = searchParams.get('league') || 'all' // 'all', 'AL' (103), or 'NL' (104)
    
    // Determine leagueId parameter
    const leagueParam = league === 'AL' ? '&leagueIds=103' : league === 'NL' ? '&leagueIds=104' : ''
    
    // Fetch all batting and pitching leaders from MLB Stats API
    // Need separate calls for each stat to get the actual leaders
    const [avgResponse, hrResponse, rbiResponse, eraResponse, winsResponse, strikeoutsResponse] = await Promise.all([
      fetch(`https://statsapi.mlb.com/api/v1/stats?stats=season&group=hitting&season=2025&sportId=1&limit=10&sortStat=battingAverage${leagueParam}`, { cache: 'no-store' }),
      fetch(`https://statsapi.mlb.com/api/v1/stats?stats=season&group=hitting&season=2025&sportId=1&limit=10&sortStat=homeRuns${leagueParam}`, { cache: 'no-store' }),
      fetch(`https://statsapi.mlb.com/api/v1/stats?stats=season&group=hitting&season=2025&sportId=1&limit=10&sortStat=runsBattedIn${leagueParam}`, { cache: 'no-store' }),
      fetch(`https://statsapi.mlb.com/api/v1/stats?stats=season&group=pitching&season=2025&sportId=1&limit=10&sortStat=earnedRunAverage${leagueParam}`, { cache: 'no-store' }),
      fetch(`https://statsapi.mlb.com/api/v1/stats?stats=season&group=pitching&season=2025&sportId=1&limit=10&sortStat=wins${leagueParam}`, { cache: 'no-store' }),
      fetch(`https://statsapi.mlb.com/api/v1/stats?stats=season&group=pitching&season=2025&sportId=1&limit=10&sortStat=strikeOuts${leagueParam}`, { cache: 'no-store' })
    ])

    if (!avgResponse.ok || !hrResponse.ok || !rbiResponse.ok || !eraResponse.ok || !winsResponse.ok || !strikeoutsResponse.ok) {
      return NextResponse.json(
        { error: "Failed to fetch stats data" },
        { status: 500 }
      )
    }

    const [avgData, hrData, rbiData, eraData, winsData, strikeoutsData] = await Promise.all([
      avgResponse.json(),
      hrResponse.json(),
      rbiResponse.json(),
      eraResponse.json(),
      winsResponse.json(),
      strikeoutsResponse.json()
    ])

    return NextResponse.json({
      battingAverage: avgData,
      homeRuns: hrData,
      rbi: rbiData,
      era: eraData,
      wins: winsData,
      strikeouts: strikeoutsData
    })
  } catch (error) {
    console.error("Error fetching stats:", error)
    return NextResponse.json(
      { error: "Failed to fetch stats data" },
      { status: 500 }
    )
  }
}
