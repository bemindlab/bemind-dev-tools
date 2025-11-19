# PortDetailsPanel Component

## Overview

The `PortDetailsPanel` component displays detailed information about a selected port, including process details, connection state, and action buttons for managing the port.

## Features

- **Connection Information**: Displays protocol type (TCP/UDP) and connection state
- **Application Detection**: Shows framework/application name if detected by Framework Detector
- **Process Information**: Displays process name and process ID
- **Command Line**: Shows full process command line in a scrollable text area
- **Action Buttons**:
  - Open in Browser (for ports 3000-9999)
  - Kill Process (with confirmation)
  - Copy Port Number
  - Copy URL
  - Copy Process Info

## Usage

```tsx
import { PortDetailsPanel } from "./components";

<PortDetailsPanel
  port={selectedPortInfo}
  onClose={() => setSelectedPort(null)}
/>;
```

## Props

- `port`: PortInfo | null - The port information to display
- `onClose`: () => void - Callback when the close button is clicked

## Requirements Satisfied

- **2.1**: Displays full process command line in scrollable text area
- **2.2**: Displays protocol type and connection state
- **2.3**: Displays application name if detected by Framework Detector
- **2.4**: Provides action buttons (Open, Kill, Copy) that call window.portsAPI methods

## Styling

The component uses CSS modules with support for both light and dark themes. The layout is responsive and includes:

- Scrollable content area
- Fixed header with close button
- Action buttons section at the bottom
- Styled badges for protocol and framework information
