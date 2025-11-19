# Ports Manager Components

This directory contains the UI components for the Local Ports Manager.

## Components

### PortsList

A virtualized list component that efficiently renders large numbers of ports using `react-window`.

**Features:**

- Virtual scrolling for optimal performance with 100+ ports
- Loading state with spinner
- Empty state with helpful message
- Automatic height calculation
- Optimized rendering with React.memo

**Props:**

```typescript
interface PortsListProps {
  ports: PortInfo[]; // Array of ports to display
  selectedPort: number | null; // Currently selected port number
  onSelectPort: (port: number) => void; // Callback when port is selected
  isLoading?: boolean; // Show loading state
}
```

**Usage:**

```tsx
import { PortsList } from "./components";
import { usePortsManager } from "./contexts";

function MyComponent() {
  const { state, actions, filteredPorts } = usePortsManager();

  return (
    <PortsList
      ports={filteredPorts}
      selectedPort={state.selectedPort}
      onSelectPort={actions.selectPort}
      isLoading={state.isScanning}
    />
  );
}
```

### PortItem

A memoized component that displays information about a single port.

**Features:**

- Port number with protocol badge (TCP/UDP)
- Connection state badge (LISTEN, ESTABLISHED, etc.)
- Framework detection badge (if detected)
- Process name and PID
- Hover and selection states
- Optimized with React.memo to prevent unnecessary re-renders

**Props:**

```typescript
interface PortItemProps {
  port: PortInfo; // Port information to display
  isSelected: boolean; // Whether this port is selected
  onSelect: () => void; // Callback when port is clicked
}
```

**Note:** This component is typically used internally by PortsList and doesn't need to be used directly.

## Styling

Both components include CSS files with:

- Light and dark mode support
- Smooth transitions and hover effects
- Responsive design
- Custom scrollbar styling
- Accessible color contrast

## Performance

The PortsList component uses several optimizations:

- **Virtual scrolling**: Only renders visible items using react-window
- **Memoization**: PortItem uses React.memo to prevent re-renders
- **Row height**: Fixed row height (72px) for consistent scrolling
- **Callback memoization**: Row renderer is memoized to prevent recreation

These optimizations ensure smooth performance even with hundreds of ports.
