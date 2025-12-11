import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import OpenAI from 'openai'

export const runtime = 'nodejs'

// Set guest limits here
const GUEST_MESSAGE_LIMIT = 3
const GUEST_RESET_DAYS = 7

// Define allowed roles with full AI access
const ALLOWED_ROLES = ['admin', 'team', 'client']

export async function POST(req: Request) {
  try {
    const { messages } = await req.json()
    console.log('Received messages:', messages.length)

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    console.log('Supabase client created')

    // Get the user info from auth/session
    const token = req.headers.get('Authorization')?.replace('Bearer ', '')
    let user = null
    let role = 'guest'
    if (token) {
      const { data, error } = await supabase.auth.getUser(token)
      if (error) console.error('Auth error:', error)
      else user = data.user
      if (user) {
        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('role')
          .eq('id', user.id)
          .single()
        if (!profileError && profile?.role) {
          role = profile.role
        }
      }
    }

    // Restrict access for unauthorized roles
    if (role === 'guest') {
      // Guest message limit check (handled below)
      const guestToken = token || 'anon'
      const { data: guestData, error: guestError } = await supabase
        .from('guest_message_counts')
        .select('*')
        .eq('guest_token', guestToken)
        .single()

      if (guestError && guestError.code !== 'PGRST116') {
        console.error('Guest fetch error:', guestError)
        throw guestError
      }

      let count = guestData?.count || 0
      const lastMessageDate = guestData?.last_message ? new Date(guestData.last_message) : null
      const now = new Date()

      // Reset count if last message was more than GUEST_RESET_DAYS ago
      if (!lastMessageDate || now.getTime() - lastMessageDate.getTime() > GUEST_RESET_DAYS * 24 * 60 * 60 * 1000) {
        count = 0
      }

      if (count >= GUEST_MESSAGE_LIMIT) {
        return NextResponse.json(
          { error: 'Guest message limit reached. Please log in to continue.', promptLogin: true },
          { status: 403 }
        )
      }

      // Upsert guest count
      await supabase
        .from('guest_message_counts')
        .upsert({
          guest_token: guestToken,
          count: count + 1,
          last_message: now.toISOString()
        })

      console.log(`Guest ${guestToken} message count: ${count + 1}`)
    } else if (!ALLOWED_ROLES.includes(role)) {
      // Block users with unauthorized roles
      return NextResponse.json(
        { error: 'You do not have access to the AI assistant. Please contact support.' },
        { status: 403 }
      )
    }

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

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    console.log('OpenAI client created')

    // Role-based model/tooling (simple gate for now)
    const model = 'gpt-4o-mini'
    const completion = await client.chat.completions.create({
      model,
      messages: [{ role: 'system', content: systemPrompt }, ...messages]
    })

    const reply = completion.choices[0]?.message?.content || 'No response.'
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
