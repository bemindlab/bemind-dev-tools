import { exec, execSync } from "child_process";
import { promisify } from "util";
import { PlatformAdapter, PortInfo } from "./types";

const execAsync = promisify(exec);

export class MacOSAdapter implements PlatformAdapter {
  getPortListCommand(startPort?: number, endPort?: number): string {
    // Use lsof to list all network connections
    // -i: select IPv4 and IPv6 files
    // -P: inhibit conversion of port numbers to port names
    // -n: inhibit conversion of network numbers to host names
    let command = "lsof -i -P -n";

    // Note: lsof doesn't support port range filtering directly
    // We'll filter in the parser if needed
    return command;
  }

  parsePortOutput(output: string): PortInfo[] {
    const ports: PortInfo[] = [];
    const lines = output.split("\n");

    // Skip header line
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      try {
        // lsof output format (space-separated):
        // COMMAND  PID  USER  FD  TYPE  DEVICE  SIZE/OFF  NODE  NAME
        // Example: node    1234  user  21u  IPv4  0x...  0t0  TCP *:3000 (LISTEN)
        const parts = line.split(/\s+/);

        if (parts.length < 9) continue;

        const command = parts[0];
        const pid = parseInt(parts[1], 10);
        const type = parts[4]; // IPv4 or IPv6
        const node = parts[7]; // TCP or UDP
        const name = parts.slice(8).join(" "); // Connection info

        if (isNaN(pid) || !["TCP", "UDP"].includes(node)) continue;

        // Parse the NAME field to extract port and state
        // Format examples:
        // *:3000 (LISTEN)
        // localhost:3000 (LISTEN)
        // 127.0.0.1:3000->127.0.0.1:54321 (ESTABLISHED)
        const nameMatch = name.match(
          /[*\w.-]+:(\d+)(?:->[*\w.-]+:\d+)?\s*(?:\((\w+)\))?/
        );

        if (!nameMatch) continue;

        const port = parseInt(nameMatch[1], 10);
        const state = nameMatch[2] || "UNKNOWN";

        if (isNaN(port)) continue;

        // Extract local and remote addresses if available
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
          commandLine: "", // Will be populated by getting full command
          state,
          localAddress,
          remoteAddress,
        });
      } catch (error) {
        // Skip malformed lines
        continue;
      }
    }

    // Get full command lines for processes
    return this.enrichWithCommandLines(ports);
  }

  private enrichWithCommandLines(ports: PortInfo[]): PortInfo[] {
    // Get unique PIDs
    const pids = [...new Set(ports.map((p) => p.processId))];

    // For each PID, try to get the full command line
    pids.forEach((pid) => {
      try {
        // Use ps to get full command line
        const stdout = execSync(`ps -p ${pid} -o command=`, {
          encoding: "utf-8",
        });
        const commandLine = stdout.trim();

        // Update all ports with this PID
        ports.forEach((port) => {
          if (port.processId === pid) {
            port.commandLine = commandLine;
          }
        });
      } catch (error) {
        // Process might have terminated, skip
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
      // Check if process is owned by root or system user
      const { stdout } = await execAsync(`ps -p ${pid} -o user=`);
      const user = stdout.trim();
      return user === "root" || user === "_system" || user.startsWith("_");
    } catch (error) {
      return false;
    }
  }
}
