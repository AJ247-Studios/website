import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import OpenAI from 'openai'

export const runtime = 'nodejs'

export async function POST(req: Request) {
  try {
    const { messages } = await req.json()

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!  // safer for reading a single row
    )

    // Fetch system prompt
    const { data, error } = await supabase
      .from('ai_settings')
      .select('system_prompt')
      .eq('name', 'general')
      .single()

    if (error) throw error

    const systemPrompt = data.system_prompt

    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    })

    // Call GPT-4o-mini
    const completion = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages
      ]
    })

    const reply =
      completion.choices[0]?.message?.content || 'No response.'

    return NextResponse.json({ reply })
  } catch (err: any) {
    console.error(err)
    return NextResponse.json(
      { error: err.message || 'Server error' },
      { status: 500 }
    )
  }
}
