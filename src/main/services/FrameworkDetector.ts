import { PortInfo, FrameworkInfo } from "./platform/types";

/**
 * Framework detection pattern
 */
interface FrameworkPattern {
  pattern: RegExp;
  name: string;
  displayName: string;
  icon?: string;
  color?: string;
}

/**
 * Framework Detector
 *
 * Identifies common development frameworks from process information
 */
export class FrameworkDetector {
  private readonly patterns: FrameworkPattern[];

  constructor() {
    this.patterns = this.initializePatterns();
  }

  /**
   * Detect framework from process info
   * @param portInfo Port information containing process details
   * @returns FrameworkInfo if detected, null otherwise
   */
  detectFramework(portInfo: PortInfo): FrameworkInfo | null {
    const commandLine = portInfo.commandLine.toLowerCase();
    const processName = portInfo.processName.toLowerCase();

    // Combine command line and process name for matching
    const searchText = `${commandLine} ${processName}`;

    // Try to match against known patterns
    for (const pattern of this.patterns) {
      if (pattern.pattern.test(searchText)) {
        return {
          name: pattern.name,
          displayName: pattern.displayName,
          icon: pattern.icon,
          color: pattern.color,
        };
      }
    }

    return null;
  }

  /**
   * Initialize framework detection patterns
   * @returns Array of framework patterns
   */
  private initializePatterns(): FrameworkPattern[] {
    return [
      // JavaScript/Node.js frameworks
      {
        pattern: /webpack.*dev.*server|webpack-dev-server/i,
        name: "webpack",
        displayName: "Webpack Dev Server",
        icon: "⚡",
        color: "#8DD6F9",
      },
      {
        pattern: /\bvite\b/i,
        name: "vite",
        displayName: "Vite Dev Server",
        icon: "⚡",
        color: "#646CFF",
      },
      {
        pattern: /next.*dev|next-dev/i,
        name: "nextjs",
        displayName: "Next.js Dev Server",
        icon: "▲",
        color: "#000000",
      },
      {
        pattern: /react-scripts.*start/i,
        name: "cra",
        displayName: "Create React App",
        icon: "⚛",
        color: "#61DAFB",
      },
      {
        pattern: /vue-cli-service.*serve/i,
        name: "vue",
        displayName: "Vue Dev Server",
        icon: "🟢",
        color: "#42B883",
      },
      {
        pattern: /ng.*serve|angular.*cli/i,
        name: "angular",
        displayName: "Angular Dev Server",
        icon: "🅰",
        color: "#DD0031",
      },
      {
        pattern: /nuxt.*dev/i,
        name: "nuxt",
        displayName: "Nuxt.js Dev Server",
        icon: "💚",
        color: "#00DC82",
      },
      {
        pattern: /gatsby.*develop/i,
        name: "gatsby",
        displayName: "Gatsby Dev Server",
        icon: "🟣",
        color: "#663399",
      },
      {
        pattern: /svelte.*dev|svelte-kit/i,
        name: "svelte",
        displayName: "SvelteKit Dev Server",
        icon: "🔥",
        color: "#FF3E00",
      },
      {
        pattern: /remix.*dev/i,
        name: "remix",
        displayName: "Remix Dev Server",
        icon: "💿",
        color: "#000000",
      },
      {
        pattern: /astro.*dev/i,
        name: "astro",
        displayName: "Astro Dev Server",
        icon: "🚀",
        color: "#FF5D01",
      },

      // Python frameworks
      {
        pattern: /manage\.py.*runserver|django.*runserver/i,
        name: "django",
        displayName: "Django Dev Server",
        icon: "🐍",
        color: "#092E20",
      },
      {
        pattern: /flask.*run|python.*flask/i,
        name: "flask",
        displayName: "Flask Dev Server",
        icon: "🌶",
        color: "#000000",
      },
      {
        pattern: /fastapi|uvicorn/i,
        name: "fastapi",
        displayName: "FastAPI Server",
        icon: "⚡",
        color: "#009688",
      },

      // Ruby frameworks
      {
        pattern: /rails.*server|rails.*s\b/i,
        name: "rails",
        displayName: "Rails Server",
        icon: "💎",
        color: "#CC0000",
      },
      {
        pattern: /sinatra/i,
        name: "sinatra",
        displayName: "Sinatra Server",
        icon: "🎤",
        color: "#000000",
      },

      // PHP frameworks
      {
        pattern: /php.*-S|php.*artisan.*serve/i,
        name: "php",
        displayName: "PHP Built-in Server",
        icon: "🐘",
        color: "#777BB4",
      },
      {
        pattern: /laravel.*serve/i,
        name: "laravel",
        displayName: "Laravel Dev Server",
        icon: "🔺",
        color: "#FF2D20",
      },

      // Other frameworks and tools
      {
        pattern: /webpack.*serve|webpack serve/i,
        name: "webpack-serve",
        displayName: "Webpack Serve",
        icon: "📦",
        color: "#8DD6F9",
      },
      {
        pattern: /parcel/i,
        name: "parcel",
        displayName: "Parcel Dev Server",
        icon: "📦",
        color: "#E7A95F",
      },
      {
        pattern: /rollup.*watch|rollup.*-w/i,
        name: "rollup",
        displayName: "Rollup Dev Server",
        icon: "📦",
        color: "#EC4A3F",
      },
      {
        pattern: /http-server|live-server/i,
        name: "http-server",
        displayName: "HTTP Server",
        icon: "🌐",
        color: "#000000",
      },
      {
        pattern: /express/i,
        name: "express",
        displayName: "Express Server",
        icon: "🚂",
        color: "#000000",
      },
      {
        pattern: /nodemon/i,
        name: "nodemon",
        displayName: "Nodemon",
        icon: "👀",
        color: "#76D04B",
      },
    ];
  }
}
