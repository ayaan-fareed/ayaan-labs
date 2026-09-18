import * as THREE from "three";

/**
 * Creates a dynamic 1024x640 canvas texture simulating a real code editor (VS Code aesthetic).
 * Types out real frontend code character-by-character in sync with character typing cadence.
 */
export class CodeScreenTexture {
  readonly texture: THREE.CanvasTexture;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private fullCode: string;
  private displayedLength = 0;
  private typingProgress = 0;
  private lastUpdate = 0;
  private isPaused = false;
  private pauseTimer = 0;

  constructor() {
    this.canvas = document.createElement("canvas");
    this.canvas.width = 1024;
    this.canvas.height = 640;
    const ctx = this.canvas.getContext("2d");
    if (!ctx) throw new Error("Could not get 2d context for CodeScreenTexture");
    this.ctx = ctx;

    this.fullCode = [
      '// Ayaan Fareed — Digital Workspace',
      'const projects = [',
      '  {',
      '    name: "Elyscents",',
      '    type: "E-Commerce",',
      '    tech: "Next.js + Tailwind",',
      '    year: 2025',
      '  },',
      '  {',
      '    name: "Beads",',
      '    service: "Supabase",',
      '    tech: "React + TypeScript",',
      '    year: 2025',
      '  },',
      '  {',
      '    name: "Logistics OS",',
      '    cms: "Strapi",',
      '    tech: "Next.js + REST API",',
      '    year: 2025',
      '  }',
      '];',
      '',
      'export default function Portfolio() {',
      '  return <Workspace developer="Ayaan" />;',
      '}',
    ].join("\n");

    this.texture = new THREE.CanvasTexture(this.canvas);
    this.texture.colorSpace = THREE.SRGBColorSpace;
    this.texture.minFilter = THREE.LinearFilter;
    this.texture.magFilter = THREE.LinearFilter;

    this.render(0);
  }

  update(dt: number, isTyping: boolean) {
    if (!isTyping) {
      this.lastUpdate += dt;
      if (this.lastUpdate > 0.4) {
        this.lastUpdate = 0;
        this.render(performance.now() / 1000);
      }
      return;
    }

    if (this.isPaused) {
      this.pauseTimer -= dt;
      if (this.pauseTimer <= 0) {
        this.isPaused = false;
      }
      this.render(performance.now() / 1000);
      return;
    }

    // Advance characters with natural variable speed
    this.typingProgress += dt * 14; // ~14 chars/sec average
    if (this.typingProgress >= 1) {
      const charsToAdd = Math.floor(this.typingProgress);
      this.typingProgress -= charsToAdd;
      this.displayedLength = (this.displayedLength + charsToAdd) % (this.fullCode.length + 30);

      // Random micro-pauses (simulate thinking or checking code)
      if (Math.random() < 0.08) {
        this.isPaused = true;
        this.pauseTimer = 0.3 + Math.random() * 0.8;
      }

      this.render(performance.now() / 1000);
    }
  }

  private render(time: number) {
    const { ctx, canvas } = this;
    const w = canvas.width;
    const h = canvas.height;

    // Editor Background
    ctx.fillStyle = "#0c101c";
    ctx.fillRect(0, 0, w, h);

    // Title Bar / Window Header
    ctx.fillStyle = "#141a2c";
    ctx.fillRect(0, 0, w, 44);

    // Window controls (macOS style dots)
    const dots = ["#ff5f56", "#ffbd2e", "#27c93f"];
    dots.forEach((color, i) => {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(24 + i * 20, 22, 6, 0, Math.PI * 2);
      ctx.fill();
    });

    // Tab
    ctx.fillStyle = "#1b233a";
    ctx.fillRect(100, 8, 180, 36);
    ctx.fillStyle = "#2b78ff";
    ctx.fillRect(100, 42, 180, 2);

    // Tab text
    ctx.fillStyle = "#cad4e8";
    ctx.font = "14px 'JetBrains Mono', 'Fira Code', monospace";
    ctx.fillText("projects.tsx", 125, 30);

    // Subtle blue tab icon
    ctx.fillStyle = "#00d2ff";
    ctx.beginPath();
    ctx.arc(114, 26, 4, 0, Math.PI * 2);
    ctx.fill();

    // Line numbers gutter
    ctx.fillStyle = "#0e1322";
    ctx.fillRect(0, 44, 60, h - 44);

    // Code area
    const currentCode = this.fullCode.substring(0, Math.min(this.displayedLength, this.fullCode.length));
    const lines = currentCode.split("\n");
    const totalLines = this.fullCode.split("\n").length;

    ctx.font = "18px 'JetBrains Mono', 'SF Mono', Consolas, monospace";
    const lineHeight = 26;
    const startY = 74;

    for (let i = 0; i < Math.max(lines.length, totalLines); i++) {
      const y = startY + i * lineHeight;
      if (y > h - 16) break;

      // Line number
      ctx.fillStyle = "#4a5568";
      ctx.textAlign = "right";
      ctx.fillText(String(i + 1), 48, y);
      ctx.textAlign = "left";

      // Active line text
      if (i < lines.length) {
        const lineText = lines[i];
        this.renderSyntaxLine(lineText, 76, y);

        // Blinking caret at the end of the last typing line
        if (i === lines.length - 1) {
          const blink = Math.floor(time * 2.5) % 2 === 0;
          if (blink) {
            const lineWidth = ctx.measureText(lineText).width;
            ctx.fillStyle = "#38bdf8";
            ctx.fillRect(76 + lineWidth + 2, y - 16, 10, 20);
          }
        }
      }
    }

    // Status bar at bottom
    ctx.fillStyle = "#111728";
    ctx.fillRect(0, h - 26, w, 26);
    ctx.fillStyle = "#5c6b8c";
    ctx.font = "12px monospace";
    ctx.fillText("TypeScript React", 20, h - 9);
    ctx.fillText("UTF-8", w - 160, h - 9);
    ctx.fillText("Ln " + lines.length + ", Col " + (lines[lines.length - 1]?.length || 1), w - 90, h - 9);

    this.texture.needsUpdate = true;
  }

  private renderSyntaxLine(text: string, x: number, y: number) {
    const ctx = this.ctx;
    let curX = x;

    const regex = /(\/\/.*$)|(["'][^"']*["'])|(\b(?:const|let|var|function|return|export|default|import|from)\b)|(\b(?:true|false|null|undefined|\d+)\b)|([{}()[\],;:])|([A-Za-z0-9_$]+)/g;
    let match: RegExpExecArray | null;
    let lastIndex = 0;

    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        const space = text.slice(lastIndex, match.index);
        ctx.fillStyle = "#e2e8f0";
        ctx.fillText(space, curX, y);
        curX += ctx.measureText(space).width;
      }

      const token = match[0];
      if (match[1]) {
        ctx.fillStyle = "#64748b";
      } else if (match[2]) {
        ctx.fillStyle = "#a5d6a7";
      } else if (match[3]) {
        ctx.fillStyle = "#c084fc";
      } else if (match[4]) {
        ctx.fillStyle = "#fb923c";
      } else if (match[5]) {
        ctx.fillStyle = "#94a3b8";
      } else {
        if (token === "projects" || token === "Portfolio" || token === "Workspace") {
          ctx.fillStyle = "#38bdf8";
        } else if (token === "name" || token === "type" || token === "tech" || token === "year" || token === "service" || token === "cms" || token === "developer") {
          ctx.fillStyle = "#7dd3fc";
        } else {
          ctx.fillStyle = "#f1f5f9";
        }
      }

      ctx.fillText(token, curX, y);
      curX += ctx.measureText(token).width;
      lastIndex = regex.lastIndex;
    }

    if (lastIndex < text.length) {
      const remaining = text.slice(lastIndex);
      ctx.fillStyle = "#e2e8f0";
      ctx.fillText(remaining, curX, y);
    }
  }

  dispose() {
    this.texture.dispose();
  }
}
