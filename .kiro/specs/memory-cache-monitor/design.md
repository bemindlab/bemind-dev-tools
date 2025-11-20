# Memory Cache Monitor Tool - Design Document

## Overview

The Memory Cache Monitor Tool is a real-time system monitoring utility integrated into the dev tools dashboard. It provides developers with visibility into memory consumption, cache performance, and process-level memory usage across macOS, Linux, and Windows platforms.

The tool follows the existing dashboard architecture pattern, consisting of:

- A main process service that collects system memory metrics using platform-specific APIs
- A renderer component that displays the data with visual indicators and controls
- IPC communication layer for secure data exchange between processes
- Platform adapters for cross-platform compatibility

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Renderer Process                      │
│  ┌────────────────────────────────────────────────────┐ │
│  │  MemoryCacheMonitorTool Component                  │ │
│  │  - Visual memory indicators                        │ │
│  │  - Process list display                            │ │
│  │  - Refresh controls                                │ │
│  └────────────────────────────────────────────────────┘ │
│                         │                                │
│                         │ IPC (invoke/on)                │
└─────────────────────────┼────────────────────────────────┘
                          │
┌─────────────────────────┼────────────────────────────────┐
│                    Main Process                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │  MemoryMonitorService                              │ │
│  │  - Collects memory metrics                         │ │
│  │  - Manages refresh intervals                       │ │
│  │  - Caches recent data                              │ │
│  └────────────────────────────────────────────────────┘ │
│                         │                                │
│  ┌────────────────────────────────────────────────────┐ │
│  │  Platform Adapters                                 │ │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────────────┐ │ │
│  │  │  macOS   │  │  Linux   │  │    Windows       │ │ │
│  │  │ Adapter  │  │ Adapter  │  │    Adapter       │ │ │
│  │  └──────────┘  └──────────┘  └──────────────────┘ │ │
│  └────────────────────────────────────────────────────┘ │
│                         │                                │
└─────────────────────────┼────────────────────────────────┘
                          │
                    OS System APIs
```

### Component Interaction Flow

1. **Initialization**: Tool component mounts and requests initial memory data via IPC
2. **Data Collection**: Main process service uses platform adapter to gather metrics
3. **Data Transmission**: Service sends memory data back to renderer via IPC response
4. **Display Update**: Component renders visual indicators and process list
5. **Periodic Refresh**: Timer triggers new data requests at configured interval
6. **User Control**: User adjusts refresh rate or pauses monitoring

## Components and Interfaces

### Main Process Components

#### MemoryMonitorService

Primary service for collecting and managing memory metrics.

```typescript
interface MemoryMetrics {
  total: number; // Total system memory in bytes
  used: number; // Used memory in bytes
  available: number; // Available memory in bytes
  percentage: number; // Usage percentage (0-100)
  cache?: CacheMetrics; // Optional cache metrics
  timestamp: number; // Collection timestamp
}

interface CacheMetrics {
  size: number; // Cache size in bytes
  used: number; // Cache used in bytes
  hitRate?: number; // Cache hit rate percentage (0-100)
}

interface ProcessMemoryInfo {
  pid: number; // Process ID
  name: string; // Process name
  memory: number; // Memory usage in bytes
  percentage: number; // Percentage of total memory
}

class MemoryMonitorService {
  constructor(cacheTTL?: number);

  // Get current memory metrics
  getMemoryMetrics(): Promise<MemoryMetrics>;

  // Get top N processes by memory usage
  getTopProcesses(count: number): Promise<ProcessMemoryInfo[]>;

  // Clear cached data
  clearCache(): void;
}
```

#### Platform Adapters

Platform-specific implementations for memory data collection.

```typescript
interface MemoryPlatformAdapter {
  // Get system memory information
  getMemoryInfo(): Promise<MemoryMetrics>;

  // Get process memory information
  getProcessMemory(count: number): Promise<ProcessMemoryInfo[]>;

  // Check if cache metrics are supported
  supportsCacheMetrics(): boolean;
}

class MacOSMemoryAdapter implements MemoryPlatformAdapter {
  // Uses vm_stat, top, and sysctl commands
}

class LinuxMemoryAdapter implements MemoryPlatformAdapter {
  // Uses /proc/meminfo and /proc/[pid]/status
}

class WindowsMemoryAdapter implements MemoryPlatformAdapter {
  // Uses wmic and Get-Process PowerShell commands
}
```

### Renderer Components

#### MemoryCacheMonitorTool

Main React component for the memory monitor tool.

```typescript
interface MemoryCacheMonitorState {
  refreshInterval: number; // Refresh interval in seconds (1-10)
  isPaused: boolean; // Whether monitoring is paused
}

interface MemoryCacheMonitorProps extends ToolComponentProps {
  isActive: boolean;
  onStateChange?: (state: MemoryCacheMonitorState) => void;
  initialState?: MemoryCacheMonitorState;
}

const MemoryCacheMonitorTool: React.FC<MemoryCacheMonitorProps>;
```

#### Sub-Components

```typescript
// Visual memory usage indicator
interface MemoryGaugeProps {
  percentage: number;
  total: number;
  used: number;
  available: number;
}
const MemoryGauge: React.FC<MemoryGaugeProps>;

// Process list display
interface ProcessListProps {
  processes: ProcessMemoryInfo[];
  isLoading: boolean;
}
const ProcessList: React.FC<ProcessListProps>;

// Cache metrics display
interface CacheMetricsProps {
  cache?: CacheMetrics;
  supported: boolean;
}
const CacheMetrics: React.FC<CacheMetricsProps>;

// Refresh controls
interface RefreshControlsProps {
  interval: number;
  isPaused: boolean;
  onIntervalChange: (interval: number) => void;
  onPauseToggle: () => void;
}
const RefreshControls: React.FC<RefreshControlsProps>;
```

### IPC Interface

```typescript
// IPC channel definitions
interface MemoryIPCChannels {
  // Get current memory metrics
  "memory:get-metrics": () => Promise<MemoryMetrics>;

  // Get top processes by memory
  "memory:get-top-processes": (count: number) => Promise<ProcessMemoryInfo[]>;
}
```

## Data Models

### MemoryMetrics

Represents system-wide memory information.

```typescript
interface MemoryMetrics {
  total: number; // Total system memory in bytes
  used: number; // Used memory in bytes
  available: number; // Available memory in bytes
  percentage: number; // Usage percentage (0-100)
  cache?: CacheMetrics; // Optional cache metrics
  timestamp: number; // Collection timestamp (Unix ms)
}
```

**Invariants:**

- `total > 0`
- `used >= 0 && used <= total`
- `available >= 0 && available <= total`
- `used + available <= total` (may not equal due to buffers/cache)
- `percentage >= 0 && percentage <= 100`
- `percentage === Math.round((used / total) * 100)`

### CacheMetrics

Represents cache memory information (platform-dependent).

```typescript
interface CacheMetrics {
  size: number; // Total cache size in bytes
  used: number; // Cache used in bytes
  hitRate?: number; // Cache hit rate percentage (0-100)
}
```

**Invariants:**

- `size > 0`
- `used >= 0 && used <= size`
- `hitRate === undefined || (hitRate >= 0 && hitRate <= 100)`

### ProcessMemoryInfo

Represents memory usage for a single process.

```typescript
interface ProcessMemoryInfo {
  pid: number; // Process ID
  name: string; // Process name
  memory: number; // Memory usage in bytes
  percentage: number; // Percentage of total system memory
}
```

**Invariants:**

- `pid > 0`
- `name.length > 0`
- `memory >= 0`
- `percentage >= 0 && percentage <= 100`

### MemoryCacheMonitorState

Serializable state for the tool component.

```typescript
interface MemoryCacheMonitorState {
  refreshInterval: number; // Refresh interval in seconds (1-10)
  isPaused: boolean; // Whether monitoring is paused
}
```

**Invariants:**

- `refreshInterval >= 1 && refreshInterval <= 10`
- `Number.isInteger(refreshInterval)`

## Correctness Properties

_A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees._

### Property 1: Memory metrics display completeness

_For any_ valid MemoryMetrics object, when rendered by the component, the output SHALL contain total memory, used memory, and available memory values.
**Validates: Requirements 1.1**

### Property 2: Memory value formatting consistency

_For any_ positive integer byte value, the formatting function SHALL produce a string containing either "MB" or "GB" units.
**Validates: Requirements 1.2, 4.3**

### Property 3: Memory percentage calculation accuracy

_For any_ valid total and used memory values where total > 0, the calculated percentage SHALL equal Math.round((used / total) \* 100) and be between 0 and 100.
**Validates: Requirements 1.4**

### Property 4: Refresh interval bounds enforcement

_For any_ attempted refresh interval value, the system SHALL constrain it to be an integer between 1 and 10 seconds inclusive.
**Validates: Requirements 1.5, 5.2**

### Property 5: Visual indicator presence

_For any_ valid MemoryMetrics object with a percentage value, the rendered component SHALL include a visual indicator element.
**Validates: Requirements 2.1**

### Property 6: Visual state correctness

_For any_ memory usage percentage value, the visual state SHALL be "normal" when percentage < 80, "warning" when 80 <= percentage < 95, and "critical" when percentage >= 95.
**Validates: Requirements 2.2, 2.3, 2.4**

### Property 7: Cache metrics display completeness

_For any_ valid CacheMetrics object, when rendered by the component, the output SHALL contain cache size and cache usage values.
**Validates: Requirements 3.1**

### Property 8: Cache hit rate display

_For any_ CacheMetrics object with a defined hitRate value, the rendered output SHALL display the hit rate as a percentage.
**Validates: Requirements 3.2**

### Property 9: Process list size constraint

_For any_ list of ProcessMemoryInfo objects, the displayed process list SHALL contain at most 5 processes.
**Validates: Requirements 4.1**

### Property 10: Process information completeness

_For any_ ProcessMemoryInfo object in the displayed list, the rendered output SHALL contain the process name, process ID, and memory consumption.
**Validates: Requirements 4.2**

### Property 11: Process list sort order

_For any_ list of ProcessMemoryInfo objects, the displayed processes SHALL be ordered by memory usage in descending order (highest first).
**Validates: Requirements 4.4**

### Property 12: Refresh interval state update

_For any_ valid refresh interval value, setting the interval SHALL update the component state to reflect the new value.
**Validates: Requirements 5.1**

### Property 13: Pause state effect

_For any_ component state, when isPaused is true, no new data collection requests SHALL be initiated until isPaused becomes false.
**Validates: Requirements 5.4**

### Property 14: State persistence round-trip

_For any_ valid MemoryCacheMonitorState, navigating away from the tool and back SHALL preserve the state values (refreshInterval and isPaused).
**Validates: Requirements 6.4**

### Property 15: Platform data unavailability handling

_For any_ platform where cache metrics are unavailable, the system SHALL render without crashing and display only available metrics.
**Validates: Requirements 7.4**

### Property 16: Error message display

_For any_ memory data collection failure, the component SHALL display an error message to the user.
**Validates: Requirements 8.1**

### Property 17: Error recovery continuation

_For any_ error state, the system SHALL continue attempting data collection on subsequent refresh cycles.
**Validates: Requirements 8.2**

### Property 18: Error state stability

_For any_ error during data collection or rendering, the component SHALL not crash and SHALL maintain its UI structure.
**Validates: Requirements 8.3**

### Property 19: Transient error recovery

_For any_ sequence of data collection attempts where an error is followed by successful data retrieval, the component SHALL automatically resume normal display.
**Validates: Requirements 8.4**

## Error Handling

### Data Collection Errors

**Platform Command Failures**

- When platform-specific commands fail (e.g., permission denied, command not found)
- Service SHALL catch the error and return a structured error response
- Component SHALL display user-friendly error message
- System SHALL continue attempting collection on next refresh cycle

**Parsing Errors**

- When platform output cannot be parsed into expected format
- Service SHALL log the error with raw output for debugging
- Service SHALL return partial data if some metrics are parsable
- Component SHALL display available metrics and indicate missing data

**Timeout Errors**

- When data collection exceeds reasonable time limit (5 seconds)
- Service SHALL abort the collection attempt
- Service SHALL return cached data if available
- Component SHALL show stale data indicator if using cache

### Component Errors

**Rendering Errors**

- Component wrapped in ErrorBoundary (existing dashboard pattern)
- Errors caught and displayed without crashing entire application
- User can retry or navigate away

**State Errors**

- Invalid state values sanitized on load
- Refresh interval clamped to valid range (1-10 seconds)
- Invalid pause state defaults to false

### IPC Communication Errors

**Channel Errors**

- IPC invoke failures caught in component
- User notified of communication failure
- Retry mechanism with exponential backoff
- Fallback to last known good data

**Timeout Handling**

- IPC calls timeout after 10 seconds
- User notified of timeout
- Option to manually retry

## Testing Strategy

### Unit Testing

The Memory Cache Monitor will use **Vitest** as the testing framework, consistent with the existing codebase.

**Service Layer Tests**

- MemoryMonitorService data collection and caching
- Platform adapter command generation and output parsing
- Error handling for various failure scenarios
- Cache TTL expiration behavior

**Component Tests**

- MemoryCacheMonitorTool rendering with various data states
- Sub-component rendering (MemoryGauge, ProcessList, CacheMetrics, RefreshControls)
- User interaction handling (interval changes, pause/resume)
- Error state display

**Utility Tests**

- Memory value formatting function (bytes to MB/GB)
- Percentage calculation accuracy
- Process list sorting and limiting

### Property-Based Testing

The Memory Cache Monitor will use **fast-check** for property-based testing, consistent with the existing test suite.

**Configuration**

- Each property test SHALL run a minimum of 100 iterations
- Each property test SHALL be tagged with a comment referencing the design document property
- Tag format: `// Feature: memory-cache-monitor, Property {number}: {property_text}`

**Property Test Coverage**

Each correctness property listed in the Correctness Properties section SHALL be implemented as a property-based test:

- **Property 1-19**: Each property SHALL have a corresponding fast-check test
- Tests SHALL generate random valid inputs within the domain
- Tests SHALL verify the property holds for all generated inputs
- Tests SHALL use appropriate generators (integers, objects, arrays, etc.)

**Generator Strategy**

Custom generators SHALL be created for:

- `MemoryMetrics`: Random valid memory values with proper invariants
- `CacheMetrics`: Random cache data with optional hit rate
- `ProcessMemoryInfo`: Random process data with valid PIDs and memory values
- `MemoryCacheMonitorState`: Random state with constrained interval values

**Example Property Test Structure**

```typescript
// Feature: memory-cache-monitor, Property 3: Memory percentage calculation accuracy
test("memory percentage calculation is accurate", () => {
  fc.assert(
    fc.property(
      fc.integer({ min: 1, max: 1000000000000 }), // total bytes
      fc.integer({ min: 0, max: 1000000000000 }), // used bytes
      (total, usedRaw) => {
        const used = Math.min(usedRaw, total); // Ensure used <= total
        const percentage = calculateMemoryPercentage(used, total);
        const expected = Math.round((used / total) * 100);

        expect(percentage).toBe(expected);
        expect(percentage).toBeGreaterThanOrEqual(0);
        expect(percentage).toBeLessThanOrEqual(100);
      }
    ),
    { numRuns: 100 }
  );
});
```

### Integration Testing

**End-to-End Tool Flow**

- Tool registration and discovery in registry
- Navigation to tool and component mounting
- IPC communication between renderer and main process
- Data refresh cycle with real platform adapters
- State persistence across navigation

**Platform-Specific Testing**

- Verify correct adapter selection for each platform
- Test actual command execution on target platforms
- Validate output parsing with real system data

### Manual Testing Checklist

- Visual appearance matches dashboard design system
- Memory gauge displays correctly at various usage levels
- Warning and critical states trigger at correct thresholds
- Process list updates in real-time
- Refresh interval changes take effect
- Pause/resume functionality works correctly
- Error states display appropriately
- Tool state persists across navigation
- Performance acceptable with frequent refreshes

## Implementation Notes

### Performance Considerations

**Data Collection Frequency**

- Default refresh interval: 5 seconds
- Minimum interval: 1 second (to prevent excessive system load)
- Maximum interval: 10 seconds (to maintain data freshness)

**Caching Strategy**

- Cache TTL: 1 second (prevents redundant system calls)
- Cache invalidation on explicit refresh requests
- Separate cache entries for metrics and process list

**Component Optimization**

- Use React.memo for sub-components to prevent unnecessary re-renders
- Debounce interval slider changes
- Lazy load process list only when visible

### Platform-Specific Implementation Details

**macOS**

- Use `vm_stat` for memory statistics
- Use `top -l 1` for process memory information
- Parse output using regex patterns
- Cache metrics not directly available (return undefined)

**Linux**

- Read `/proc/meminfo` for system memory
- Read `/proc/[pid]/status` for process memory
- Parse key-value format
- Cache metrics available from `/proc/meminfo` (Cached, Buffers)

**Windows**

- Use `wmic OS get TotalVisibleMemorySize,FreePhysicalMemory` for system memory
- Use `Get-Process | Sort-Object WS -Descending | Select-Object -First 5` for processes
- Parse PowerShell output
- Cache metrics not directly available (return undefined)

### Security Considerations

- All system commands executed in main process (not renderer)
- Input validation on all IPC parameters
- No user-provided commands executed
- Process kill operations require explicit user confirmation (future enhancement)

### Accessibility

- All visual indicators have text equivalents
- Color not sole indicator of status (use icons/text)
- Keyboard navigation support for controls
- Screen reader friendly labels and ARIA attributes
- Follows existing dashboard accessibility patterns

### Future Enhancements

- Historical memory usage graphs
- Memory usage alerts/notifications
- Export memory data to CSV
- Process filtering and search
- Memory leak detection
- Comparison with system baseline
