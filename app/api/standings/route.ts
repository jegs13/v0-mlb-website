import { NextResponse } from "next/server"

export async function GET() {
  try {
    // MLB Stats API - free, no authentication required
    // leagueId 103 = American League, 104 = National League
    const alUrl = 'https://statsapi.mlb.com/api/v1/standings?leagueId=103'
    const nlUrl = 'https://statsapi.mlb.com/api/v1/standings?leagueId=104'
    
    console.log('Fetching AL standings from:', alUrl)
    console.log('Fetching NL standings from:', nlUrl)
    
    const [alResponse, nlResponse] = await Promise.all([
      fetch(alUrl, { cache: 'no-store' }),
      fetch(nlUrl, { cache: 'no-store' })
    ])

    if (!alResponse.ok || !nlResponse.ok) {
      console.error(`MLB API error - AL: ${alResponse.status}, NL: ${nlResponse.status}`)
      return NextResponse.json(
        { error: "Failed to fetch standings data" },
        { status: 500 }
      )
    }

    const [alData, nlData] = await Promise.all([
      alResponse.json(),
      nlResponse.json()
    ])
    
    console.log('Successfully fetched standings data')

    return NextResponse.json({
      americanLeague: alData,
      nationalLeague: nlData
    })
  } catch (error) {
    console.error("Error fetching standings:", error)
    return NextResponse.json(
      { error: "Failed to fetch standings data", details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
