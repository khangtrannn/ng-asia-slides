# Angular Change Detection Presentation - Complete Structure

## Overview
**Total Slides: 42**
**File: src/Presentation.tsx**
**Status: ✅ Complete and Ready**

## Presentation Structure

### Section 1: Introduction & Foundations (8 slides)
1. **Angular Change Detection Deep Dive** - Opening slide with UI = fn(state)
2. **Web Development 101** - The Manual Era
3. **Component Views and Bindings** - The Foundation
4. **The Ivy Instructions - Part 1** - Template compilation
5. **The Ivy Instructions - Part 2** - property() implementation
6. **Zone.js - The Notification System** - Intercepting async operations
7. **The Unidirectional Data Flow** - Why Angular checks top-down
8. **NG0100 - ExpressionChanged Error** - The enforcement mechanism

### Section 2: OnPush Strategy (6 slides)
9. **OnPush Strategy** - From Global to Selective Checking
10. **OnPush Strategy Deep Dive** - Optimizing Change Detection
11. **What Makes OnPush Dirty?** - The Five Triggers
12. **shouldRefreshView Logic** - Determining What Gets Checked
13. **markViewDirty Algorithm** - How Dirtiness Propagates
14. **OnPush Best Practices** - Making OnPush Work for You

### Section 3: Change Detection Internals (6 slides)
15. **The Synchronization Loop** - ApplicationRef.tick
16. **Signals - The Reactive Graph** - From Push to Pull
17. **Signals + OnPush = Local Change Detection** - Fine-grained reactivity
18. **detectChanges - Local Change Detection** - Running CD for specific subtree
19. **markForCheck - The Dirty Flag API** - Requesting CD without running it
20. **AsyncPipe - The OnPush Enabler** - Automatic markForCheck

### Section 4: The NG100 Problem & Solution (4 slides)
21. **The Problem - Bi-directional Flow** - When child updates parent
22. **Traditional Solutions to NG100** - Working around unidirectional flow
23. **Signals - The Reactive Primitive** - Fine-grained reactivity
24. **The Reactive Graph** - Producer-Consumer Dependency Tracking

### Section 5: Signals Deep Dive (8 slides)
25. **Signal.set → markAncestorsForTraversal** - How signals schedule CD
26. **Global vs Targeted CD Mode** - How signals enable surgical updates
27. **How Signals Solve NG100** - Bi-directional flow without breaking invariants
28. **The synchronize() Loop** - Allowing controlled re-checks
29. **Effects - Side Effects with Dependencies** - The final reactive piece
30. **Signals: The Reactive Foundation** - Fine-Grained Reactivity Primitives
31. **The Reactive Graph** - Producer-Consumer Dependency Tracking
32. **Signal.set → Change Detection** - From Signal Update to View Refresh

### Section 6: Change Detection Modes (4 slides)
33. **Global vs Targeted CD Mode** - Surgical Updates with Signals
34. **Signals Solve NG100** - Controlled Bi-Directional Flow
35. **Zoneless Change Detection** - Pure Reactive Synchronization
36. **Hybrid Mode (v18+)** - Zone.js + Signals Together

### Section 7: Zoneless & Modern Angular (6 slides)
37. **Zoneless in Production** - What changes, what stays
38. **The shouldScheduleTick Strategy** - Hybrid mode details
39. **Zoneless Change Detection** - The final form
40. **Hybrid Mode (v18+)** - The best of both worlds
41. **The Grand Finale** - Evolution timeline
42. **Summary & Key Takeaways** - Final slide

## Features

### Navigation
- **Keyboard Controls:**
  - `→` or `Space` - Next slide
  - `←` - Previous slide
  - `Home` - Jump to first slide
  - `End` - Jump to last slide

### UI Elements
- ✅ Slide counter (e.g., "Slide 15 / 42")
- ✅ Navigation buttons (Previous/Next)
- ✅ Progress bar showing completion
- ✅ Responsive layout (max 1920x1080)
- ✅ Code syntax highlighting
- ✅ Color-coded sections
- ✅ Icon integration (lucide-react)

### Visual Styling
- Dark theme (bg-gray-950)
- Gradient text for emphasis
- Code blocks with syntax highlighting
- Grid layouts for comparisons
- Border highlights for important notes
- Consistent spacing and typography

## Key Topics Covered

### Core Concepts
- Component Views (LView)
- Bindings and oldValues
- Dirty checking
- Template compilation to instructions
- The property() function

### Zone.js
- Zone patching mechanism
- onMicrotaskEmpty event
- ApplicationRef.tick()
- runOutsideAngular() gotchas

### OnPush Strategy
- CheckAlways vs CheckOnce
- What makes OnPush dirty
- markForCheck() vs detectChanges()
- AsyncPipe integration
- Best practices

### Signals
- Reactive primitives
- Producer-consumer graph
- Automatic dependency tracking
- Lazy computed values
- Effects
- Glitch-free updates

### Zoneless Mode
- provideZonelessChangeDetection()
- What still triggers CD
- What no longer works
- Migration strategies

### Hybrid Mode (v18+)
- shouldScheduleTick logic
- Three execution modes
- Zone + Signals coexistence
- Execution context handling

### Advanced Topics
- Unidirectional data flow
- NG0100 error explained
- The synchronization loop
- markViewDirty algorithm
- markAncestorsForTraversal
- Global vs Targeted modes
- Mode switching

## Running the Presentation

```bash
npm run dev
```

Then open http://localhost:5173 in your browser.

## Exporting

The presentation can be:
- Presented live in the browser
- Printed to PDF (use browser print)
- Screen recorded for video
- Converted to static HTML

## Notes

- All slides are self-contained
- Code examples are simplified for clarity
- Real Angular source code is referenced
- Best practices are highlighted
- Common pitfalls are explained
- Migration paths are provided

---

**Status: ✅ Complete**
**Last Updated: October 18, 2025**
**Total Development Time: Complete end-to-end presentation**
