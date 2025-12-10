import { NextResponse } from "next/server"

export async function GET() {
  try {
    const apiKey = process.env.SPORTRADAR_API_KEY
    
    console.log('API Key exists:', !!apiKey)
    
    if (!apiKey) {
      return NextResponse.json(
        { error: "API key not configured" },
        { status: 500 }
      )
    }
    
    // Try production endpoint format (some trial keys work here)
    const url = `https://api.sportradar.us/mlb/trial/v7.0/en/seasons/2024/REG/standings.json?api_key=${apiKey}`
    console.log('Fetching from URL:', url.replace(apiKey, 'HIDDEN'))
    
    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
      },
      cache: 'no-store',
    })

    console.log('Response status:', response.status)
    const responseText = await response.text()
    console.log('Response text (first 500 chars):', responseText.substring(0, 500))

    if (!response.ok) {
      console.error(`Sportradar API error: ${response.status} - ${responseText}`)
      return NextResponse.json(
        { 
          error: "Failed to fetch standings data", 
          details: responseText,
          status: response.status,
          url: url.replace(apiKey, 'HIDDEN')
        },
        { status: response.status }
      )
    }

    const data = JSON.parse(responseText)
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
