import type { Project } from "@/data/projects";

type Props = {
  project: Project;
  index: number;
  className?: string;
};

/**
 * Procedural preview used when a project has no image. Renders a stylised
 * "screen" composition whose accent colour comes from the project data, so
 * every project still has a distinct visual without shipping bitmaps.
 */
export default function ProjectPreview({ project, index, className = "" }: Props) {
  if (project.image) {
    return (
      <div className={`project-visual project-visual--image ${className}`}>
        <img src={project.image} alt={`${project.title} preview`} loading="lazy" decoding="async" />
      </div>
    );
  }
  return (
    <div className={`project-visual accent-${project.accent} ${className}`} aria-hidden="true">
      <span className="visual-number">{project.id}</span>
      <span className="visual-window">
        <span className="visual-bar">
          <i />
          <i />
          <i />
        </span>
        <span className="visual-lines">
          {Array.from({ length: 6 }).map((_, i) => (
            <i key={i} style={{ width: `${34 + ((i * 29 + index * 13) % 52)}%` }} />
          ))}
        </span>
        <span className="visual-block" />
      </span>
      <span className="visual-orbit orbit-a" />
      <span className="visual-orbit orbit-b" />
    </div>
  );
}
