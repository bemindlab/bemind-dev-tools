# Implementation Plan

- [x] 1. Set up main process cookie service and IPC handlers

  - Create CookieMonitorService class in src/main/services/
  - Implement getAllCookies(), deleteCookie(), and clearAllCookies() methods using Electron's session.defaultSession.cookies API
  - Register IPC handlers for cookies:getAll, cookies:delete, and cookies:clearAll channels
  - Add TypeScript types for cookie data structures
  - _Requirements: 1.1, 4.1, 4.4_

- [x] 2. Create core data models and utilities

  - Define CookieEntry, CookieFilter, and CookieStats interfaces in types file
  - Implement cookie size calculation utility function (name + value + domain + path byte length)
  - Implement cookie sorting utility (alphabetical by name)
  - Implement date formatting utility for human-readable expiration dates
  - _Requirements: 1.3, 1.5, 7.3_

- [ ]\* 2.1 Write property test for cookie size calculation

  - **Property 16: Cookie size calculation includes all fields**
  - **Validates: Requirements 7.3**

- [ ]\* 2.2 Write property test for cookie sorting

  - **Property 1: Cookie list alphabetical sorting**
  - **Validates: Requirements 1.3**

- [x] 3. Implement cookies context and state management

  - Create CookiesContext with provider component
  - Implement state for cookies array, filtered cookies, selected cookie, search term, and selected domain
  - Implement refreshCookies() function that calls IPC to get all cookies
  - Implement filtering logic that applies search term and domain filters
  - Implement selectCookie(), setSearchTerm(), and setSelectedDomain() functions
  - _Requirements: 1.1, 3.1, 3.2, 3.4, 3.5_

- [ ]\* 3.1 Write property test for search filtering

  - **Property 7: Search filtering matches multiple fields**
  - **Validates: Requirements 3.1, 3.2**

- [ ]\* 3.2 Write property test for domain filtering

  - **Property 9: Domain filtering**
  - **Validates: Requirements 3.4**

- [ ]\* 3.3 Write property test for multiple filter intersection

  - **Property 10: Multiple filter intersection**
  - **Validates: Requirements 3.5**

- [ ]\* 3.4 Write property test for search clear restoration

  - **Property 8: Search clear restores full list**
  - **Validates: Requirements 3.3**

- [x] 4. Implement cookie deletion and clear all functionality

  - Add deleteCookie() function to context that calls IPC and updates state
  - Add clearAllCookies() function to context that calls IPC and clears state
  - Implement confirmation dialog for clear all action
  - Handle deletion errors and display error messages
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [ ]\* 4.1 Write property test for cookie deletion

  - **Property 11: Cookie deletion removes from list**
  - **Validates: Requirements 4.1, 4.2**

- [ ]\* 4.2 Write property test for clear all

  - **Property 12: Clear all removes all cookies**
  - **Validates: Requirements 4.4**

- [x] 5. Implement cookie export functionality

  - Add exportCookies() function to context that serializes cookies to JSON
  - Implement clipboard copy using ClipboardService
  - Display confirmation notification after successful export
  - Handle empty cookie collections (export empty array)
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [ ]\* 5.1 Write property test for export round-trip

  - **Property 13: Export serialization round-trip**
  - **Validates: Requirements 6.1**

- [ ]\* 5.2 Write property test for export completeness

  - **Property 14: Export completeness**
  - **Validates: Requirements 6.2**

- [ ]\* 5.3 Write property test for clipboard content

  - **Property 15: Export clipboard content**
  - **Validates: Requirements 6.3**

- [x] 6. Create CookieSearchBar component

  - Implement text input for search with debouncing (300ms)
  - Implement domain dropdown filter populated from unique cookie domains
  - Add clear filters button
  - Connect to context for search term and domain state
  - _Requirements: 3.1, 3.3, 3.4_

- [x] 7. Create CookiesList component

  - Implement table layout with columns for name, domain, expiration, size
  - Display "Session" for cookies without expiration date
  - Display formatted date for cookies with expiration date
  - Implement row selection that calls onSelectCookie
  - Add delete button for each cookie row
  - Implement virtual scrolling for performance with large lists
  - Apply sorting to display cookies alphabetically
  - _Requirements: 1.2, 1.3, 1.4, 1.5, 4.1_

- [ ]\* 7.1 Write property test for session cookie indication

  - **Property 3: Session cookie indication**
  - **Validates: Requirements 1.4**

- [ ]\* 7.2 Write property test for persistent cookie date formatting

  - **Property 4: Persistent cookie date formatting**
  - **Validates: Requirements 1.5**

- [ ]\* 7.3 Write property test for complete data display in list

  - **Property 2: Complete cookie data display (list view)**
  - **Validates: Requirements 1.2**

- [x] 8. Create CookieDetailsPanel component

  - Implement detail view layout showing all cookie attributes
  - Display name, value, domain, path, expiration, secure, httpOnly, sameSite
  - Implement scrollable view for long cookie values (>100 characters)
  - Add visual highlighting for security flags (secure, httpOnly, sameSite)
  - Show "No cookie selected" message when selectedCookie is null
  - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [ ]\* 8.1 Write property test for cookie selection displays details

  - **Property 5: Cookie selection displays details**
  - **Validates: Requirements 2.1**

- [ ]\* 8.2 Write property test for complete data display in details

  - **Property 2: Complete cookie data display (detail view)**
  - **Validates: Requirements 2.2**

- [ ]\* 8.3 Write property test for security flag highlighting

  - **Property 6: Security flag highlighting**
  - **Validates: Requirements 2.4**

- [x] 9. Create CookiesToolbar component

  - Implement refresh button that calls refreshCookies()
  - Implement clear all button that triggers confirmation dialog
  - Implement export button that calls exportCookies()
  - Display total cookie count and total size
  - Show warning indicator when total size exceeds 10KB
  - Show warning indicator for individual cookies exceeding 4096 bytes
  - _Requirements: 4.3, 6.3, 7.2, 7.4, 7.5_

- [ ]\* 9.1 Write property test for total size aggregation

  - **Property 17: Total size aggregation**
  - **Validates: Requirements 7.4**

- [x] 10. Create CookiesMonitorTool main container component

  - Implement root component that wraps all child components with CookiesContext
  - Set up polling interval (500ms) for real-time monitoring when component is visible
  - Implement startMonitoring() and stopMonitoring() based on visibility
  - Call refreshCookies() on mount and during polling
  - Clean up polling interval on unmount
  - Handle loading and error states
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [ ]\* 10.1 Write unit test for monitoring lifecycle

  - Test that monitoring starts when visible
  - Test that monitoring stops when not visible
  - Test polling interval is set correctly
  - _Requirements: 5.4, 5.5_

- [x] 11. Register CookiesMonitorTool in the tool registry

  - Add tool registration in src/renderer/tools/registerTools.ts
  - Set tool metadata (name, description, category, icon)
  - Import and register the CookiesMonitorTool component
  - _Requirements: 1.1_

- [x] 12. Add IPC type definitions to preload

  - Update src/preload/preload.ts to expose cookies IPC channels
  - Add TypeScript definitions for cookies API in electron.d.ts
  - Ensure type safety for IPC communication
  - _Requirements: 1.1, 4.1, 4.4_

- [ ] 13. Checkpoint - Ensure all tests pass

  - Ensure all tests pass, ask the user if questions arise.

- [ ]\* 14. Create property test generators and utilities

  - Implement arbitraryCookieEntry() generator using fast-check
  - Implement arbitraryCookieArray() generator
  - Implement arbitrarySearchTerm() generator
  - Implement arbitraryDomain() generator
  - Configure all property tests to run 100 iterations minimum
  - _Requirements: All testing requirements_

- [ ]\* 15. Write integration tests
  - Test complete flow from loading cookies to displaying in UI
  - Test IPC communication between main and renderer processes
  - Test real-time monitoring updates
  - Test end-to-end export workflow
  - _Requirements: 1.1, 5.1, 5.2, 5.3, 6.1, 6.2, 6.3_

## Additional Features Implemented

- [x] 16. Add URL-based cookie filtering

  - Implement filterCookiesByUrl utility function
  - Add URL input field in CookieSearchBar with debouncing
  - Validate domain, path, and secure flag matching
  - Handle invalid URLs gracefully
  - Update context to support selectedUrl state
  - _Requirements: Advanced filtering, 3.5_

- [x] 17. Implement browser cookie reading support

  - Create BrowserDetectionService to find installed browsers (Chrome, Edge, Brave, Firefox)
  - Create BrowserCookieReader for SQLite database reading
  - Support multiple browser profiles (Default, Profile 1, 2, etc.)
  - Handle locked databases by copying to temp files
  - Implement Chromium timestamp conversion (Windows epoch to Unix)
  - Support Firefox cookies.sqlite format
  - Add IPC handlers for getBrowserProfiles and setSource
  - Update CookieMonitorService with source switching
  - Cross-platform support (macOS, Windows, Linux)
  - Read-only access for browser cookies (no delete/clear)
  - _Requirements: External browser integration_

- [ ] 18. Add browser source selector UI

  - Add browser/profile dropdown in toolbar or search bar
  - Load available browsers on component mount
  - Display browser icon and profile name
  - Update cookies when source changes
  - Show read-only indicator for browser sources
  - Disable delete/clear buttons for browser sources
  - _Requirements: Browser source UI, 1.1_
