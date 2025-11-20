# React Hooks

This directory contains custom React hooks for the Bemind Dev Tools dashboard.

## useToolStatus

Hooks for accessing tool statuses with reactive updates.

### `useToolStatuses()`

Returns a Map of all tool statuses that updates reactively when any status changes.

```typescript
import { useToolStatuses } from "../hooks/useToolStatus";

function MyComponent() {
  const toolStatuses = useToolStatuses();

  return (
    <div>
      {Array.from(toolStatuses.entries()).map(([toolId, status]) => (
        <div key={toolId}>
          {toolId}: {status.state}
        </div>
      ))}
    </div>
  );
}
```

### `useToolStatus(toolId: string)`

Returns the status for a specific tool that updates reactively when that tool's status changes.

```typescript
import { useToolStatus } from "../hooks/useToolStatus";

function ToolStatusDisplay({ toolId }: { toolId: string }) {
  const status = useToolStatus(toolId);

  if (!status) {
    return <div>No status</div>;
  }

  return (
    <div>
      Status: {status.state}
      {status.message && <p>{status.message}</p>}
      {status.notificationCount && <span>{status.notificationCount}</span>}
    </div>
  );
}
```

## Setting Tool Status

To update tool statuses, use the `toolStatusManager` service:

```typescript
import { toolStatusManager } from "../services/ToolStatusManager";

// Set a tool status
toolStatusManager.setStatus("ports-manager", {
  state: "active",
  message: "Monitoring 5 ports",
  notificationCount: 2,
});

// Clear a tool status
toolStatusManager.clearStatus("ports-manager");

// Get current status (non-reactive)
const status = toolStatusManager.getStatus("ports-manager");
```

The hooks will automatically update any components using them when statuses change.
