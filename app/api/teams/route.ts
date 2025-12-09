import { NextResponse } from "next/server"

// ESPN team IDs mapped to divisions
const divisionMap: Record<string, string> = {
  // AL East
  "10": "al-east", // NYY
  "1": "al-east", // BAL
  "2": "al-east", // BOS
  "30": "al-east", // TB
  "14": "al-east", // TOR
  // AL Central
  "3": "al-central", // CLE
  "6": "al-central", // CWS
  "7": "al-central", // DET
  "9": "al-central", // KC
  "23": "al-central", // MIN
  // AL West
  "18": "al-west", // HOU
  "11": "al-west", // LAA
  "19": "al-west", // OAK
  "12": "al-west", // SEA
  "13": "al-west", // TEX
  // NL East
  "15": "nl-east", // ATL
  "28": "nl-east", // MIA
  "21": "nl-east", // NYM
  "22": "nl-east", // PHI
  "20": "nl-east", // WSH
  // NL Central
  "16": "nl-central", // CHC
  "17": "nl-central", // CIN
  "8": "nl-central", // MIL
  "24": "nl-central", // PIT
  "25": "nl-central", // STL
  // NL West
  "29": "nl-west", // ARI
  "27": "nl-west", // COL
  "19": "nl-west", // LAD (corrected below)
  "26": "nl-west", // SD
  "4": "nl-west", // SF
}

// Corrected division map
const correctedDivisionMap: Record<string, string> = {
  // AL East
  "10": "al-east", // NYY
  "1": "al-east", // BAL
  "2": "al-east", // BOS
  "30": "al-east", // TB
  "14": "al-east", // TOR
  // AL Central
  "5": "al-central", // CLE
  "4": "al-central", // CWS
  "6": "al-central", // DET
  "7": "al-central", // KC
  "9": "al-central", // MIN
  // AL West
  "18": "al-west", // HOU
  "3": "al-west", // LAA
  "11": "al-west", // OAK
  "12": "al-west", // SEA
  "13": "al-west", // TEX
  // NL East
  "15": "nl-east", // ATL
  "28": "nl-east", // MIA
  "21": "nl-east", // NYM
  "22": "nl-east", // PHI
  "20": "nl-east", // WSH
  // NL Central
  "16": "nl-central", // CHC
  "17": "nl-central", // CIN
  "8": "nl-central", // MIL
  "23": "nl-central", // PIT
  "24": "nl-central", // STL
  // NL West
  "29": "nl-west", // ARI
  "27": "nl-west", // COL
  "19": "nl-west", // LAD
  "25": "nl-west", // SD
  "26": "nl-west", // SF
}

export async function GET() {
  try {
    const response = await fetch("https://site.api.espn.com/apis/site/v2/sports/baseball/mlb/teams", {
      headers: {
        Accept: "application/json",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
      next: { revalidate: 3600 }, // Cache for 1 hour
    })

    if (!response.ok) {
      throw new Error(`ESPN API responded with status: ${response.status}`)
    }

    const data = await response.json()

    const teams =
      data.sports?.[0]?.leagues?.[0]?.teams?.map((teamWrapper: any) => {
        const team = teamWrapper.team
        const record = team.record?.items?.[0]
        const stats = record?.stats || []

        const wins = stats.find((s: any) => s.name === "wins")?.value || 0
        const losses = stats.find((s: any) => s.name === "losses")?.value || 0

        return {
          id: team.id,
          name: team.displayName,
          abbr: team.abbreviation,
          location: team.location,
          nickname: team.name,
          division: correctedDivisionMap[team.id] || "unknown",
          wins: Math.round(wins),
          losses: Math.round(losses),
          logo: team.logos?.[0]?.href || `/placeholder.svg?height=80&width=80&query=${team.displayName} logo`,
          color: `#${team.color || "003087"}`,
          alternateColor: `#${team.alternateColor || "FFFFFF"}`,
          standingSummary: team.standingSummary || "",
        }
      }) || []

    return NextResponse.json({ teams })
  } catch (error) {
    console.error("Error fetching MLB teams:", error)
    return NextResponse.json({ error: "Failed to fetch teams data" }, { status: 500 })
  }
}
