import { NextResponse } from "next/server"

export async function GET() {
  try {
    const apiKey = process.env.SPORTRADAR_API_KEY
    
    console.log('API Key exists:', !!apiKey)
    console.log('API Key length:', apiKey?.length)
    
    if (!apiKey) {
      return NextResponse.json(
        { error: "API key not configured" },
        { status: 500 }
      )
    }
    
    const url = `https://api.sportradar.com/mlb/trial/v8/en/seasons/2024/REG/standings.json?api_key=${apiKey}`
    console.log('Fetching from URL:', url.replace(apiKey, 'HIDDEN'))
    
    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
      },
      next: { revalidate: 3600 }, // Cache for 1 hour
    })

    console.log('Response status:', response.status)
    console.log('Response headers:', Object.fromEntries(response.headers.entries()))

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Sportradar API error: ${response.status} - ${errorText}`)
      return NextResponse.json(
        { 
          error: "Failed to fetch standings data", 
          details: errorText,
          status: response.status 
        },
        { status: 500 }
      )
    }

    const data = await response.json()
    console.log('Successfully fetched standings data')

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching standings:", error)
    return NextResponse.json(
      { error: "Failed to fetch standings data", details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
