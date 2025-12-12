/**
 * ProjectTimeline Component
 * 
 * Shows project timeline with milestones and status:
 * - Visual timeline with status chips
 * - Scheduled dates and completed dates
 * - Reduces client uncertainty
 */

"use client";

import type { Project, ProjectMilestone } from "@/lib/types/portal";
import { getStatusColor, formatCurrency } from "@/lib/portal-data";

interface ProjectTimelineProps {
  projects: Project[];
  onViewProject: (projectId: string) => void;
}

export function ProjectTimeline({ projects, onViewProject }: ProjectTimelineProps) {
  // Sort by most recent activity
  const sortedProjects = [...projects].sort(
    (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
  );

  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          Your Projects
        </h2>
        <span className="text-sm text-slate-500 dark:text-slate-400">
          {projects.length} {projects.length === 1 ? "project" : "projects"}
        </span>
      </div>

      <div className="space-y-4">
        {sortedProjects.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            onView={() => onViewProject(project.id)}
          />
        ))}
      </div>
    </section>
  );
}

interface ProjectCardProps {
  project: Project;
  onView: () => void;
}

function ProjectCard({ project, onView }: ProjectCardProps) {
  const statusColors = getStatusColor(project.status);
  const completedMilestones = project.milestones.filter(m => m.status === "completed").length;
  const progress = (completedMilestones / project.milestones.length) * 100;
  const paymentProgress = project.total_value_cents > 0 
    ? (project.paid_cents / project.total_value_cents) * 100 
    : 100;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
      <button
        onClick={onView}
        className="w-full text-left p-4 sm:p-5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-slate-900 dark:text-white truncate mb-1">
              {project.title}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {project.service_type.charAt(0).toUpperCase() + project.service_type.slice(1)}
              {project.shoot_date && (
                <> • Shoot: {formatShootDate(project.shoot_date)}</>
              )}
            </p>
          </div>
          <span className={`shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full ${statusColors.bg} ${statusColors.text}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${statusColors.dot}`} />
            {formatProjectStatus(project.status)}
          </span>
        </div>

        {/* Progress bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1.5">
            <span>Progress</span>
            <span>{completedMilestones} of {project.milestones.length} milestones</span>
          </div>
          <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Milestones timeline */}
        <div className="flex items-center gap-1 mb-4 overflow-x-auto pb-2 scrollbar-hide">
          {project.milestones.map((milestone, index) => (
            <MilestoneChip key={milestone.id} milestone={milestone} index={index} />
          ))}
        </div>

        {/* Footer stats */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-4 text-sm">
            {project.deliverables_count > 0 && (
              <span className="text-slate-600 dark:text-slate-400">
                <span className="font-medium text-slate-900 dark:text-white">
                  {project.deliverables_count}
                </span>{" "}
                files
              </span>
            )}
            {project.pending_approvals > 0 && (
              <span className="text-amber-600 dark:text-amber-400">
                <span className="font-medium">{project.pending_approvals}</span> to review
              </span>
            )}
          </div>
          
          {/* Payment status */}
          <div className="text-right">
            <div className="text-xs text-slate-500 dark:text-slate-400 mb-0.5">
              {paymentProgress < 100 ? "Paid" : "Total"}
            </div>
            <div className="text-sm font-medium text-slate-900 dark:text-white">
              {paymentProgress < 100 ? (
                <>
                  {formatCurrency(project.paid_cents)}{" "}
                  <span className="text-slate-400">/ {formatCurrency(project.total_value_cents)}</span>
                </>
              ) : (
                formatCurrency(project.total_value_cents)
              )}
            </div>
          </div>
        </div>
      </button>
    </div>
  );
}

interface MilestoneChipProps {
  milestone: ProjectMilestone;
  index: number;
}

function MilestoneChip({ milestone, index }: MilestoneChipProps) {
  const isCompleted = milestone.status === "completed";
  const isInProgress = milestone.status === "in_progress";
  const isSkipped = milestone.status === "skipped";

  return (
    <div className="flex items-center shrink-0">
      {index > 0 && (
        <div className={`w-4 h-0.5 ${isCompleted ? "bg-blue-600" : "bg-slate-200 dark:bg-slate-700"}`} />
      )}
      <div
        className={`
          relative px-2.5 py-1 text-xs font-medium rounded-full whitespace-nowrap
          ${isCompleted ? "bg-blue-600 text-white" : ""}
          ${isInProgress ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 ring-2 ring-blue-600" : ""}
          ${milestone.status === "pending" ? "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400" : ""}
          ${isSkipped ? "bg-slate-100 dark:bg-slate-800 text-slate-400 line-through" : ""}
        `}
        title={milestone.completed_at 
          ? `Completed ${new Date(milestone.completed_at).toLocaleDateString()}`
          : milestone.scheduled_at 
            ? `Scheduled ${new Date(milestone.scheduled_at).toLocaleDateString()}`
            : undefined
        }
      >
        {isCompleted && (
          <svg className="w-3 h-3 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        )}
        {milestone.name}
      </div>
    </div>
  );
}

function formatProjectStatus(status: string): string {
  const labels: Record<string, string> = {
    inquiry: "Inquiry",
    quoted: "Quoted",
    confirmed: "Confirmed",
    scheduled: "Scheduled",
    in_progress: "In Progress",
    editing: "Editing",
    review: "In Review",
    delivered: "Delivered",
    completed: "Completed",
    cancelled: "Cancelled",
  };
  return labels[status] || status;
}

function formatShootDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const isPast = date < now;

  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
}

export default ProjectTimeline;
