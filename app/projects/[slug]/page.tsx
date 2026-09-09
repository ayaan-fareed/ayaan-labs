import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { projects, getProject, getNextProject } from "@/data/projects";
import ProjectPreview from "@/components/projects/ProjectPreview";

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return {};
  return { title: `${project.title} — Ayaan Labs`, description: project.description };
}

export default async function ProjectDetail({ params }: Params) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();
  const next = getNextProject(project.slug);
  const index = projects.findIndex((p) => p.slug === project.slug);

  return (
    <main className="detail-page">
      <Link className="detail-back" href="/#work">
        ← Back to projects
      </Link>

      <header className="detail-header">
        <span className="section-index">
          Project {project.id} / {project.year}
        </span>
        <h1>{project.title}</h1>
        <p className="detail-lede">{project.description}</p>
      </header>

      <ProjectPreview project={project} index={index} className="project-visual--detail" />

      <div className="detail-grid">
        <div className="detail-copy">
          <h2>Overview</h2>
          <p>{project.longDescription}</p>
          <h2>Highlights</h2>
          <ul className="detail-highlights">
            {project.highlights.map((h) => (
              <li key={h}>{h}</li>
            ))}
          </ul>
        </div>
        <aside className="detail-facts" aria-label="Project facts">
          <div>
            <span>Category</span>
            <strong>{project.category}</strong>
          </div>
          <div>
            <span>Role</span>
            <strong>{project.role}</strong>
          </div>
          <div>
            <span>Stack</span>
            <strong>{project.technologies.join(" / ")}</strong>
          </div>
          <div className="detail-links">
            {project.liveUrl ? (
              <a href={project.liveUrl} target="_blank" rel="noreferrer">
                Live site ↗
              </a>
            ) : (
              <span className="muted">Live link coming soon</span>
            )}
            {project.githubUrl && (
              <a href={project.githubUrl} target="_blank" rel="noreferrer">
                GitHub ↗
              </a>
            )}
          </div>
        </aside>
      </div>

      <Link className="next-project" href={`/projects/${next.slug}`}>
        <span>Next project</span>
        <strong>{next.title} ↗</strong>
      </Link>
    </main>
  );
}
