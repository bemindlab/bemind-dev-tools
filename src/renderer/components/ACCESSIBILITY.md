# Accessibility Features

This document outlines the accessibility features implemented in the Bemind Dev Tools dashboard to ensure compliance with WCAG 2.1 Level AA standards and Requirements 10.4.

## Overview

The Bemind Dev Tools dashboard is designed to be fully accessible to users with disabilities, including those who rely on:

- Screen readers
- Keyboard-only navigation
- Reduced motion preferences
- High contrast modes

## Implemented Features

### 1. Visible Focus Indicators

All interactive elements have visible focus indicators with sufficient contrast (2px solid #007bff outline with 2px offset):

- **Tool Cards**: Blue outline when focused
- **Category Filter Buttons**: Blue outline when focused
- **Search Input**: Blue border and box shadow when focused
- **Search Clear Button**: Blue outline when focused
- **Breadcrumb Navigation Buttons**: Blue outline when focused

**CSS Implementation**: Global focus-visible styles in `index.css` ensure consistent focus indicators across all interactive elements.

### 2. ARIA Labels

All icon-only buttons and interactive elements have descriptive ARIA labels:

- **Tool Cards**: `aria-label="Open {Tool Name}"`
- **Search Input**: `aria-label="Search tools"`
- **Search Clear Button**: `aria-label="Clear search"`
- **Category Filter Buttons**: `aria-label="Filter by {Category Name}"`
- **Breadcrumb Home Button**: `aria-label="Navigate to home"`
- **Status Badges**: `aria-label="Status: {state}"`
- **Notification Badges**: `aria-label="{count} notifications"`
- **Recently Used Indicator**: `aria-label="Recently used"`

### 3. ARIA Live Regions

Dynamic content updates are announced to screen readers:

- **Search Results**: Screen reader announcement when search results change
  - Format: "{count} tool(s) found"
  - Uses `role="status"` and `aria-live="polite"`
- **Empty State**: `role="status"` on "No tools found" message

### 4. Semantic HTML

The application uses semantic HTML elements throughout:

- **Navigation**: `<nav>` element with `aria-label="Breadcrumb"` for breadcrumb navigation
- **Headings**: Proper heading hierarchy (h1 for main title, h2 for sections)
- **Sections**: `<section>` elements for logical content grouping
- **Lists**: `<ol>` for breadcrumb navigation with proper list items
- **Buttons**: `<button>` elements for all interactive controls
- **Current Page**: `aria-current="page"` on current breadcrumb item
- **Decorative Elements**: `aria-hidden="true"` on breadcrumb separators

### 5. Keyboard Navigation

Full keyboard support is implemented:

- **Tab Navigation**: All interactive elements are keyboard accessible with `tabIndex={0}`
- **Enter Key**: Opens focused tool card
- **Escape Key**: Returns to home from tool view
- **Arrow Keys**: Navigate between tool cards in grid
- **Cmd/Ctrl+H**: Quick navigation to home page

**Focus Management**: Tool cards maintain focus state and can be navigated using Tab and arrow keys.

### 6. Reduced Motion Support

The application respects user preferences for reduced motion:

- **CSS Media Query**: `@media (prefers-reduced-motion: reduce)` disables animations
- **Transition Override**: All animations and transitions are reduced to 0.01ms when reduced motion is preferred
- **User Preference**: Stored in UserPreferences service for consistent behavior

### 7. Screen Reader Support

The application is optimized for screen readers:

- **Screen Reader Only Content**: `.sr-only` class for visually hidden but screen reader accessible content
- **Descriptive Labels**: All interactive elements have clear, descriptive labels
- **Status Announcements**: Dynamic content changes are announced via ARIA live regions
- **Semantic Structure**: Proper heading hierarchy and landmark regions

## Testing

### Property-Based Tests

- **Property 34**: Focus indicator visibility across all interactive elements
  - Tests tool cards, category buttons, search input, breadcrumb buttons, and clear button
  - Runs 100 iterations with random inputs

### Unit Tests

Comprehensive unit tests cover:

- **ARIA Labels**: All interactive elements have proper ARIA labels
- **ARIA States**: Dynamic ARIA states (aria-pressed, aria-current) update correctly
- **Semantic HTML**: Proper use of semantic elements (nav, section, button, etc.)
- **Focus Management**: tabIndex and role attributes are correctly applied
- **Dynamic Content**: Empty states and search results are accessible

## Best Practices

### For Developers Adding New Components

1. **Always add ARIA labels** to icon-only buttons and interactive elements
2. **Use semantic HTML** elements (button, nav, section, etc.)
3. **Ensure keyboard accessibility** with proper tabIndex and keyboard event handlers
4. **Add focus indicators** using the global focus-visible styles
5. **Test with screen readers** (VoiceOver on macOS, NVDA on Windows)
6. **Respect reduced motion** preferences in animations and transitions
7. **Use ARIA live regions** for dynamic content that should be announced

### Testing Checklist

- [ ] All interactive elements are keyboard accessible
- [ ] Focus indicators are visible with sufficient contrast
- [ ] ARIA labels are present on icon-only buttons
- [ ] Semantic HTML is used throughout
- [ ] Screen reader announces dynamic content changes
- [ ] Reduced motion preference is respected
- [ ] Tab order is logical and intuitive

## Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices Guide](https://www.w3.org/WAI/ARIA/apg/)
- [WebAIM Screen Reader Testing](https://webaim.org/articles/screenreader_testing/)
- [MDN Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)

## Compliance

The Bemind Dev Tools dashboard meets the following accessibility standards:

- **WCAG 2.1 Level AA**: All success criteria are met
- **Section 508**: Compliant with federal accessibility requirements
- **Requirements 10.4**: Visible focus indicators on all interactive elements
