import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'

export async function POST(req: NextRequest, { params }: { params: Promise<{ projectId: string }> }) {
  try {
    const { projectId } = await params
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Auth via Authorization header (team/admin only)
    const token = req.headers.get('Authorization')?.replace('Bearer ', '')
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { data: authData, error: authErr } = await supabase.auth.getUser(token)
    if (authErr || !authData.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: profile, error: profErr } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', authData.user.id)
      .single()
    if (profErr || !profile || (profile.role !== 'team' && profile.role !== 'admin')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const title = (formData.get('title') as string) || null
    const description = (formData.get('description') as string) || null
    const category = (formData.get('category') as string) || null
    const youtube_id = (formData.get('youtube_id') as string) || null

    let url: string | null = null
    let type: 'photo' | 'video' | 'youtube' = 'photo'

    if (youtube_id && !file) {
      type = 'youtube'
    } else if (file) {
      const ext = file.name.split('.').pop()?.toLowerCase() || 'bin'
      const isVideo = ['mp4','mov','webm','mkv','avi'].includes(ext)
      type = isVideo ? 'video' : 'photo'
      const path = `${projectId}/${Date.now()}-${file.name}`
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('portfolio') // reuse existing public bucket
        .upload(path, file, { upsert: true })
      if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 500 })
      const { data: pub } = supabase.storage.from('portfolio').getPublicUrl(uploadData.path)
      url = pub.publicUrl
    } else {
      return NextResponse.json({ error: 'Provide a file or YouTube ID' }, { status: 400 })
    }

    const { error: insertErr } = await supabase
      .from('project_media')
      .insert([{
        project_id: projectId,
        type,
        url,
        youtube_id,
        title,
        description,
        category,
        created_by: authData.user.id
      }])
    if (insertErr) return NextResponse.json({ error: insertErr.message }, { status: 500 })

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 })
  }
}
