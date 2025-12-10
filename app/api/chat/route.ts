import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import OpenAI from 'openai'

export const runtime = 'nodejs'

export async function POST(req: Request) {
  try {
    const { messages } = await req.json()
    console.log('Received messages:', messages.length)

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!  // safer for reading a single row
    )
    console.log('Supabase client created')

    // Fetch system prompt
    const { data, error } = await supabase
      .from('ai_settings')
      .select('system_prompt')
      .eq('name', 'general')
      .single()

    if (error) {
      console.error('Supabase error:', error)
      throw error
    }

    const systemPrompt = data.system_prompt
    console.log('Fetched system prompt:', systemPrompt?.slice(0, 50))

    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    })
    console.log('OpenAI client created')

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
    console.log('OpenAI reply received:', reply.slice(0, 50))

    return NextResponse.json({ reply })
  } catch (err: any) {
    console.error('POST error:', err)
    return NextResponse.json(
      { error: err.message || 'Server error' },
      { status: 500 }
    )
  }
}
