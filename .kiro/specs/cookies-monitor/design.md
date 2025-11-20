# Design Document: Cookies Monitor

## Overview

The Cookies Monitor is a developer tool integrated into the Electron-based dashboard application. It provides real-time visibility into browser cookies stored by the application, enabling developers to inspect, filter, manage, and export cookie data. The tool follows the existing architecture pattern established by the Ports Manager tool, utilizing React components, context-based state management, and Electron IPC for accessing cookie data.

## Architecture

The Cookies Monitor follows a layered architecture consistent with the existing application:

### Presentation Layer (Renderer Process)

- React components for UI rendering
- Context providers for state management
- Custom hooks for cookie operations

### Service Layer (Main Process)

- CookieMonitorService: Manages cookie retrieval and manipulation via Electron's cookie API
- Handles IPC communication between renderer and main processes

### Data Flow

1. Renderer requests cookie data via IPC
2. Main process queries Electron's session.defaultSession.cookies API
3. Cookie data is returned to renderer
4. React components render the data
5. User actions trigger IPC calls to modify cookies

## Components and Interfaces

### React Components

#### CookiesMonitorTool (Main Container)

```typescript
interface CookiesMonitorToolProps {
  // No props needed - uses context
}
```

- Root component for the cookies monitor
- Manages polling interval for real-time updates
- Coordinates between child components

#### CookiesList

```typescript
interface CookiesListProps {
  cookies: CookieEntry[];
  selectedCookie: CookieEntry | null;
  onSelectCookie: (cookie: CookieEntry) => void;
  onDeleteCookie: (cookie: CookieEntry) => void;
}
```

- Displays list of cookies in a table format
- Handles cookie selection
- Shows name, domain, expiration, size

#### CookieDetailsPanel

```typescript
interface CookieDetailsPanelProps {
  cookie: CookieEntry | null;
}
```

- Shows detailed information for selected cookie
- Displays all attributes including security flags
- Provides scrollable view for long values

#### CookiesToolbar

```typescript
interface CookiesToolbarProps {
  onRefresh: () => void;
  onClearAll: () => void;
  onExport: () => void;
  totalSize: number;
  cookieCount: number;
}
```

- Action buttons for refresh, clear all, export
- Displays summary statistics
- Shows warnings for size limits

#### CookieSearchBar

```typescript
interface CookieSearchBarProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  domains: string[];
  selectedDomain: string | null;
  onDomainChange: (domain: string | null) => void;
}
```

- Text input for search
- Dropdown for domain filtering
- Clears filters

### Context

#### CookiesContext

```typescript
interface CookiesContextValue {
  cookies: CookieEntry[];
  filteredCookies: CookieEntry[];
  selectedCookie: CookieEntry | null;
  searchTerm: string;
  selectedDomain: string | null;
  isMonitoring: boolean;

  setSearchTerm: (term: string) => void;
  setSelectedDomain: (domain: string | null) => void;
  selectCookie: (cookie: CookieEntry | null) => void;
  refreshCookies: () => Promise<void>;
  deleteCookie: (cookie: CookieEntry) => Promise<void>;
  clearAllCookies: () => Promise<void>;
  exportCookies: () => void;
  startMonitoring: () => void;
  stopMonitoring: () => void;
}
```

### Main Process Service

#### CookieMonitorService

```typescript
class CookieMonitorService {
  async getAllCookies(): Promise<CookieEntry[]>;
  async deleteCookie(name: string, url: string): Promise<void>;
  async clearAllCookies(): Promise<void>;
}
```

### IPC Channels

- `cookies:getAll` - Retrieve all cookies
- `cookies:delete` - Delete a specific cookie
- `cookies:clearAll` - Clear all cookies

## Data Models

### CookieEntry

```typescript
interface CookieEntry {
  name: string;
  value: string;
  domain: string;
  path: string;
  secure: boolean;
  httpOnly: boolean;
  sameSite: "no_restriction" | "lax" | "strict";
  expirationDate?: number; // Unix timestamp, undefined for session cookies
  size: number; // Calculated size in bytes
}
```

### CookieFilter

```typescript
interface CookieFilter {
  searchTerm: string;
  domain: string | null;
}
```

### CookieStats

```typescript
interface CookieStats {
  totalCount: number;
  totalSize: number;
  sessionCount: number;
  persistentCount: number;
  secureCount: number;
}
```

## Correctness Properties

_A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees._

### Property 1: Cookie list alphabetical sorting

_For any_ collection of cookies, when displayed in the list view, the cookies should be sorted alphabetically by name in ascending order.
**Validates: Requirements 1.3**

### Property 2: Complete cookie data display

_For any_ cookie, when displayed in either the list or detail view, all required attributes (name, domain, expiration status for list view; name, value, domain, path, expiration, secure, httpOnly, sameSite for detail view) should be present in the rendered output.
**Validates: Requirements 1.2, 2.2**

### Property 3: Session cookie indication

_For any_ cookie without an expiration date, the expiration column should display "Session" rather than a date.
**Validates: Requirements 1.4**

### Property 4: Persistent cookie date formatting

_For any_ cookie with an expiration date, the displayed expiration should be in a human-readable format (not a raw timestamp).
**Validates: Requirements 1.5**

### Property 5: Cookie selection displays details

_For any_ cookie, when selected from the list, the detail panel should display with that cookie's complete information.
**Validates: Requirements 2.1**

### Property 6: Security flag highlighting

_For any_ cookie with security flags (secure, httpOnly, or sameSite) enabled, those attributes should be visually highlighted in the detail view.
**Validates: Requirements 2.4**

### Property 7: Search filtering matches multiple fields

_For any_ search term and cookie collection, the filtered results should include only cookies where the search term appears in the name, domain, or path fields (case-insensitive).
**Validates: Requirements 3.1, 3.2**

### Property 8: Search clear restores full list

_For any_ cookie collection, applying a search filter and then clearing it should restore the complete original list of cookies.
**Validates: Requirements 3.3**

### Property 9: Domain filtering

_For any_ selected domain and cookie collection, the filtered results should include only cookies whose domain matches the selected domain exactly.
**Validates: Requirements 3.4**

### Property 10: Multiple filter intersection

_For any_ combination of search term and domain filter, the results should include only cookies that match both criteria (intersection of both filters).
**Validates: Requirements 3.5**

### Property 11: Cookie deletion removes from list

_For any_ cookie in the displayed list, after deletion, that cookie should no longer appear in the list or be retrievable from storage.
**Validates: Requirements 4.1, 4.2**

### Property 12: Clear all removes all cookies

_For any_ cookie collection, after confirming clear all, the cookie store should be empty and the displayed list should contain zero cookies.
**Validates: Requirements 4.4**

### Property 13: Export serialization round-trip

_For any_ collection of cookies, exporting to JSON and then parsing that JSON should produce cookie data equivalent to the original collection (all attributes preserved).
**Validates: Requirements 6.1**

### Property 14: Export completeness

_For any_ cookie, the exported JSON should contain all cookie attributes (name, value, domain, path, secure, httpOnly, sameSite, expirationDate).
**Validates: Requirements 6.2**

### Property 15: Export clipboard content

_For any_ cookie collection, after export, the system clipboard should contain valid JSON representing all cookies.
**Validates: Requirements 6.3**

### Property 16: Cookie size calculation includes all fields

_For any_ cookie, the calculated size should equal the sum of byte lengths of name, value, domain, and path.
**Validates: Requirements 7.3**

### Property 17: Total size aggregation

_For any_ collection of cookies, the displayed total size should equal the sum of all individual cookie sizes.
**Validates: Requirements 7.4**

## Error Handling

### Cookie Retrieval Errors

- If Electron's cookie API fails, display an error message in the UI
- Retry retrieval once after a 1-second delay
- If retry fails, show "Unable to load cookies" with a manual refresh button

### Cookie Deletion Errors

- If deletion fails, show a toast notification with the error
- Do not remove the cookie from the UI if deletion fails
- Log the error to console for debugging

### Export Errors

- If clipboard access fails, show an error notification
- Provide a fallback to download the JSON as a file
- Ensure partial failures don't crash the application

### Validation Errors

- Validate cookie data structure before rendering
- Handle missing or malformed cookie attributes gracefully
- Use default values for optional fields

### Monitoring Errors

- If polling fails, log the error but continue monitoring
- Implement exponential backoff for repeated failures
- Stop monitoring after 5 consecutive failures and notify user

## Testing Strategy

The Cookies Monitor will employ a dual testing approach combining unit tests and property-based tests to ensure comprehensive coverage.

### Unit Testing

Unit tests will verify specific examples and integration points:

- Cookie list renders correctly with sample data
- Detail panel displays when a cookie is selected
- Search bar filters cookies with specific search terms
- Clear all confirmation dialog appears
- Export button triggers clipboard copy
- Monitoring starts and stops based on visibility
- Error states display appropriate messages

### Property-Based Testing

Property-based tests will verify universal properties across all inputs using **fast-check** (JavaScript/TypeScript property testing library). Each test will run a minimum of 100 iterations with randomly generated data.

**Test Configuration:**

```typescript
fc.assert(
  fc.property(/* generators */, /* test function */),
  { numRuns: 100 }
);
```

**Property Test Requirements:**

- Each property-based test MUST be tagged with a comment referencing the correctness property from this design document
- Tag format: `// Feature: cookies-monitor, Property {number}: {property_text}`
- Each correctness property MUST be implemented by a SINGLE property-based test
- Tests should use custom generators for CookieEntry objects with realistic constraints

**Generators Needed:**

- `arbitraryCookieEntry()` - Generates valid cookie objects
- `arbitraryCookieArray()` - Generates arrays of cookies
- `arbitrarySearchTerm()` - Generates search strings
- `arbitraryDomain()` - Generates valid domain strings

**Property Tests to Implement:**

1. Cookie list sorting (Property 1)
2. Complete data display (Property 2)
3. Session cookie indication (Property 3)
4. Date formatting (Property 4)
5. Selection displays details (Property 5)
6. Security flag highlighting (Property 6)
7. Search filtering (Property 7)
8. Search clear restoration (Property 8)
9. Domain filtering (Property 9)
10. Multiple filter intersection (Property 10)
11. Deletion removes from list (Property 11)
12. Clear all empties store (Property 12)
13. Export round-trip (Property 13)
14. Export completeness (Property 14)
15. Clipboard content (Property 15)
16. Size calculation (Property 16)
17. Total size aggregation (Property 17)

### Integration Testing

Integration tests will verify the complete flow:

- Loading cookies from Electron API
- IPC communication between main and renderer
- Real-time monitoring updates
- End-to-end export workflow

### Edge Cases

Property-based testing will naturally cover edge cases through random generation:

- Empty cookie collections
- Cookies with very long values (>100 characters)
- Cookies exceeding size limits (>4096 bytes)
- Collections exceeding total size limits (>10KB)
- Cookies with missing optional fields
- Deletion failures
- Empty export scenarios

## Implementation Notes

### Technology Stack

- React 18+ for UI components
- TypeScript for type safety
- Electron session.defaultSession.cookies API for cookie access
- fast-check for property-based testing
- Vitest for test runner

### Performance Considerations

- Implement virtual scrolling for large cookie lists (>100 items)
- Debounce search input (300ms) to avoid excessive filtering
- Use React.memo for cookie list items to prevent unnecessary re-renders
- Pause monitoring when tool is not visible
- Limit polling frequency to 500ms to balance responsiveness and performance

### Accessibility

- Ensure keyboard navigation works for cookie list
- Provide ARIA labels for all interactive elements
- Support screen readers for cookie details
- Maintain focus management when switching between list and details
- Use semantic HTML elements

### Security Considerations

- Never log cookie values to console in production
- Mask sensitive cookie values in UI (show first/last 4 characters)
- Warn users before exporting cookies (contains sensitive data)
- Respect HttpOnly flag - indicate these cookies cannot be accessed via JavaScript
- Display security warnings for cookies without Secure flag on HTTPS sites
