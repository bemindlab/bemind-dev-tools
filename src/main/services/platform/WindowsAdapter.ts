import { exec, execSync } from "child_process";
import { promisify } from "util";
import { PlatformAdapter, PortInfo } from "./types";

const execAsync = promisify(exec);

export class WindowsAdapter implements PlatformAdapter {
  getPortListCommand(startPort?: number, endPort?: number): string {
    // Use netstat to list all network connections
    // -a: display all connections and listening ports
    // -n: display addresses and port numbers in numerical form
    // -o: display owning process ID
    return "netstat -ano";
  }

  parsePortOutput(output: string): PortInfo[] {
    const ports: PortInfo[] = [];
    const lines = output.split("\n");

    // Parse netstat output
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      try {
        // netstat output format (space-separated):
        // Proto  Local Address          Foreign Address        State           PID
        // TCP    0.0.0.0:3000          0.0.0.0:0              LISTENING       1234
        // TCP    127.0.0.1:3000        127.0.0.1:54321        ESTABLISHED     1234

        const parts = trimmed.split(/\s+/);

        if (parts.length < 5) continue;

        const protocol = parts[0].toUpperCase();
        if (!["TCP", "UDP"].includes(protocol)) continue;

        const localAddress = parts[1];
        const remoteAddress = parts[2];
        const state = parts[3];
        const pid = parseInt(parts[4], 10);

        if (isNaN(pid)) continue;

        // Extract port from local address (format: IP:PORT or [IPv6]:PORT)
        const portMatch = localAddress.match(/:(\d+)$/);
        if (!portMatch) continue;

        const port = parseInt(portMatch[1], 10);
        if (isNaN(port)) continue;

        ports.push({
          port,
          protocol: protocol as "TCP" | "UDP",
          processId: pid,
          processName: "", // Will be populated by tasklist
          commandLine: "", // Will be populated by tasklist
          state,
          localAddress,
          remoteAddress:
            remoteAddress !== "0.0.0.0:0" ? remoteAddress : undefined,
        });
      } catch (error) {
        // Skip malformed lines
        continue;
      }
    }

    // Enrich with process information from tasklist
    return this.enrichWithProcessInfo(ports);
  }

  private enrichWithProcessInfo(ports: PortInfo[]): PortInfo[] {
    // Get unique PIDs
    const pids = [...new Set(ports.map((p) => p.processId))];

    // Build a map of PID to process info
    const processMap = new Map<number, { name: string; commandLine: string }>();

    try {
      // Use tasklist to get process names
      // /FO CSV: output in CSV format for easier parsing
      // /V: verbose output to get command line
      const stdout = execSync("tasklist /FO CSV /V", {
        encoding: "utf-8",
        maxBuffer: 10 * 1024 * 1024,
      });

      const lines = stdout.split("\n");

      // Skip header line
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        try {
          // CSV format: "Image Name","PID","Session Name","Session#","Mem Usage","Status","User Name","CPU Time","Window Title"
          // Parse CSV manually to handle quoted fields
          const fields = this.parseCSVLine(line);

          if (fields.length < 2) continue;

          const name = fields[0];
          const pidStr = fields[1];
          const pid = parseInt(pidStr, 10);

          if (isNaN(pid)) continue;

          // Try to get command line using WMIC
          let commandLine = name;
          try {
            const wmicOut = execSync(
              `wmic process where processid=${pid} get commandline /format:list`,
              { encoding: "utf-8", timeout: 1000 }
            );
            const cmdMatch = wmicOut.match(/CommandLine=(.*)/);
            if (cmdMatch && cmdMatch[1].trim()) {
              commandLine = cmdMatch[1].trim();
            }
          } catch (error) {
            // WMIC might fail, use process name as fallback
          }

          processMap.set(pid, { name, commandLine });
        } catch (error) {
          continue;
        }
      }
    } catch (error) {
      // tasklist might fail, continue with empty process info
    }

    // Update ports with process information
    ports.forEach((port) => {
      const processInfo = processMap.get(port.processId);
      if (processInfo) {
        port.processName = processInfo.name;
        port.commandLine = processInfo.commandLine;
      }
    });

    return ports;
  }

  private parseCSVLine(line: string): string[] {
    const fields: string[] = [];
    let current = "";
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === "," && !inQuotes) {
        fields.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }

    if (current) {
      fields.push(current.trim());
    }

    return fields;
  }

  async killProcess(pid: number, force: boolean = false): Promise<boolean> {
    try {
      // Use taskkill command
      // /PID: specify process ID
      // /F: force termination if force is true
      const forceFlag = force ? "/F" : "";
      await execAsync(`taskkill /PID ${pid} ${forceFlag}`);
      return true;
    } catch (error) {
      return false;
    }
  }

  async requiresElevation(pid: number): Promise<boolean> {
    try {
      // Check if process is running as SYSTEM or with elevated privileges
      const { stdout } = await execAsync(
        `tasklist /FI "PID eq ${pid}" /FO CSV /V`
      );

      const lines = stdout.split("\n");
      if (lines.length < 2) return false;

      const fields = this.parseCSVLine(lines[1]);
      if (fields.length < 7) return false;

      const userName = fields[6]; // User Name field

      // Check if running as SYSTEM or NT AUTHORITY
      return userName.includes("SYSTEM") || userName.includes("NT AUTHORITY");
    } catch (error) {
      return false;
    }
  }
}
