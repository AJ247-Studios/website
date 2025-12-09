import { NextRequest } from "next/server";

// System prompt with project context
const SYSTEM_PROMPT = `You are an AI assistant for AJ247 Studios, a creative studio specializing in professional photography and videography services.

About AJ247 Studios:
- We create exceptional visual content through innovative photography and videography
- We specialize in capturing memorable moments and bringing creative visions to life
- Our services include photo shoots, video production, editing, and post-production work
- We work with clients to deliver high-quality visual content for events, portraits, commercial projects, and creative endeavors

Your role is to:
1. Help visitors learn about our photography and videography services
2. Answer questions about booking, pricing, and project inquiries
3. Showcase our portfolio and past work
4. Provide information about what we offer and how we can help with their visual content needs
5. Be friendly, professional, and enthusiastic about visual storytelling

Keep responses concise and focused. Encourage visitors to view our portfolio and reach out for consultations or bookings.`;

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return Response.json(
        { error: "Invalid request: messages array required" },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error("OPENAI_API_KEY is not configured");
      return Response.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    // Add system prompt to the beginning of messages
    const messagesWithSystem = [
      { role: "system", content: SYSTEM_PROMPT },
      ...messages,
    ];

    console.log("Sending request to OpenAI with", messages.length, "messages");

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: messagesWithSystem,
        max_tokens: 600
      })
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("OpenAI API error:", error);
      return Response.json(
        { error: "Failed to get response from AI" },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log("OpenAI response received successfully");
    
    return Response.json(data);
  } catch (error: any) {
    console.error("Chat API error:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
