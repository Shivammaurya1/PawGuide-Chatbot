import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    // Get the request body
    const body = await request.json()

    // Extract the last user message
    const messages = body.messages || []
    const lastUserMessage = messages.filter((m) => m.role === "user").pop()
    const query = lastUserMessage?.content || ""

    // Create a mock response
    const mockResponse = {
      text: `This is a mock response to your question: "${query}"\n\n## Pet Care Tips\n\n- Make sure to provide fresh water daily\n- Regular exercise is important for all pets\n- Schedule regular vet check-ups\n\n**Remember:** Each pet has unique needs based on their species, breed, age, and health status.`,
    }

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    return NextResponse.json(mockResponse)
  } catch (error) {
    console.error("Mock API error:", error)
    return NextResponse.json(
      {
        text: "I'm having trouble processing your request right now. Please try again in a moment.",
      },
      { status: 500 },
    )
  }
}

