import OpenAI from "openai";
import { NextRequest, NextResponse } from "next/server";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// System prompt with project context
const SYSTEM_PROMPT = `You are an AI assistant for AJ247 Studios, a creative digital studio specializing in exceptional digital experiences through innovative design and cutting-edge technology.

Project Information:
- Website: Built with Next.js 16, React 19, TypeScript, and Tailwind CSS
- Key Features: Portfolio showcase, AI chat integration, image upload system, YouTube embeds
- Tech Stack:
  * Frontend: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4
  * Backend: Next.js API Routes
  * Database: Supabase (PostgreSQL)
  * AI: OpenAI GPT-4o-mini
  * Analytics: Vercel Analytics
  * Hosting: Vercel

Available Pages:
- Home page with hero section
- Portfolio page with project grid
- Admin upload page for managing portfolio items
- Contact functionality

Your role is to:
1. Answer questions about AJ247 Studios and their services
2. Help visitors learn about the portfolio and projects
3. Provide technical information about the website if asked
4. Be friendly, professional, and helpful

Keep responses concise and focused. If asked about technical details you're not sure about, be honest about limitations.`;

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
