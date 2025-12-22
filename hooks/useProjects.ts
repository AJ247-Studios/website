"use client";

import { useState, useCallback, useEffect } from "react";
import { useSupabase } from "@/components/SupabaseProvider";
import {
  createProject,
  createProjectWithMembers,
  addProjectMembers,
  getUserProjects,
  getProject,
  type Project,
  type ProjectRole,
  type CreateProjectInput,
} from "@/lib/projects";

export interface UseProjectsReturn {
  // Data
  projects: Project[];
  currentProject: Project | null;
  
  // Loading states
  isLoading: boolean;
  isCreating: boolean;
  
  // Error
  error: string | null;
  
  // Actions
  loadProjects: () => Promise<void>;
  loadProject: (projectId: string) => Promise<Project | null>;
  createNewProject: (input: CreateProjectInput, members?: Array<{ user_id: string; role: ProjectRole }>) => Promise<Project | null>;
  addMembers: (projectId: string, members: Array<{ user_id: string; role: ProjectRole }>) => Promise<boolean>;
  clearError: () => void;
}

/**
 * Hook for project management
 * 
 * Provides CRUD operations for projects with proper RLS enforcement.
 * 
 * Usage:
 * ```tsx
 * const { projects, loadProjects, createNewProject, isLoading } = useProjects();
 * 
 * useEffect(() => {
 *   loadProjects();
 * }, [loadProjects]);
 * 
 * const handleCreate = async () => {
 *   const project = await createNewProject({
 *     title: 'Client Shoot – December',
 *     client_id: clientUserId,
 *   }, [
 *     { user_id: adminId, role: 'admin' },
 *     { user_id: teamId, role: 'team' },
 *   ]);
 * };
 * ```
 */
export function useProjects(): UseProjectsReturn {
  const { supabase, session } = useSupabase();
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Load all projects for the current user
   */
  const loadProjects = useCallback(async () => {
    if (!session) {
      setError("You must be logged in to view projects");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { projects: data, error: fetchError } = await getUserProjects(supabase);
      
      if (fetchError) {
        setError(fetchError.message);
        return;
      }

      setProjects(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load projects");
    } finally {
      setIsLoading(false);
    }
  }, [supabase, session]);

  /**
   * Load a single project by ID
   */
  const loadProject = useCallback(async (projectId: string): Promise<Project | null> => {
    if (!session) {
      setError("You must be logged in to view projects");
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { project, error: fetchError } = await getProject(supabase, projectId);
      
      if (fetchError) {
        setError(fetchError.message);
        return null;
      }

      setCurrentProject(project);
      return project;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load project");
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [supabase, session]);

  /**
   * Create a new project with optional members
   * 
   * If members are provided, uses createProjectWithMembers for atomic creation.
   */
  const createNewProject = useCallback(async (
    input: CreateProjectInput,
    members?: Array<{ user_id: string; role: ProjectRole }>
  ): Promise<Project | null> => {
    if (!session) {
      setError("You must be logged in to create projects");
      return null;
    }

    setIsCreating(true);
    setError(null);

    try {
      let result;
      
      if (members && members.length > 0) {
        // Create with members in one operation
        result = await createProjectWithMembers(supabase, input, members);
      } else {
        // Just create the project (client will be added automatically)
        result = await createProjectWithMembers(supabase, input, []);
      }

      if (result.error) {
        setError(result.error.message);
        return null;
      }

      // Add to local state
      if (result.project) {
        setProjects(prev => [result.project!, ...prev]);
      }

      return result.project;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create project");
      return null;
    } finally {
      setIsCreating(false);
    }
  }, [supabase, session]);

  /**
   * Add members to an existing project
   */
  const addMembersToProject = useCallback(async (
    projectId: string,
    members: Array<{ user_id: string; role: ProjectRole }>
  ): Promise<boolean> => {
    if (!session) {
      setError("You must be logged in to add members");
      return false;
    }

    setError(null);

    try {
      const { success, error: addError } = await addProjectMembers(supabase, {
        project_id: projectId,
        members,
      });

      if (addError) {
        setError(addError.message);
        return false;
      }

      return success;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add members");
      return false;
    }
  }, [supabase, session]);

  return {
    projects,
    currentProject,
    isLoading,
    isCreating,
    error,
    loadProjects,
    loadProject,
    createNewProject,
    addMembers: addMembersToProject,
    clearError,
  };
}

export default useProjects;
