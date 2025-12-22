import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';

/**
 * GET /api/projects - List all projects for the current user
 * POST /api/projects - Create a new project (admin/team only)
 */

export async function GET(req: NextRequest) {
  try {
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

    // Get user's role
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', userId)
      .single();

    // For admin, get all projects. For others, get projects they're members of.
    let query;
    if (profile?.role === 'admin') {
      query = supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });
    } else {
      // Get project IDs where user is a member
      const { data: memberProjects } = await supabase
        .from('project_members')
        .select('project_id')
        .eq('user_id', userId);

      const projectIds = memberProjects?.map(m => m.project_id) || [];

      if (projectIds.length === 0) {
        return NextResponse.json({ projects: [] });
      }

      query = supabase
        .from('projects')
        .select('*')
        .in('id', projectIds)
        .order('created_at', { ascending: false });
    }

    const { data: projects, error: projectsError } = await query;

    if (projectsError) {
      return NextResponse.json({ error: projectsError.message }, { status: 500 });
    }

    return NextResponse.json({ projects: projects || [] });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
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

    const creatorId = authData.user.id;

    // Check role - only admin/team can create projects
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', creatorId)
      .single();

    if (profileError || !profile || !['admin', 'team'].includes(profile.role)) {
      return NextResponse.json({ error: 'Forbidden - admin or team role required' }, { status: 403 });
    }

    // Parse request body
    const body = await req.json();
    const { title, description, client_id, members } = body as {
      title: string;
      description?: string;
      client_id: string;
      members?: Array<{ user_id: string; role: 'client' | 'team' | 'admin' }>;
    };

    if (!title || !client_id) {
      return NextResponse.json({ error: 'title and client_id are required' }, { status: 400 });
    }

    // Create the project
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .insert({
        title,
        description,
        client_id,
        status: 'active',
      })
      .select()
      .single();

    if (projectError) {
      return NextResponse.json({ error: projectError.message }, { status: 500 });
    }

    // Add project members
    const projectMembers = [
      // Always add the client as a member
      { project_id: project.id, user_id: client_id, role: 'client' },
      // Always add the creator (admin/team)
      { project_id: project.id, user_id: creatorId, role: profile.role },
      // Add any additional members
      ...(members || []).map(m => ({
        project_id: project.id,
        user_id: m.user_id,
        role: m.role,
      })),
    ];

    // Dedupe members by user_id (keep first occurrence)
    const seenUserIds = new Set<string>();
    const uniqueMembers = projectMembers.filter(m => {
      if (seenUserIds.has(m.user_id)) return false;
      seenUserIds.add(m.user_id);
      return true;
    });

    const { error: membersError } = await supabase
      .from('project_members')
      .insert(uniqueMembers);

    if (membersError) {
      // Log but don't fail - project was created
      console.error('Failed to add project members:', membersError);
    }

    return NextResponse.json({ 
      project,
      members_added: uniqueMembers.length,
    }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
