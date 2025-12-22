"use client";

import { useParams } from "next/navigation";
import { ProjectPage } from "@/components/projects";

export default function AdminProjectDetailPage() {
  const params = useParams();
  const projectId = params?.projectId as string;

  return <ProjectPage projectId={projectId} />;
}
