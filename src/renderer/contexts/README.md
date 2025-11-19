# Ports State Management

This directory contains the React state management implementation for the Local Ports Manager.

## Overview

The state management is built using React Context API and provides:

- Centralized state for ports data
- Actions for managing ports, filters, and monitoring
- Real-time updates via IPC event listeners
- Filtered ports based on search, range, and protocol

## Usage

### 1. Wrap your app with PortsProvider

```tsx
import { PortsProvider } from "./contexts";

function App() {
  return (
    <PortsProvider>
      <YourComponents />
    </PortsProvider>
  );
}
```

### 2. Use the usePortsManager hook in components

```tsx
import { usePortsManager } from "./contexts";

function PortsList() {
  const { state, actions, filteredPorts } = usePortsManager();

  // Access state
  const { ports, selectedPort, filters, isScanning, isMonitoring } = state;

  // Use actions
  const handleScan = () => actions.scanPorts({ start: 3000, end: 9999 });
  const handleSelect = (port: number) => actions.selectPort(port);
  const handleSearch = (search: string) => actions.setSearchFilter(search);

  // Use filtered ports
  return (
    <div>
      {filteredPorts.map((port) => (
        <div key={port.port}>
          {port.port} - {port.processName}
        </div>
      ))}
    </div>
  );
}
```

## Available Actions

### Port Operations

- `scanPorts(range?)` - Scan ports in specified range
- `refreshPorts()` - Refresh dev ports (3000-9999)
- `selectPort(port)` - Select a port for details view
- `killProcess(port)` - Terminate process on port
- `openInBrowser(port, protocol?)` - Open port in browser

### Monitoring

- `startMonitoring(interval?)` - Start real-time monitoring (default: 5000ms)
- `stopMonitoring()` - Stop monitoring

### Filters

- `setSearchFilter(search)` - Filter by port/process/framework name
- `setPortRangeFilter(range)` - Filter by port range [start, end]
- `setProtocolFilter(protocol)` - Filter by TCP/UDP/ALL
- `clearFilters()` - Reset all filters

## State Structure

```typescript
interface PortsState {
  ports: PortInfo[]; // All ports
  selectedPort: number | null; // Currently selected port
  filters: PortFilters; // Active filters
  isScanning: boolean; // Scanning in progress
  isMonitoring: boolean; // Monitoring active
  error: string | null; // Last error message
}
```

## Real-time Updates

The context automatically subscribes to IPC events:

- `ports:added` - New port detected
- `ports:removed` - Port closed
- `ports:updated` - Port info changed

These events update the state automatically when monitoring is active.
