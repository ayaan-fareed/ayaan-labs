import type { Project } from "@/data/projects";

type Props = {
  project: Project;
  index: number;
  className?: string;
};

export default function ProjectPreview({ project, className = "" }: Props) {
  if (project.slug === "elyscents") {
    return (
      <div className={`project-visual project-visual--elyscents ${className}`} aria-hidden="true">
        <div className="mockup-browser-bar">
          <span className="dot dot-r" />
          <span className="dot dot-y" />
          <span className="dot dot-g" />
          <span className="mockup-url">elyscen.vercel.app</span>
        </div>
        <div className="mockup-content elyscents-mockup">
          <div className="elyscents-hero">
            <span className="badge-pill">Haute Parfumerie</span>
            <div className="elyscents-title">ELYS CENTS</div>
            <div className="bottle-card-row">
              <div className="perfume-card">
                <div className="bottle-visual bottle-visual--purple" />
                <span className="p-name">Oud Royale</span>
                <span className="p-price">$240</span>
              </div>
              <div className="perfume-card active">
                <div className="bottle-visual bottle-visual--amber" />
                <span className="p-name">Ambre Nuit</span>
                <span className="p-price">$285</span>
              </div>
              <div className="perfume-card">
                <div className="bottle-visual bottle-visual--rose" />
                <span className="p-name">Velvet Rose</span>
                <span className="p-price">$195</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (project.slug === "beads") {
    return (
      <div className={`project-visual project-visual--beads ${className}`} aria-hidden="true">
        <div className="mockup-browser-bar">
          <span className="dot dot-r" />
          <span className="dot dot-y" />
          <span className="dot dot-g" />
          <span className="mockup-url">beads-fe.vercel.app</span>
        </div>
        <div className="mockup-content beads-mockup">
          <div className="beads-top-row">
            <span className="beads-brand">BEADS JEWELLERY</span>
            <span className="supabase-tag">
              <span className="supabase-dot" /> Supabase Realtime
            </span>
          </div>
          <div className="beads-grid">
            <div className="jewel-card">
              <div className="jewel-gem gem-gold" />
              <div className="jewel-line" />
              <div className="jewel-line short" />
            </div>
            <div className="jewel-card active">
              <div className="jewel-gem gem-emerald" />
              <div className="jewel-line" />
              <div className="jewel-line short" />
            </div>
            <div className="jewel-card">
              <div className="jewel-gem gem-sapphire" />
              <div className="jewel-line" />
              <div className="jewel-line short" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Logistics OS (Strapi CMS integrated)
  return (
    <div className={`project-visual project-visual--logistics ${className}`} aria-hidden="true">
      <div className="mockup-browser-bar">
        <span className="dot dot-r" />
        <span className="dot dot-y" />
        <span className="dot dot-g" />
        <span className="mockup-url">logistic-web-pearl.vercel.app</span>
      </div>
      <div className="mockup-content logistics-mockup">
        <div className="logistics-header">
          <span className="logistics-title">FLEET DISPATCH OS</span>
          <span className="strapi-tag">
            <span className="strapi-dot" /> Strapi CMS
          </span>
        </div>
        <div className="logistics-dashboard">
          <div className="logistics-globe-map">
            <div className="map-node node-a" />
            <div className="map-node node-b" />
            <div className="map-route-line" />
            <div className="metric-box">
              <span className="metric-val">98.4%</span>
              <span className="metric-lbl">On-Time</span>
            </div>
          </div>
          <div className="logistics-bars">
            <div className="bar bar-1" />
            <div className="bar bar-2" />
            <div className="bar bar-3" />
            <div className="bar bar-4" />
          </div>
        </div>
      </div>
    </div>
  );
}
