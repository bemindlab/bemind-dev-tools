# MVP Scope Adjustments

## What's In (MVP)

- ✅ Real-time system memory display (total, used, available, percentage)
- ✅ Visual memory gauge with color states (normal/warning/critical)
- ✅ Top 5 memory-consuming processes
- ✅ Refresh interval control (1-10 seconds)
- ✅ Pause/resume monitoring
- ✅ macOS platform support (primary development platform)
- ✅ Basic error handling and display
- ✅ Tool registration and dashboard integration

## What's Out (Post-MVP)

- ❌ Cache metrics display (complex, platform-dependent)
- ❌ Linux platform adapter (can add later)
- ❌ Windows platform adapter (can add later)
- ❌ Advanced error recovery mechanisms
- ❌ Historical graphs
- ❌ Memory alerts/notifications

## Simplified Architecture

- Single platform adapter (macOS only for MVP)
- No platform factory pattern initially (can refactor when adding platforms)
- Simplified error handling (display errors, no complex retry logic)
- Basic caching (simple TTL, no complex invalidation)

## Testing Focus

- Core property tests for calculations and data transformations
- Unit tests for critical paths
- Manual testing on macOS
- Skip cross-platform testing for MVP
