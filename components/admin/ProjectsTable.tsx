/**
 * ProjectsTable Component
 * 
 * Admin projects table with:
 * - Filterable/sortable rows
 * - Bulk actions (change status, notify, export)
 * - Quick client view trigger
 */

"use client";

import { useState, useMemo } from "react";
import type { Project } from "@/lib/types/portal";
import { getStatusColor, formatCurrency } from "@/lib/portal-data";

interface ProjectsTableProps {
  projects: Project[];
  onViewClient: (clientId: string) => void;
  onBulkAction: (action: string, projectIds: string[]) => void;
  onViewProject: (projectId: string) => void;
}

type SortField = "title" | "status" | "shoot_date" | "updated_at" | "total_value_cents";
type SortDirection = "asc" | "desc";

export function ProjectsTable({
  projects,
  onViewClient,
  onBulkAction,
  onViewProject,
}: ProjectsTableProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [sortField, setSortField] = useState<SortField>("updated_at");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Filter and sort projects
  const filteredProjects = useMemo(() => {
    let result = [...projects];

    // Filter by status
    if (statusFilter !== "all") {
      result = result.filter(p => p.status === statusFilter);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(p => 
        p.title.toLowerCase().includes(query) ||
        p.service_type.toLowerCase().includes(query)
      );
    }

    // Sort
    result.sort((a, b) => {
      let aVal: string | number = "";
      let bVal: string | number = "";

      switch (sortField) {
        case "title":
          aVal = a.title.toLowerCase();
          bVal = b.title.toLowerCase();
          break;
        case "status":
          aVal = a.status;
          bVal = b.status;
          break;
        case "shoot_date":
          aVal = a.shoot_date ? new Date(a.shoot_date).getTime() : 0;
          bVal = b.shoot_date ? new Date(b.shoot_date).getTime() : 0;
          break;
        case "updated_at":
          aVal = new Date(a.updated_at).getTime();
          bVal = new Date(b.updated_at).getTime();
          break;
        case "total_value_cents":
          aVal = a.total_value_cents;
          bVal = b.total_value_cents;
          break;
      }

      if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    return result;
  }, [projects, statusFilter, searchQuery, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const handleSelectAll = () => {
    if (selectedIds.size === filteredProjects.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredProjects.map(p => p.id)));
    }
  };

  const handleSelectOne = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  const handleBulkAction = (action: string) => {
    onBulkAction(action, Array.from(selectedIds));
    setSelectedIds(new Set());
  };

  const statusOptions = [
    "all", "inquiry", "quoted", "confirmed", "scheduled", 
    "in_progress", "editing", "review", "delivered", "completed"
  ];

  return (
    <section className="mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
          Projects
        </h2>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {statusOptions.map(status => (
              <option key={status} value={status}>
                {status === "all" ? "All Statuses" : formatStatus(status)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Bulk actions bar */}
      {selectedIds.size > 0 && (
        <div className="flex items-center gap-3 mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
          <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
            {selectedIds.size} selected
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => handleBulkAction("notify")}
              className="px-3 py-1.5 text-xs font-medium text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-800 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-700 transition-colors"
            >
              Send Message
            </button>
            <button
              onClick={() => handleBulkAction("export")}
              className="px-3 py-1.5 text-xs font-medium text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-800 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-700 transition-colors"
            >
              Export CSV
            </button>
            <button
              onClick={() => setSelectedIds(new Set())}
              className="px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedIds.size === filteredProjects.length && filteredProjects.length > 0}
                    onChange={handleSelectAll}
                    className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="px-4 py-3 text-left">
                  <SortButton
                    label="Project"
                    field="title"
                    currentField={sortField}
                    direction={sortDirection}
                    onSort={handleSort}
                  />
                </th>
                <th className="px-4 py-3 text-left">
                  <SortButton
                    label="Status"
                    field="status"
                    currentField={sortField}
                    direction={sortDirection}
                    onSort={handleSort}
                  />
                </th>
                <th className="px-4 py-3 text-left hidden sm:table-cell">
                  <SortButton
                    label="Shoot Date"
                    field="shoot_date"
                    currentField={sortField}
                    direction={sortDirection}
                    onSort={handleSort}
                  />
                </th>
                <th className="px-4 py-3 text-right hidden md:table-cell">
                  <SortButton
                    label="Value"
                    field="total_value_cents"
                    currentField={sortField}
                    direction={sortDirection}
                    onSort={handleSort}
                  />
                </th>
                <th className="px-4 py-3 text-right">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredProjects.map((project) => (
                <ProjectRow
                  key={project.id}
                  project={project}
                  isSelected={selectedIds.has(project.id)}
                  onSelect={() => handleSelectOne(project.id)}
                  onViewClient={() => onViewClient(project.client_id)}
                  onView={() => onViewProject(project.id)}
                />
              ))}
            </tbody>
          </table>
        </div>

        {filteredProjects.length === 0 && (
          <div className="p-8 text-center">
            <p className="text-slate-500 dark:text-slate-400">No projects found</p>
          </div>
        )}
      </div>
    </section>
  );
}

interface SortButtonProps {
  label: string;
  field: SortField;
  currentField: SortField;
  direction: SortDirection;
  onSort: (field: SortField) => void;
}

function SortButton({ label, field, currentField, direction, onSort }: SortButtonProps) {
  const isActive = currentField === field;

  return (
    <button
      onClick={() => onSort(field)}
      className="flex items-center gap-1 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider hover:text-slate-900 dark:hover:text-white transition-colors"
    >
      {label}
      {isActive && (
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d={direction === "asc" ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"}
          />
        </svg>
      )}
    </button>
  );
}

interface ProjectRowProps {
  project: Project;
  isSelected: boolean;
  onSelect: () => void;
  onViewClient: () => void;
  onView: () => void;
}

function ProjectRow({ project, isSelected, onSelect, onViewClient, onView }: ProjectRowProps) {
  const statusColors = getStatusColor(project.status);

  return (
    <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
      <td className="px-4 py-3">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onSelect}
          className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500"
        />
      </td>
      <td className="px-4 py-3">
        <div className="min-w-0">
          <button
            onClick={onView}
            className="font-medium text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 text-left truncate max-w-xs block"
          >
            {project.title}
          </button>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {project.service_type.charAt(0).toUpperCase() + project.service_type.slice(1)}
            {project.pending_approvals > 0 && (
              <span className="ml-2 text-amber-600 dark:text-amber-400">
                • {project.pending_approvals} pending
              </span>
            )}
          </p>
        </div>
      </td>
      <td className="px-4 py-3">
        <span className={`inline-flex items-center gap-1.5 px-2 py-1 text-xs font-medium rounded-full ${statusColors.bg} ${statusColors.text}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${statusColors.dot}`} />
          {formatStatus(project.status)}
        </span>
      </td>
      <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400 hidden sm:table-cell">
        {project.shoot_date 
          ? new Date(project.shoot_date).toLocaleDateString("en-GB", { day: "numeric", month: "short" })
          : "—"}
      </td>
      <td className="px-4 py-3 text-right hidden md:table-cell">
        <span className="text-sm font-medium text-slate-900 dark:text-white">
          {formatCurrency(project.total_value_cents)}
        </span>
        {project.paid_cents < project.total_value_cents && (
          <span className="text-xs text-slate-500 dark:text-slate-400 block">
            {Math.round((project.paid_cents / project.total_value_cents) * 100)}% paid
          </span>
        )}
      </td>
      <td className="px-4 py-3 text-right">
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={onViewClient}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            title="View Client"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </button>
          <button
            onClick={onView}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            title="View Project"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </td>
    </tr>
  );
}

function formatStatus(status: string): string {
  const labels: Record<string, string> = {
    inquiry: "Inquiry",
    quoted: "Quoted",
    confirmed: "Confirmed",
    scheduled: "Scheduled",
    in_progress: "In Progress",
    editing: "Editing",
    review: "Review",
    delivered: "Delivered",
    completed: "Completed",
    cancelled: "Cancelled",
  };
  return labels[status] || status;
}

export default ProjectsTable;
