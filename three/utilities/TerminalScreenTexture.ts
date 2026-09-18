import * as THREE from "three";

/**
 * Creates a dynamic 768x480 canvas texture simulating a macOS Terminal window.
 * Types out Git workflow commands character-by-character in sync with character laptop typing.
 */
export class TerminalScreenTexture {
  readonly texture: THREE.CanvasTexture;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private commands: string[];
  private currentCmdIndex = 0;
  private displayedCharCount = 0;
  private typingProgress = 0;
  private pauseTimer = 0;
  private isExecuting = false;
  private idleTimer = 0;
  private outputHistory: { text: string; isCmd: boolean }[] = [];

  constructor() {
    this.canvas = document.createElement("canvas");
    this.canvas.width = 768;
    this.canvas.height = 480;
    const ctx = this.canvas.getContext("2d");
    if (!ctx) throw new Error("Could not get 2d context for TerminalScreenTexture");
    this.ctx = ctx;

    this.commands = [
      "git status",
      "git add .",
      'git commit -m "update portfolio to 3D"',
      "git push origin main",
    ];

    this.outputHistory.push({ text: "Last login: Wed Sep 16 18:30 on ttys002", isCmd: false });
    this.outputHistory.push({ text: "ayaan@macbook-pro ayaan-labs % ", isCmd: true });

    this.texture = new THREE.CanvasTexture(this.canvas);
    this.texture.colorSpace = THREE.SRGBColorSpace;
    this.texture.minFilter = THREE.LinearFilter;
    this.texture.magFilter = THREE.LinearFilter;

    this.render(0);
  }

  update(dt: number, isTyping: boolean) {
    if (!isTyping) {
      // Off-screen: keep the caret blinking but don't repaint the canvas every frame.
      this.idleTimer += dt;
      if (this.idleTimer > 0.25) {
        this.idleTimer = 0;
        this.render(performance.now() / 1000);
      }
      return;
    }

    if (this.pauseTimer > 0) {
      this.pauseTimer -= dt;
      this.render(performance.now() / 1000);
      return;
    }

    const currentTargetCmd = this.commands[this.currentCmdIndex];

    if (!this.isExecuting) {
      this.typingProgress += dt * 11;
      if (this.typingProgress >= 1) {
        const step = Math.floor(this.typingProgress);
        this.typingProgress -= step;
        this.displayedCharCount = Math.min(this.displayedCharCount + step, currentTargetCmd.length);

        if (this.displayedCharCount >= currentTargetCmd.length) {
          // Command typing complete, pause before "pressing Enter"
          this.isExecuting = true;
          this.pauseTimer = 0.6 + Math.random() * 0.4;
        }
        this.render(performance.now() / 1000);
      }
    } else {
      // Execute command: add output response
      const typed = currentTargetCmd;
      this.outputHistory[this.outputHistory.length - 1] = {
        text: `ayaan@macbook-pro ayaan-labs % ${typed}`,
        isCmd: true,
      };

      if (typed === "git status") {
        this.outputHistory.push({ text: "On branch main. Changes staged for commit.", isCmd: false });
      } else if (typed === "git add .") {
        this.outputHistory.push({ text: "Staged 14 files for release.", isCmd: false });
      } else if (typed.startsWith("git commit")) {
        this.outputHistory.push({ text: "[main 8f3a1b9] update portfolio to 3D", isCmd: false });
      } else if (typed === "git push origin main") {
        this.outputHistory.push({ text: "Enumerating objects: 100% (14/14), done.", isCmd: false });
        this.outputHistory.push({ text: "To https://github.com/ayaan-fareed/portfolio.git", isCmd: false });
        this.outputHistory.push({ text: "   main -> main [up to date]", isCmd: false });
      }

      // Next prompt
      this.currentCmdIndex = (this.currentCmdIndex + 1) % this.commands.length;
      if (this.outputHistory.length > 9) {
        this.outputHistory = this.outputHistory.slice(this.outputHistory.length - 7);
      }
      this.outputHistory.push({ text: "ayaan@macbook-pro ayaan-labs % ", isCmd: true });

      this.displayedCharCount = 0;
      this.isExecuting = false;
      this.pauseTimer = 1.2; // Thinking pause before next command
      this.render(performance.now() / 1000);
    }
  }

  private render(time: number) {
    const { ctx, canvas } = this;
    const w = canvas.width;
    const h = canvas.height;

    // Terminal background
    ctx.fillStyle = "#0a0c14";
    ctx.fillRect(0, 0, w, h);

    // Header bar
    ctx.fillStyle = "#161824";
    ctx.fillRect(0, 0, w, 36);

    // Window controls
    const dots = ["#ff5f56", "#ffbd2e", "#27c93f"];
    dots.forEach((color, i) => {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(20 + i * 18, 18, 5, 0, Math.PI * 2);
      ctx.fill();
    });

    // Window title
    ctx.fillStyle = "#94a3b8";
    ctx.font = "12px 'JetBrains Mono', monospace";
    ctx.textAlign = "center";
    ctx.fillText("ayaan@macbook-pro: ~/workspace/ayaan-labs — zsh", w / 2, 22);
    ctx.textAlign = "left";

    // Terminal lines
    ctx.font = "15px 'JetBrains Mono', 'SF Mono', Consolas, monospace";
    const lineHeight = 24;
    let y = 64;

    const currentTargetCmd = this.commands[this.currentCmdIndex];
    const partialCmd = currentTargetCmd.substring(0, this.displayedCharCount);

    for (let i = 0; i < this.outputHistory.length; i++) {
      const item = this.outputHistory[i];
      const isLast = i === this.outputHistory.length - 1;

      if (item.isCmd) {
        ctx.fillStyle = "#38bdf8"; // prompt cyan
        const promptPart = "ayaan@macbook-pro ayaan-labs % ";
        ctx.fillText(promptPart, 24, y);
        const promptWidth = ctx.measureText(promptPart).width;

        ctx.fillStyle = "#f8fafc";
        const cmdText = isLast ? partialCmd : item.text.replace(promptPart, "");
        ctx.fillText(cmdText, 24 + promptWidth, y);

        // Caret
        if (isLast) {
          const blink = Math.floor(time * 2.5) % 2 === 0;
          if (blink) {
            const cmdWidth = ctx.measureText(cmdText).width;
            ctx.fillStyle = "#4ade80"; // green cursor
            ctx.fillRect(24 + promptWidth + cmdWidth + 2, y - 14, 8, 17);
          }
        }
      } else {
        ctx.fillStyle = item.text.includes("done") || item.text.includes("up to date") ? "#4ade80" : "#94a3b8";
        ctx.fillText(item.text, 24, y);
      }

      y += lineHeight;
    }

    this.texture.needsUpdate = true;
  }

  dispose() {
    this.texture.dispose();
  }
}
