import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';

type RouteParams = { params: Promise<{ projectId: string }> };

/**
 * GET /api/projects/[projectId]/members - List project members
 * POST /api/projects/[projectId]/members - Add members to a project
 */

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { projectId } = await params;
    
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Auth via Authorization header
    const token = req.headers.get('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: authData, error: authError } = await supabase.auth.getUser(token);
    if (authError || !authData.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = authData.user.id;

    // Check if user has access to this project
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', userId)
      .single();

    const isAdmin = profile?.role === 'admin';

    if (!isAdmin) {
      const { data: membership } = await supabase
        .from('project_members')
        .select('id')
        .eq('project_id', projectId)
        .eq('user_id', userId)
        .single();

      if (!membership) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 });
      }
    }

    // Get project members with user info
    const { data: members, error: membersError } = await supabase
      .from('project_members')
      .select(`
        id,
        user_id,
        role,
        created_at,
        user_profiles:user_id (
          display_name,
          email,
          avatar_url
        )
      `)
      .eq('project_id', projectId)
      .order('created_at', { ascending: true });

    if (membersError) {
      return NextResponse.json({ error: membersError.message }, { status: 500 });
    }

    return NextResponse.json({ members: members || [] });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const { projectId } = await params;
    
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Auth via Authorization header
    const token = req.headers.get('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: authData, error: authError } = await supabase.auth.getUser(token);
    if (authError || !authData.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = authData.user.id;

    // Check role - only admin/team can add members
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', userId)
      .single();

    if (!profile || !['admin', 'team'].includes(profile.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Parse request body
    const body = await req.json();
    const { members } = body as {
      members: Array<{ user_id: string; role: 'client' | 'team' | 'admin' }>;
    };

    if (!members || !Array.isArray(members) || members.length === 0) {
      return NextResponse.json({ error: 'members array is required' }, { status: 400 });
    }

    // Check project exists
    const { data: project } = await supabase
      .from('projects')
      .select('id')
      .eq('id', projectId)
      .single();

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Get existing members to avoid duplicates
    const { data: existingMembers } = await supabase
      .from('project_members')
      .select('user_id')
      .eq('project_id', projectId);

    const existingUserIds = new Set(existingMembers?.map(m => m.user_id) || []);

    // Filter out duplicates
    const newMembers = members
      .filter(m => !existingUserIds.has(m.user_id))
      .map(m => ({
        project_id: projectId,
        user_id: m.user_id,
        role: m.role,
      }));

    if (newMembers.length === 0) {
      return NextResponse.json({ 
        message: 'All users are already members',
        added: 0,
      });
    }

    // Insert new members
    const { error: insertError } = await supabase
      .from('project_members')
      .insert(newMembers);

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({ 
      message: `Added ${newMembers.length} member(s)`,
      added: newMembers.length,
    }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
