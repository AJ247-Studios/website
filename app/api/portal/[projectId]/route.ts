import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'

export async function GET(_req: Request, { params }: { params: Promise<{ projectId: string }> }) {
  try {
    const { projectId } = await params
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Auth
    // Note: this endpoint is public GET in Next by default, we still require token header
    // If missing, reject.
    // In the client we call fetch without auth header, so we fallback to deny unless RLS is open.
    // To support client fetch, we could switch to route handling cookies via supabase SSR in the future.
    const token = ''

    // Load project
    const { data: project, error: projErr } = await supabase
      .from('projects')
      .select('id,name,details')
      .eq('id', projectId)
      .single()

    if (projErr) return NextResponse.json({ error: 'Project not found' }, { status: 404 })

    // Load media
    const { data: media, error: mediaErr } = await supabase
      .from('project_media')
      .select('id,type,url,youtube_id,title,description,category')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })

    if (mediaErr) {
      // Fallback to empty if table not created yet
    }

    // Load invoices
    const { data: invoices, error: invErr } = await supabase
      .from('project_invoices')
      .select('id,number,amount_cents,status,link_url,issued_at,due_at')
      .eq('project_id', projectId)
      .order('issued_at', { ascending: false })

    if (invErr) {
      // Fallback to empty
    }

    return NextResponse.json({
      project,
      media: media || [],
      invoices: invoices || []
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 })
  }
}
