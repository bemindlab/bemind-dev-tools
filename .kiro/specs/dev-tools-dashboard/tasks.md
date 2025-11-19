# Implementation Plan

- [ ] 1. Set up project structure and tool registry system

  - Create core types and interfaces for Tool, ToolRegistry, and ToolComponentProps
  - Implement ToolRegistry service with registration, retrieval, search, and category filtering
  - Set up testing framework (Vitest) and fast-check for property-based testing
  - _Requirements: 1.1, 1.2, 6.1_

- [ ] 1.1 Write property test for tool category assignment

  - **Property 17: Tool category assignment**
  - **Validates: Requirements 6.1**

- [ ] 1.2 Write unit tests for ToolRegistry

  - Test tool registration, retrieval, search, and category filtering
  - Test edge cases: duplicate registration, invalid tool data
  - _Requirements: 1.1, 5.2, 6.3_

- [ ] 2. Implement navigation system and routing

  - Create NavigationContext with state management for current view and active tool
  - Implement NavigationRouter component with view transitions
  - Add transition state management to prevent navigation during transitions
  - _Requirements: 2.1, 2.2, 2.3, 9.3_

- [ ] 2.1 Write property test for navigation blocking during transitions

  - **Property 29: Navigation blocking during transitions**
  - **Validates: Requirements 9.3**

- [ ] 2.2 Write unit tests for NavigationRouter

  - Test route changes, transition states, navigation blocking
  - _Requirements: 2.1, 2.2, 2.3_

- [ ] 3. Create ToolCard component with status and interaction support

  - Implement ToolCard component displaying icon, name, description
  - Add status badge rendering with color mapping (active, warning, error)
  - Add notification count badge display
  - Implement context menu for pin/unpin actions
  - Add hover tooltip with tool features
  - _Requirements: 1.2, 4.1, 4.2, 4.4, 4.5, 8.1, 12.1, 12.3_

- [ ] 3.1 Write property test for tool card rendering completeness

  - **Property 1: Tool card rendering completeness**
  - **Validates: Requirements 1.2**

- [ ] 3.2 Write property test for status badge display

  - **Property 10: Status badge display for active tools**
  - **Validates: Requirements 4.1**

- [ ] 3.3 Write property test for notification badge display

  - **Property 11: Notification badge display**
  - **Validates: Requirements 4.2**

- [ ] 3.4 Write property test for status badge color mapping

  - **Property 13: Status badge color mapping**
  - **Validates: Requirements 4.4**

- [ ] 3.5 Write property test for tooltip content

  - **Property 39: Tooltip content includes features**
  - **Validates: Requirements 12.3**

- [ ] 3.6 Write unit tests for ToolCard component

  - Test rendering, click handlers, context menu, tooltips
  - _Requirements: 1.2, 4.1, 4.2, 8.1, 12.1_

- [ ] 4. Implement SearchBar and search filtering logic

  - Create SearchBar component with debounced input (100ms)
  - Implement search filtering logic (name and description matching)
  - Add clear search functionality
  - Handle empty search results state
  - _Requirements: 5.1, 5.2, 5.4, 5.5_

- [ ] 4.1 Write property test for search filtering correctness

  - **Property 15: Search filtering correctness**
  - **Validates: Requirements 5.2**

- [ ] 4.2 Write property test for search clear shows all tools

  - **Property 16: Search clear shows all tools**
  - **Validates: Requirements 5.5**

- [ ] 4.3 Write unit tests for SearchBar

  - Test input handling, debouncing, clear functionality
  - _Requirements: 5.1, 5.2, 5.5_

- [ ] 5. Implement CategoryFilter component and filtering logic

  - Create CategoryFilter component with category buttons
  - Display tool count for each category
  - Implement category filtering logic
  - Add "All" category support
  - _Requirements: 6.2, 6.3, 6.4, 6.5_

- [ ] 5.1 Write property test for category filtering correctness

  - **Property 18: Category filtering correctness**
  - **Validates: Requirements 6.3**

- [ ] 5.2 Write property test for category tool count accuracy

  - **Property 19: Category tool count accuracy**
  - **Validates: Requirements 6.5**

- [ ] 5.3 Write unit tests for CategoryFilter

  - Test button rendering, selection handling, counts
  - _Requirements: 6.2, 6.3, 6.5_

- [ ] 6. Create UserPreferences service with persistence

  - Implement UserPreferences interface and storage service
  - Add pinned tools management (max 6)
  - Add recently used tools tracking (max 3)
  - Implement localStorage persistence with error handling
  - Add reduced motion preference support
  - _Requirements: 7.1, 7.3, 7.4, 8.2, 8.3, 8.5, 9.5_

- [ ] 6.1 Write property test for pin limit enforcement

  - **Property 28: Pin limit enforcement**
  - **Validates: Requirements 8.5**

- [ ] 6.2 Write property test for recently used display limit

  - **Property 21: Recently used display limit**
  - **Validates: Requirements 7.3**

- [ ] 6.3 Write property test for pinned tools persistence round-trip

  - **Property 26: Pinned tools persistence round-trip**
  - **Validates: Requirements 8.3**

- [ ] 6.4 Write property test for recently used persistence round-trip

  - **Property 22: Recently used persistence round-trip**
  - **Validates: Requirements 7.4**

- [ ] 6.5 Write unit tests for UserPreferences service

  - Test get, set, validation, persistence, error handling
  - _Requirements: 7.4, 8.3, 8.5, 9.5_

- [ ] 7. Implement HomePage component with grid layout

  - Create HomePage component with responsive grid layout
  - Integrate SearchBar and CategoryFilter
  - Display pinned tools section (if any pinned)
  - Display recently used section (if any recent)
  - Display all tools grid with filtered results
  - Handle empty states (no tools found, no pinned, no recent)
  - _Requirements: 1.1, 1.3, 5.1, 6.2, 7.2, 7.3, 8.2_

- [ ] 7.1 Write property test for recently used recording

  - **Property 20: Recently used recording**
  - **Validates: Requirements 7.1**

- [ ] 7.2 Write property test for pin tool adds to pinned section

  - **Property 25: Pin tool adds to pinned section**
  - **Validates: Requirements 8.2**

- [ ] 7.3 Write property test for unpin removes from pinned section

  - **Property 27: Unpin removes from pinned section**
  - **Validates: Requirements 8.4**

- [ ] 7.4 Write unit tests for HomePage component

  - Test rendering, search integration, filter integration, sections
  - _Requirements: 1.1, 5.1, 6.2, 7.2, 8.2_

- [ ] 8. Create ToolViewContainer component with state management

  - Implement ToolViewContainer that wraps tool components
  - Add tool state preservation during navigation
  - Implement BreadcrumbNavigation component
  - Add home button/back button in navigation
  - _Requirements: 2.3, 2.5, 3.1, 3.2, 3.3, 11.1, 11.2, 11.3_

- [ ] 8.1 Write property test for tool state preservation during navigation

  - **Property 7: Tool state preservation during navigation**
  - **Validates: Requirements 3.2, 11.1, 11.2**

- [ ] 8.2 Write property test for breadcrumb tool name display

  - **Property 8: Breadcrumb tool name display**
  - **Validates: Requirements 3.3**

- [ ] 8.3 Write property test for session state maintenance

  - **Property 36: Session state maintenance**
  - **Validates: Requirements 11.3**

- [ ] 8.4 Write unit tests for ToolViewContainer

  - Test tool mounting, state preservation, breadcrumb rendering
  - _Requirements: 2.3, 3.2, 3.3, 11.1_

- [ ] 9. Implement ToolStateManager for persistence

  - Create ToolStateManager service for saving/loading tool states
  - Implement state serialization and deserialization
  - Add localStorage persistence with error handling
  - Handle corrupted state gracefully
  - _Requirements: 11.4, 11.5_

- [ ] 9.1 Write property test for state persistence round-trip

  - **Property 37: State persistence round-trip**
  - **Validates: Requirements 11.4, 11.5**

- [ ] 9.2 Write unit tests for ToolStateManager

  - Test save, load, clear, persistence, error handling
  - _Requirements: 11.4, 11.5_

- [ ] 10. Add keyboard navigation support

  - Implement Tab navigation between tool cards
  - Add Enter key to open focused tool
  - Add Escape key to return to home from tool view
  - Implement Cmd/Ctrl+H shortcut for home navigation
  - Add arrow key navigation in tool card grid
  - Ensure visible focus indicators on all interactive elements
  - _Requirements: 3.5, 10.1, 10.2, 10.3, 10.4, 10.5_

- [ ] 10.1 Write property test for keyboard shortcut home navigation

  - **Property 9: Keyboard shortcut home navigation**
  - **Validates: Requirements 3.5**

- [ ] 10.2 Write property test for tab navigation

  - **Property 31: Tab navigation between tool cards**
  - **Validates: Requirements 10.1**

- [ ] 10.3 Write property test for enter key opens tool

  - **Property 32: Enter key opens focused tool**
  - **Validates: Requirements 10.2**

- [ ] 10.4 Write property test for escape key returns to home

  - **Property 33: Escape key returns to home**
  - **Validates: Requirements 10.3**

- [ ] 10.5 Write property test for arrow key navigation

  - **Property 35: Arrow key navigation in grid**
  - **Validates: Requirements 10.5**

- [ ] 10.6 Write unit tests for keyboard navigation

  - Test all keyboard shortcuts and navigation patterns
  - _Requirements: 3.5, 10.1, 10.2, 10.3, 10.5_

- [ ] 11. Integrate existing Ports Manager as first tool

  - Wrap Ports Manager component to implement ToolComponentProps
  - Register Ports Manager in tool registry with metadata
  - Map Ports Manager state to tool state interface
  - Ensure all existing Ports Manager functionality works
  - _Requirements: 1.5_

- [ ] 11.1 Write integration test for Ports Manager integration

  - Test navigation to Ports Manager, state preservation, functionality
  - _Requirements: 1.5, 11.1_

- [ ] 12. Implement view transitions and animations

  - Add CSS transitions for navigation (fade/slide)
  - Implement reduced motion support
  - Ensure transitions complete within 300ms
  - Add transition state management
  - _Requirements: 9.1, 9.2, 9.3, 9.5_

- [ ] 12.1 Write property test for reduced motion disables transitions

  - **Property 30: Reduced motion disables transitions**
  - **Validates: Requirements 9.5**

- [ ] 12.2 Write unit tests for transitions

  - Test transition states, reduced motion, timing
  - _Requirements: 9.1, 9.3, 9.5_

- [ ] 13. Add real-time status badge updates

  - Implement status change detection and badge updates
  - Add recently used indicator display logic
  - Ensure badges update reactively when tool states change
  - _Requirements: 4.3, 4.5_

- [ ] 13.1 Write property test for status badge reactivity

  - **Property 12: Status badge reactivity**
  - **Validates: Requirements 4.3**

- [ ] 13.2 Write property test for recently used indicator display

  - **Property 14: Recently used indicator display**
  - **Validates: Requirements 4.5**

- [ ] 13.3 Write unit tests for status updates

  - Test status change detection, badge updates, reactivity
  - _Requirements: 4.3, 4.5_

- [ ] 14. Implement remaining navigation properties

  - Ensure tool card click navigation works correctly
  - Verify home page visibility during tool view
  - Ensure tool component rendering on navigation
  - Add navigation controls presence verification
  - Implement home navigation from any view
  - _Requirements: 2.1, 2.2, 2.3, 2.5, 3.1, 3.4_

- [ ] 14.1 Write property test for tool card click navigation

  - **Property 2: Tool card click navigation**
  - **Validates: Requirements 2.1**

- [ ] 14.2 Write property test for home page visibility

  - **Property 3: Home page visibility during tool view**
  - **Validates: Requirements 2.2**

- [ ] 14.3 Write property test for tool component rendering

  - **Property 4: Tool component rendering**
  - **Validates: Requirements 2.3**

- [ ] 14.4 Write property test for navigation controls presence

  - **Property 5: Navigation controls presence**
  - **Validates: Requirements 2.5**

- [ ] 14.5 Write property test for home navigation from any view

  - **Property 6: Home navigation from any view**
  - **Validates: Requirements 3.1, 3.4**

- [ ] 15. Add accessibility features

  - Implement visible focus indicators with sufficient contrast
  - Add ARIA labels for icon-only buttons
  - Add ARIA live regions for dynamic content
  - Ensure semantic HTML throughout
  - Test with screen readers
  - _Requirements: 10.4_

- [ ] 15.1 Write property test for focus indicator visibility

  - **Property 34: Focus indicator visibility**
  - **Validates: Requirements 10.4**

- [ ] 15.2 Write unit tests for accessibility

  - Test ARIA labels, semantic HTML, focus management
  - _Requirements: 10.4_

- [ ] 16. Implement tooltip positioning and boundary constraints

  - Add tooltip positioning logic to keep within window bounds
  - Implement hover delay (500ms) and hide delay (200ms)
  - Ensure tooltips display on hover for all tool cards
  - _Requirements: 12.1, 12.5_

- [ ] 16.1 Write property test for tooltip display on hover

  - **Property 38: Tooltip display on hover**
  - **Validates: Requirements 12.1**

- [ ] 16.2 Write property test for tooltip boundary constraint

  - **Property 40: Tooltip boundary constraint**
  - **Validates: Requirements 12.5**

- [ ] 16.3 Write unit tests for tooltips

  - Test positioning, delays, boundary constraints
  - _Requirements: 12.1, 12.5_

- [ ] 17. Add clear recently used history functionality

  - Implement clear history action in UserPreferences
  - Add UI control for clearing history
  - Update HomePage to reflect cleared state
  - _Requirements: 7.5_

- [ ] 17.1 Write property test for clear recently used history

  - **Property 23: Clear recently used history**
  - **Validates: Requirements 7.5**

- [ ] 17.2 Write unit tests for clear history

  - Test clear action, UI updates, persistence
  - _Requirements: 7.5_

- [ ] 18. Implement context menu for pin/unpin

  - Add context menu component with pin/unpin options
  - Handle right-click on tool cards
  - Update pinned state on pin/unpin actions
  - Show appropriate option based on current pin state
  - _Requirements: 8.1, 8.4_

- [ ] 18.1 Write property test for context menu pin option

  - **Property 24: Context menu pin option**
  - **Validates: Requirements 8.1**

- [ ] 18.2 Write unit tests for context menu

  - Test menu display, pin/unpin actions, state updates
  - _Requirements: 8.1, 8.4_

- [ ] 19. Add error handling and error boundaries

  - Implement React Error Boundary for tool components
  - Add error handling for navigation errors (invalid tool ID)
  - Handle state persistence failures gracefully
  - Add user-friendly error messages and recovery options
  - _Requirements: All (error handling)_

- [ ] 19.1 Write unit tests for error handling

  - Test error boundaries, navigation errors, persistence failures
  - _Requirements: All (error handling)_

- [ ] 20. Checkpoint - Ensure all tests pass

  - Ensure all tests pass, ask the user if questions arise.

- [ ] 21. Final integration testing and polish

  - Test complete user flows end-to-end
  - Verify all keyboard shortcuts work
  - Test state persistence across app restarts
  - Verify all transitions and animations
  - Test with reduced motion enabled
  - Verify accessibility with screen readers
  - _Requirements: All_

- [ ] 21.1 Write integration tests for complete user flows
  - Test home → tool → home with state preservation
  - Test search and filter combinations
  - Test pin/unpin and recently used flows
  - _Requirements: All_
