import OpenAI from "openai";
import { NextRequest, NextResponse } from "next/server";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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

export async function POST(request: NextRequest) {
  try {
    // Check if API key is configured
    if (!process.env.OPENAI_API_KEY) {
      console.error("OPENAI_API_KEY is not configured");
      return NextResponse.json(
        { error: "API key not configured" },
        { status: 500 }
      );
    }

    const { messages } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Invalid messages format" },
        { status: 400 }
      );
    }

    // Add system prompt to the beginning of messages
    const messagesWithSystem = [
      { role: "system" as const, content: SYSTEM_PROMPT },
      ...messages,
    ];

    console.log("Sending request to OpenAI with", messages.length, "messages");

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: messagesWithSystem,
      temperature: 0.7,
      max_tokens: 500,
    });

    const message = completion.choices[0]?.message?.content || "No response";

    console.log("OpenAI response received successfully");

    return NextResponse.json({ message });
  } catch (error: any) {
    console.error("OpenAI API error details:", {
      message: error.message,
      type: error.type,
      code: error.code,
      status: error.status,
    });
    return NextResponse.json(
      { error: "Failed to process chat request", details: error.message },
      { status: 500 }
    );
  }
}
