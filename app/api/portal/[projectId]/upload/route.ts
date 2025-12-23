import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { buildStoragePath, STORAGE_BUCKET } from '@/lib/supabase-storage'

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
    let storagePath: string | null = null
    let type: 'photo' | 'video' | 'youtube' = 'photo'

    if (youtube_id && !file) {
      type = 'youtube'
    } else if (file) {
      const ext = file.name.split('.').pop()?.toLowerCase() || 'bin'
      const isVideo = ['mp4','mov','webm','mkv','avi'].includes(ext)
      type = isVideo ? 'video' : 'photo'
      
      // Build storage path for Supabase Storage
      storagePath = buildStoragePath({
        assetType: 'deliverable',
        projectId,
        filename: file.name,
      })
      
      // Upload directly to Supabase Storage
      const { data: uploadData, error: uploadErr } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(storagePath, file, {
          cacheControl: '3600',
          upsert: false,
        })

      if (uploadErr) {
        return NextResponse.json({ error: uploadErr.message }, { status: 500 })
      }

      // Create signed URL for immediate use (optional)
      const { data: signedData } = await supabase.storage
        .from(STORAGE_BUCKET)
        .createSignedUrl(storagePath, 3600)
      
      url = signedData?.signedUrl || null

      // Save to media_assets table
      await supabase.from('media_assets').insert([{
        uploaded_by: authData.user.id,
        project_id: projectId,
        size: file.size,
        mime_type: file.type,
        storage_path: storagePath,
        asset_type: 'deliverable',
      }])
    } else {
      return NextResponse.json({ error: 'Provide a file or YouTube ID' }, { status: 400 })
    }

    const { error: insertErr } = await supabase
      .from('project_media')
      .insert([{
        project_id: projectId,
        type,
        url,
        storage_path: storagePath,
        youtube_id,
        title,
        description,
        category,
        created_by: authData.user.id
      }])
    if (insertErr) return NextResponse.json({ error: insertErr.message }, { status: 500 })

    return NextResponse.json({ ok: true })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
