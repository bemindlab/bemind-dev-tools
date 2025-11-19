# Platform Adapter

Cross-platform port detection and process management for the Local Ports Manager.

## Overview

The Platform Adapter provides a unified interface for detecting active network ports and managing processes across macOS, Windows, and Linux operating systems.

## Architecture

- **PlatformAdapter Interface**: Defines the contract for all platform-specific implementations
- **MacOSAdapter**: Uses `lsof` command for port detection on macOS
- **WindowsAdapter**: Uses `netstat` and `tasklist` commands for port detection on Windows
- **LinuxAdapter**: Uses `lsof` or `ss` command with fallback for port detection on Linux
- **PlatformAdapterFactory**: Automatically selects and instantiates the correct adapter based on the current OS

## Usage

```typescript
import { PlatformAdapterFactory } from "./services/platform";

// Get the appropriate adapter for the current platform
const adapter = PlatformAdapterFactory.getAdapter();

// Get the command to list ports
const command = adapter.getPortListCommand();

// Execute the command and parse the output
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);
const { stdout } = await execAsync(command);
const ports = adapter.parsePortOutput(stdout);

// Kill a process
const success = await adapter.killProcess(1234);

// Check if a process requires elevation
const needsElevation = await adapter.requiresElevation(1234);
```

## Features

### Port Detection

- Scans all active TCP and UDP ports
- Extracts process information (PID, name, command line)
- Parses connection state (LISTEN, ESTABLISHED, etc.)
- Captures local and remote addresses

### Process Management

- Terminate processes by PID
- Support for graceful (SIGTERM) and forced (SIGKILL) termination
- Detect system processes that require elevated permissions

### Cross-Platform Support

- **macOS**: Uses `lsof -i -P -n` for comprehensive port listing
- **Windows**: Uses `netstat -ano` combined with `tasklist` for process details
- **Linux**: Uses `lsof` or falls back to `ss -tulnp` if lsof is not available

## Implementation Details

### macOS (lsof)

- Command: `lsof -i -P -n`
- Parses output to extract port, protocol, PID, and connection state
- Uses `ps` to get full command line for each process
- Uses `process.kill()` with SIGTERM/SIGKILL for termination

### Windows (netstat + tasklist)

- Command: `netstat -ano` for port listing
- Command: `tasklist /FO CSV /V` for process details
- Uses WMIC to get full command line when available
- Uses `taskkill` for process termination

### Linux (lsof or ss)

- Primary: `lsof -i -P -n` (similar to macOS)
- Fallback: `ss -tulnp` if lsof is not installed
- Uses `ps` to get full command line for each process
- Uses `process.kill()` with SIGTERM/SIGKILL for termination

## Error Handling

All methods handle errors gracefully:

- Malformed command output is skipped
- Terminated processes during scanning are ignored
- Failed process termination returns `false`
- Permission checks handle missing processes

## Requirements Satisfied

This implementation satisfies the following requirements from the design document:

- **8.1**: Detect active ports on macOS using lsof command
- **8.2**: Detect active ports on Windows using netstat command
- **8.3**: Detect active ports on Linux using lsof or ss command
- **8.4**: Handle platform-specific process termination signals appropriately
