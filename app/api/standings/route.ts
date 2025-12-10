import { NextResponse } from "next/server"

export async function GET() {
  try {
    // You'll need to add your Sportradar API key to your environment variables
    const apiKey = process.env.SPORTRADAR_API_KEY || 'your_api_key_here'
    
    const response = await fetch(
      `https://api.sportradar.com/mlb/trial/v8/en/seasons/2024/REG/standings.json?api_key=${apiKey}`,
      {
        headers: {
          Accept: "application/json",
        },
        next: { revalidate: 3600 }, // Cache for 1 hour
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Sportradar API error: ${response.status} - ${errorText}`)
      throw new Error(`Sportradar API responded with status: ${response.status}`)
    }

    const data = await response.json()

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching standings:", error)
    return NextResponse.json(
      { error: "Failed to fetch standings data", details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
