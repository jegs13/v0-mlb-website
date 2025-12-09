import { NextResponse } from "next/server"

export async function GET() {
  try {
    const response = await fetch("https://site.api.espn.com/apis/site/v2/sports/baseball/mlb/scoreboard", {
      next: { revalidate: 60 },
      headers: {
        Accept: "application/json",
      },
    })

    console.log("[v0] ESPN API response status:", response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.log("[v0] ESPN API error response:", errorText)
      throw new Error(`Failed to fetch scores: ${response.status}`)
    }

    const data = await response.json()
    console.log("[v0] ESPN API returned events count:", data.events?.length || 0)

    // Transform ESPN data to our format
    const games =
      data.events?.map((event: any) => {
        const competition = event.competitions?.[0]
        const homeTeam = competition?.competitors?.find((c: any) => c.homeAway === "home")
        const awayTeam = competition?.competitors?.find((c: any) => c.homeAway === "away")
        const status = competition?.status

        // Determine display status
        let displayStatus = "Scheduled"
        let inning = null

        if (status?.type?.completed) {
          displayStatus = "Final"
        } else if (status?.type?.state === "in") {
          displayStatus = "Live"
          inning = status?.type?.detail || status?.type?.shortDetail
        } else if (status?.type?.state === "pre") {
          // Format the start time
          const startDate = new Date(event.date)
          displayStatus = startDate.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          })
        }

        return {
          id: event.id,
          homeTeam: {
            name: homeTeam?.team?.displayName || "TBD",
            abbr: homeTeam?.team?.abbreviation || "TBD",
            score: Number.parseInt(homeTeam?.score || "0"),
            logo: homeTeam?.team?.logo || null,
          },
          awayTeam: {
            name: awayTeam?.team?.displayName || "TBD",
            abbr: awayTeam?.team?.abbreviation || "TBD",
            score: Number.parseInt(awayTeam?.score || "0"),
            logo: awayTeam?.team?.logo || null,
          },
          status: displayStatus,
          inning,
        }
      }) || []

    return NextResponse.json({ games, lastUpdated: new Date().toISOString() })
  } catch (error) {
    console.error("Error fetching MLB scores:", error)
    return NextResponse.json({ error: "Failed to fetch scores", games: [] }, { status: 500 })
  }
}
