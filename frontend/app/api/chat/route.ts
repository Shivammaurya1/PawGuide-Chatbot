import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    // Get the request body
    const body = await request.json()

    // Forward the request to the Python backend
    const backendUrl = process.env.BACKEND_URL || "http://localhost:8000/api/chat"

    const response = await fetch(backendUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      throw new Error(`Backend responded with status: ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("API route error:", error)
    return NextResponse.json(
      {
        text: "I'm having trouble connecting to my knowledge base right now. Please try again in a moment.",
      },
      { status: 500 },
    )
  }
}

