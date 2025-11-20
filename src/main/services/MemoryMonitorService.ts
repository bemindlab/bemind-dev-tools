import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

/**
 * Memory metrics for the system
 */
export interface MemoryMetrics {
  total: number;
  used: number;
  available: number;
  percentage: number;
  timestamp: number;
}

/**
 * Process memory information
 */
export interface ProcessMemoryInfo {
  pid: number;
  name: string;
  memory: number;
}

/**
 * Cache entry for memory data
 */
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

/**
 * Memory Monitor Service
 * 
 * Collects system memory metrics and top memory-consuming processes
 * Supports macOS with caching to reduce system calls
 */
export class MemoryMonitorService {
  private metricsCache: CacheEntry<MemoryMetrics> | null = null;
  private processCache: CacheEntry<ProcessMemoryInfo[]> | null = null;
  private readonly cacheTTL: number;

  /**
   * Create a new MemoryMonitorService
   * @param cacheTTL Cache time-to-live in milliseconds (default: 1000ms)
   */
  constructor(cacheTTL: number = 1000) {
    this.cacheTTL = cacheTTL;
  }

  /**
   * Get current memory metrics
   * @returns Memory metrics including total, used, available, and percentage
   */
  async getMemoryMetrics(): Promise<MemoryMetrics> {
    // Check cache
    if (this.metricsCache && Date.now() - this.metricsCache.timestamp < this.cacheTTL) {
      return this.metricsCache.data;
    }

    try {
      // macOS: Use vm_stat command
      const { stdout } = await execAsync("vm_stat");
      const metrics = this.parseVmStat(stdout);

      // Cache result
      this.metricsCache = {
        data: metrics,
        timestamp: Date.now()
      };

      return metrics;
    } catch (error) {
      throw new Error(`Failed to get memory metrics: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Get top memory-consuming processes
   * @param limit Maximum number of processes to return (default: 5)
   * @returns Array of process memory information sorted by memory usage (descending)
   */
  async getTopProcesses(limit: number = 5): Promise<ProcessMemoryInfo[]> {
    // Check cache
    if (this.processCache && Date.now() - this.processCache.timestamp < this.cacheTTL) {
      return this.processCache.data.slice(0, limit);
    }

    try {
      // macOS: Use top command to get process memory
      const { stdout } = await execAsync("top -l 1 -o mem -n 10 -stats pid,command,mem");
      const processes = this.parseTopOutput(stdout);

      // Cache result
      this.processCache = {
        data: processes,
        timestamp: Date.now()
      };

      return processes.slice(0, limit);
    } catch (error) {
      throw new Error(`Failed to get top processes: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Parse vm_stat output to extract memory metrics
   * @param output Output from vm_stat command
   * @returns Parsed memory metrics
   */
  private parseVmStat(output: string): MemoryMetrics {
    const lines = output.split("\n");
    
    // Extract page size (typically first line: "Mach Virtual Memory Statistics: (page size of 16384 bytes)")
    const pageSizeMatch = lines[0].match(/page size of (\d+) bytes/);
    const pageSize = pageSizeMatch ? parseInt(pageSizeMatch[1]) : 16384;

    // Extract memory stats
    const stats: Record<string, number> = {};
    for (const line of lines.slice(1)) {
      const match = line.match(/^([^:]+):\s+(\d+)\./);
      if (match) {
        const key = match[1].trim().replace(/\s+/g, "_");
        stats[key] = parseInt(match[2]);
      }
    }

    // Calculate memory values
    const pagesTotal = stats["Pages_free"] + stats["Pages_active"] + stats["Pages_inactive"] + 
                      stats["Pages_speculative"] + stats["Pages_wired_down"];
    const pagesUsed = stats["Pages_active"] + stats["Pages_wired_down"];
    const pagesFree = stats["Pages_free"] + stats["Pages_inactive"] + stats["Pages_speculative"];

    const total = pagesTotal * pageSize;
    const used = pagesUsed * pageSize;
    const available = pagesFree * pageSize;
    const percentage = total > 0 ? (used / total) * 100 : 0;

    return {
      total,
      used,
      available,
      percentage,
      timestamp: Date.now()
    };
  }

  /**
   * Parse top command output to extract process memory information
   * @param output Output from top command
   * @returns Array of process memory information sorted by memory usage
   */
  private parseTopOutput(output: string): ProcessMemoryInfo[] {
    const lines = output.split("\n");
    const processes: ProcessMemoryInfo[] = [];

    // Skip header lines and process data lines
    let dataStarted = false;
    for (const line of lines) {
      if (line.includes("PID") && line.includes("COMMAND")) {
        dataStarted = true;
        continue;
      }

      if (!dataStarted || !line.trim()) {
        continue;
      }

      // Parse line: PID COMMAND MEM
      const parts = line.trim().split(/\s+/);
      if (parts.length < 3) {
        continue;
      }

      const pid = parseInt(parts[0]);
      const mem = parts[parts.length - 1];
      const name = parts.slice(1, -1).join(" ");

      if (isNaN(pid)) {
        continue;
      }

      // Parse memory value (e.g., "123M", "1.5G", "456K")
      const memoryBytes = this.parseMemoryValue(mem);
      
      processes.push({
        pid,
        name,
        memory: memoryBytes
      });
    }

    // Sort by memory usage (descending)
    processes.sort((a, b) => b.memory - a.memory);

    return processes;
  }

  /**
   * Parse memory value from top output (e.g., "123M", "1.5G")
   * @param value Memory value string
   * @returns Memory in bytes
   */
  private parseMemoryValue(value: string): number {
    const match = value.match(/^([\d.]+)([KMGT])?$/);
    if (!match) {
      return 0;
    }

    const num = parseFloat(match[1]);
    const unit = match[2] || "";

    const multipliers: Record<string, number> = {
      "K": 1024,
      "M": 1024 * 1024,
      "G": 1024 * 1024 * 1024,
      "T": 1024 * 1024 * 1024 * 1024
    };

    return num * (multipliers[unit] || 1);
  }

  /**
   * Clear all caches
   */
  clearCache(): void {
    this.metricsCache = null;
    this.processCache = null;
  }
}
