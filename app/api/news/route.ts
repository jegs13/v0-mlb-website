import { NextResponse } from "next/server"

export async function GET() {
  try {
    const response = await fetch("https://site.api.espn.com/apis/site/v2/sports/baseball/mlb/news", {
      headers: {
        Accept: "application/json",
        "User-Agent": "Mozilla/5.0",
      },
      next: { revalidate: 300 }, // Cache for 5 minutes
    })

    if (!response.ok) {
      throw new Error(`ESPN API responded with status: ${response.status}`)
    }

    const data = await response.json()

    // Transform the ESPN news data
    const news =
      data.articles?.map((article: any) => ({
        id: article.dataSourceIdentifier || article.headline,
        title: article.headline,
        subtitle: article.description || "",
        image: article.images?.[0]?.url || "/baseball-stadium.png",
        category: article.categories?.[0]?.description || article.type || "MLB NEWS",
        link: article.links?.web?.href || "#",
        published: article.published,
      })) || []

    return NextResponse.json({ news: news.slice(0, 8) }) // Return top 8 news items
  } catch (error) {
    console.error("[v0] Error fetching MLB news:", error)
    return NextResponse.json({ error: "Failed to fetch news", news: [] }, { status: 500 })
  }
}
