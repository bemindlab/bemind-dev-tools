# Implementation Plan

- [x] 1. Set up Electron project structure and core configuration

  - Create main process entry point with Electron app initialization
  - Create renderer process entry point with React setup
  - Configure Electron security settings (contextIsolation, nodeIntegration disabled)
  - Set up IPC preload script for secure communication
  - Configure TypeScript for both main and renderer processes
  - _Requirements: 8.1, 8.2, 8.3, 9.3_

- [x] 2. Implement Platform Adapter for cross-platform port detection

  - Create PlatformAdapter interface with methods for port listing and process management
  - Implement MacOSAdapter using lsof command
  - Implement WindowsAdapter using netstat and tasklist commands
  - Implement LinuxAdapter using lsof or ss command with fallback
  - Write command output parsers for each platform to extract port and process information
  - Implement platform detection logic to select appropriate adapter
  - _Requirements: 8.1, 8.2, 8.3, 8.4_

- [x] 3. Build Port Scanner Service in main process

  - Create PortScannerService class with scanPorts and scanDevPorts methods
  - Implement port range validation (1024-65535)
  - Integrate PlatformAdapter to execute system commands via child_process
  - Parse command output into PortInfo objects
  - Implement caching mechanism with TTL to reduce system calls
  - Add error handling for command execution failures
  - _Requirements: 1.1, 1.2, 8.1, 8.2, 8.3, 9.2_

- [x] 4. Create IPC preload script for secure renderer communication

  - Define contextBridge API for ports operations
  - Expose safe methods: scanPorts, getPort, killProcess, openInBrowser
  - Expose monitoring controls: startMonitoring, stopMonitoring
  - Set up event listeners for port-added, port-removed, port-updated events
  - Ensure no direct Node.js access from renderer
  - _Requirements: 9.3_

- [x] 5. Implement Process Monitor for real-time port tracking

  - Create ProcessMonitor class with start/stop monitoring methods
  - Implement periodic scanning with configurable interval (default 5 seconds)
  - Maintain in-memory snapshot of current ports using Map data structure
  - Implement diff algorithm to detect added, removed, and updated ports
  - Emit events (port-added, port-removed, port-updated) for changes
  - Add cleanup logic to stop monitoring and clear resources
  - _Requirements: 1.3, 1.4, 1.5, 2.5_

- [x] 6. Create Framework Detector for dev server identification

  - Create FrameworkDetector class with detectFramework method
  - Define framework detection patterns for Webpack, Vite, Next.js, CRA, Vue, Angular
  - Define framework detection patterns for Django, Flask, Rails, PHP
  - Implement pattern matching against process command line
  - Return FrameworkInfo with display name and metadata
  - Handle cases where no framework is detected
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [x] 7. Implement Port Actions Service for process management

  - Create PortActionsService class with killProcess and openInBrowser methods
  - Use PlatformAdapter's killProcess method for process termination
  - Implement browser opening using Electron's shell.openExternal
  - Add URL construction logic (http/https detection for ports 3000-9999)
  - Use PlatformAdapter's requiresElevation to check for system processes
  - Return ActionResult with success status and error messages
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 4.1, 4.2, 4.3, 4.4, 4.5_

- [x] 8. Set up IPC handlers in main process

  - Create instances of PortScannerService, ProcessMonitor, FrameworkDetector, and PortActionsService
  - Register ipcMain.handle for 'ports:scan' to trigger port scanning
  - Register ipcMain.handle for 'ports:get' to retrieve specific port info
  - Register ipcMain.handle for 'ports:kill' to terminate process
  - Register ipcMain.handle for 'ports:open-browser' to open URL
  - Register ipcMain.handle for 'ports:start-monitoring' and 'ports:stop-monitoring'
  - Implement event emission to renderer using webContents.send for port changes
  - Add error handling and validation for all IPC messages
  - Integrate FrameworkDetector to enrich port data before sending to renderer
  - _Requirements: 9.3, 9.2, 7.1, 7.2, 7.3, 7.4, 7.5_

- [x] 9. Build React state management for ports data

  - Create PortsContext with React Context API
  - Define PortsState interface with ports array, selectedPort, filters, and loading states
  - Implement usePortsManager hook for state management
  - Add actions for updating ports, setting filters, selecting ports
  - Integrate IPC calls within state management hooks using window.portsAPI
  - Set up event listeners to update state when ports change
  - _Requirements: 1.2, 1.4, 1.5, 5.1, 5.2, 5.3, 5.4_

- [x] 10. Implement PortsList component with virtual scrolling

  - Install react-window package for virtual scrolling
  - Create PortsList component using react-window's FixedSizeList
  - Render PortItem components for each port in virtual scroller
  - Display port number, process name, PID, and framework badge
  - Implement row height calculation for consistent scrolling
  - Add loading state and empty state handling
  - Optimize rendering with React.memo for PortItem
  - _Requirements: 1.2, 9.1, 9.5_

- [x] 11. Create PortItem component with action buttons

  - Display port number with protocol badge (TCP/UDP)
  - Display process name with framework icon if detected
  - Display process ID and state (LISTEN, ESTABLISHED, etc.)
  - Add "Open in Browser" button for ports 3000-9999
  - Add "Kill Process" button that triggers confirmation
  - Add "Copy" dropdown with options for port, URL, and process info
  - Implement hover and selection states
  - Call window.portsAPI methods for actions
  - _Requirements: 1.2, 2.1, 2.2, 2.3, 2.4, 3.1, 3.2, 4.1, 6.1, 6.2, 6.3_

- [x] 12. Build PortsToolbar with search and filters

  - Create SearchInput component with debounced onChange (200ms)
  - Implement search filtering by port number, process name, and application name
  - Create FilterDropdown for port range selection (common dev ranges)
  - Create FilterDropdown for protocol selection (TCP, UDP, ALL)
  - Add refresh button to manually trigger port scan via window.portsAPI.scanPorts
  - Persist filter settings to localStorage
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [x] 13. Implement PortDetailsPanel for selected port

  - Display full process command line in scrollable text area
  - Display protocol type and connection state
  - Display application name if detected by Framework Detector
  - Add action buttons (Open, Kill, Copy) in details panel
  - Call window.portsAPI methods for actions
  - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [x] 14. Create Notification Service for user feedback

  - Install react-hot-toast or similar toast library
  - Create NotificationService wrapper component
  - Create notification types: info, warning, error, success
  - Implement showPortConflict method with port and process info
  - Add notification actions (View Port, Kill Process)
  - Set notification duration (2 seconds for confirmations, persistent for conflicts)
  - Integrate with clipboard operations to show copy confirmations
  - _Requirements: 4.4, 6.4, 10.2, 10.3, 10.4_

- [x] 15. Implement clipboard operations

  - Create ClipboardService using navigator.clipboard API
  - Implement copyPort method to copy port number
  - Implement copyURL method to construct and copy localhost URL
  - Implement copyProcessInfo method to format and copy process details
  - Integrate with Notification Service to show copy confirmations
  - Handle clipboard errors gracefully
  - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [x] 16. Add confirmation dialogs for destructive actions

  - Create ConfirmDialog component with customizable message
  - Implement confirmation for kill process action with process name and port
  - Add "Don't ask again" checkbox for user preference
  - Integrate with Port Actions Service before executing kill via window.portsAPI.killProcess
  - Handle dialog cancellation and confirmation
  - _Requirements: 4.1, 4.5_

- [x] 17. Integrate ConfirmDialog into PortItem and PortDetailsPanel

  - Replace inline kill confirmation in PortItem with ConfirmDialog component
  - Replace inline kill confirmation in PortDetailsPanel with ConfirmDialog component
  - Export ConfirmDialog from components/index.ts
  - Use shouldShowConfirmation utility to check user preferences
  - _Requirements: 4.1, 4.5_

- [x] 18. Implement error handling and user feedback

  - Create ErrorBoundary component for React error handling
  - Wrap App component with ErrorBoundary in main.tsx
  - Add error display for permission errors with instructions
  - Add error display for platform command failures with retry option
  - Show user-friendly error messages in notifications for process termination failures
  - _Requirements: 4.4, 8.4_

- [x] 19. Style UI components and implement responsive design

  - Create CSS modules or styled-components for all components
  - Implement light and dark theme support
  - Style PortsList with proper spacing and hover effects
  - Style PortItem with badges, icons, and action buttons
  - Style PortDetailsPanel with readable typography
  - Style PortsToolbar with consistent input styling
  - Ensure responsive layout for different window sizes
  - Add loading spinners and skeleton screens
  - _Requirements: 9.1_

- [x] 20. Integrate all components in main PortsManagerView

  - Create PortsManagerView as main container component
  - Compose PortsToolbar, PortsList, and PortDetailsPanel
  - Set up PortsContext provider at root level
  - Initialize monitoring on component mount using window.portsAPI.startMonitoring
  - Clean up monitoring on component unmount using window.portsAPI.stopMonitoring
  - Wire up all event handlers and state updates
  - Update App.tsx to render PortsManagerView
  - _Requirements: 1.1, 1.3, 9.1_

- [ ] 21. Implement port conflict detection

  - Add conflict detection logic in ProcessMonitor service to track previously free ports
  - Emit port-conflict event with port number and process info when a port becomes occupied
  - Update IPC handlers in main.ts to forward port-conflict events to renderer
  - Update preload script to expose onPortConflict event listener
  - Add onPortConflict handler in PortsContext to display conflict notifications
  - Implement notification actions to view or kill conflicting process using existing notification service
  - _Requirements: 10.1, 10.2, 10.3, 10.4_

- [ ] 22. Build Settings panel for user preferences

  - Create Settings.tsx component with form inputs in src/renderer/components/
  - Add scan interval configuration input (default 5000ms, min 1000ms)
  - Add default port range selection dropdown using existing PORT_RANGES
  - Add toggle for showing system ports (< 1024)
  - Add notification preferences section (enable/disable, conflict detection toggle)
  - Persist settings to localStorage using consistent key naming (e.g., 'ports-manager-settings')
  - Create useSettings hook to manage settings state and apply to monitoring/scanning
  - Add Settings button to PortsToolbar that opens Settings modal/panel
  - Export Settings component from components/index.ts
  - _Requirements: 5.5, 10.5_

- [x] 23. Configure Electron packaging and build
  - Install electron-builder package
  - Configure electron-builder in package.json or electron-builder.json
  - Set up build scripts for macOS, Windows, and Linux
  - Configure app icons and metadata
  - Test packaged app on target platform
  - _Requirements: 8.1, 8.2, 8.3_
