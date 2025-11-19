import { exec, execSync } from "child_process";
import { promisify } from "util";
import { PlatformAdapter, PortInfo } from "./types";

const execAsync = promisify(exec);

export class LinuxAdapter implements PlatformAdapter {
  private useLsof: boolean = true;

  constructor() {
    // Detect which command is available
    this.detectAvailableCommand();
  }

  private async detectAvailableCommand(): Promise<void> {
    try {
      // Try lsof first
      await execAsync("which lsof");
      this.useLsof = true;
    } catch (error) {
      // Fall back to ss
      this.useLsof = false;
    }
  }

  getPortListCommand(startPort?: number, endPort?: number): string {
    if (this.useLsof) {
      // Use lsof (similar to macOS)
      return "lsof -i -P -n";
    } else {
      // Use ss (socket statistics)
      // -t: TCP sockets
      // -u: UDP sockets
      // -l: listening sockets
      // -n: numeric addresses
      // -p: show process
      return "ss -tulnp";
    }
  }

  parsePortOutput(output: string): PortInfo[] {
    if (this.useLsof) {
      return this.parseLsofOutput(output);
    } else {
      return this.parseSsOutput(output);
    }
  }

  private parseLsofOutput(output: string): PortInfo[] {
    const ports: PortInfo[] = [];
    const lines = output.split("\n");

    // Skip header line
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      try {
        // lsof output format (space-separated):
        // COMMAND  PID  USER  FD  TYPE  DEVICE  SIZE/OFF  NODE  NAME
        const parts = line.split(/\s+/);

        if (parts.length < 9) continue;

        const command = parts[0];
        const pid = parseInt(parts[1], 10);
        const node = parts[7]; // TCP or UDP
        const name = parts.slice(8).join(" ");

        if (isNaN(pid) || !["TCP", "UDP"].includes(node)) continue;

        // Parse the NAME field
        const nameMatch = name.match(
          /[*\w.-]+:(\d+)(?:->[*\w.-]+:\d+)?\s*(?:\((\w+)\))?/
        );

        if (!nameMatch) continue;

        const port = parseInt(nameMatch[1], 10);
        const state = nameMatch[2] || "UNKNOWN";

        if (isNaN(port)) continue;

        let localAddress: string | undefined;
        let remoteAddress: string | undefined;

        const addressMatch = name.match(
          /([*\w.-]+):(\d+)(?:->([*\w.-]+):(\d+))?/
        );
        if (addressMatch) {
          localAddress = `${addressMatch[1]}:${addressMatch[2]}`;
          if (addressMatch[3] && addressMatch[4]) {
            remoteAddress = `${addressMatch[3]}:${addressMatch[4]}`;
          }
        }

        ports.push({
          port,
          protocol: node as "TCP" | "UDP",
          processId: pid,
          processName: command,
          commandLine: "",
          state,
          localAddress,
          remoteAddress,
        });
      } catch (error) {
        continue;
      }
    }

    return this.enrichWithCommandLines(ports);
  }

  private parseSsOutput(output: string): PortInfo[] {
    const ports: PortInfo[] = [];
    const lines = output.split("\n");

    // Skip header line
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      try {
        // ss output format (space-separated):
        // Netid  State   Recv-Q  Send-Q  Local Address:Port  Peer Address:Port  Process
        // tcp    LISTEN  0       128     0.0.0.0:3000        0.0.0.0:*          users:(("node",pid=1234,fd=21))

        const parts = line.split(/\s+/);

        if (parts.length < 6) continue;

        const protocol = parts[0].toUpperCase();
        if (!["TCP", "UDP"].includes(protocol)) continue;

        const state = parts[1];
        const localAddress = parts[4];

        // Extract port from local address
        const portMatch = localAddress.match(/:(\d+)$/);
        if (!portMatch) continue;

        const port = parseInt(portMatch[1], 10);
        if (isNaN(port)) continue;

        // Extract process info from the last field
        // Format: users:(("process",pid=1234,fd=21))
        let processName = "";
        let pid = 0;

        if (parts.length >= 7) {
          const processInfo = parts.slice(6).join(" ");
          const processMatch = processInfo.match(/\(\("([^"]+)",pid=(\d+)/);

          if (processMatch) {
            processName = processMatch[1];
            pid = parseInt(processMatch[2], 10);
          }
        }

        if (pid === 0) continue;

        ports.push({
          port,
          protocol: protocol as "TCP" | "UDP",
          processId: pid,
          processName,
          commandLine: "",
          state,
          localAddress,
          remoteAddress: parts[5] !== "0.0.0.0:*" ? parts[5] : undefined,
        });
      } catch (error) {
        continue;
      }
    }

    return this.enrichWithCommandLines(ports);
  }

  private enrichWithCommandLines(ports: PortInfo[]): PortInfo[] {
    const pids = [...new Set(ports.map((p) => p.processId))];

    pids.forEach((pid) => {
      try {
        // Use ps to get full command line
        const stdout = execSync(`ps -p ${pid} -o command=`, {
          encoding: "utf-8",
        });
        const commandLine = stdout.trim();

        ports.forEach((port) => {
          if (port.processId === pid) {
            port.commandLine = commandLine;
          }
        });
      } catch (error) {
        // Process might have terminated
      }
    });

    return ports;
  }

  async killProcess(pid: number, force: boolean = false): Promise<boolean> {
    try {
      // Use SIGTERM by default, SIGKILL if force is true
      const signal = force ? "SIGKILL" : "SIGTERM";
      process.kill(pid, signal);
      return true;
    } catch (error) {
      return false;
    }
  }

  async requiresElevation(pid: number): Promise<boolean> {
    try {
      // Check if process is owned by root
      const { stdout } = await execAsync(`ps -p ${pid} -o user=`);
      const user = stdout.trim();
      return user === "root";
    } catch (error) {
      return false;
    }
  }
}
