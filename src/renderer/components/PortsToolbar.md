# PortsToolbar Component

## Overview

The PortsToolbar component provides a comprehensive filtering and search interface for the Local Ports Manager. It includes search functionality, port range filtering, protocol filtering, and a manual refresh button.

## Features

### 1. Search Input (Debounced)

- **Debounce Time**: 200ms
- **Search Criteria**: Port number, process name, and framework/application name
- **Clear Button**: Quickly clear the search input
- **Persistence**: Search term is saved to localStorage

### 2. Port Range Filter

- **Dropdown Options**:
  - All Ports (no filter)
  - All Dev Ports (3000-9999)
  - Node.js (3000-3999)
  - Angular (4200-4299)
  - Flask/Python (5000-5999)
  - Django/General (8000-8999)
  - General Dev (9000-9999)
- **Persistence**: Selected range is saved to localStorage

### 3. Protocol Filter

- **Options**: ALL, TCP, UDP
- **Persistence**: Selected protocol is saved to localStorage

### 4. Refresh Button

- **Action**: Manually triggers port scan via `window.portsAPI.scanPorts()`
- **Visual Feedback**: Shows spinning animation while refreshing
- **Disabled State**: Disabled during active scanning

## Implementation Details

### Components

#### SearchInput

A controlled input component with debounced onChange handler:

- Uses local state for immediate UI updates
- Debounces the actual filter update by 200ms
- Persists search term to localStorage
- Includes clear button for quick reset

#### FilterDropdown

A generic dropdown component for filter selection:

- Supports any value type (string, tuple, null)
- Closes on outside click
- Shows checkmark for selected option
- Persists selection to localStorage

### LocalStorage Keys

- `ports-manager-search`: Search term
- `ports-manager-port-range`: Port range as JSON array [start, end]
- `ports-manager-protocol`: Protocol filter value

### State Management

The toolbar integrates with the PortsContext to:

- Read current filter state
- Update filters via actions
- Trigger port scanning
- Display loading states

## Usage

```tsx
import { PortsToolbar } from "./components";

function App() {
  return (
    <PortsProvider>
      <PortsToolbar />
      {/* Other components */}
    </PortsProvider>
  );
}
```

## Styling

The component includes comprehensive CSS with:

- Responsive design (mobile-friendly)
- Dark mode support
- Smooth transitions and animations
- Accessible focus states
- Hover effects

## Requirements Satisfied

This implementation satisfies the following requirements from the spec:

- **5.1**: Search filtering by port number, process name, or application name
- **5.2**: Filter results update within 200ms of user input (debounced)
- **5.3**: Port range filter for common development ranges
- **5.4**: Protocol filter (TCP, UDP, ALL)
- **5.5**: Filter settings persist across application restarts (localStorage)

## Accessibility

- Proper ARIA labels on buttons
- Keyboard navigation support
- Focus indicators
- Screen reader friendly
