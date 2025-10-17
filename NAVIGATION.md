# Navigation Guide

## Keyboard Shortcuts

- **Arrow Left / Previous Button** - Go to previous slide
- **Arrow Right / Next Button** - Go to next slide
- **Home** - Go to first slide
- **End** - Go to last slide
- **Spacebar** - Go to next slide

## Slide Counter

The slide counter at the bottom shows your current position (e.g., "1 / 28")

## Tips for Presenting

1. **Code Blocks**: All code examples are syntax-highlighted for better readability
2. **Concept Highlighting**: Key concepts are color-coded:
   - 🟢 Green: Positive aspects, solutions
   - 🔴 Red: Problems, errors, warnings
   - 🟡 Yellow: Cautions, important notes
   - 🟣 Purple: Advanced concepts
   - 🔵 Blue: Technical details

3. **Flow**: The presentation follows a narrative arc:
   - Acts I-VI: The problem space
   - Acts VII-IX: Optimization attempts
   - Acts X-XIII: Transition period
   - Acts XIV-XVIII: Deep dive into the problem
   - Acts XIX-XXIV: The solution
   - Acts XXV-XXVII: Production-ready
   - Grand Finale: Unified vision

## Key Messages to Emphasize

1. **Change Detection ≠ Checking for Changes**
   - It's about synchronizing state with UI efficiently

2. **Zone.js is a Notifier, Not a Detector**
   - It tells Angular when to run CD, but doesn't perform CD itself

3. **NG100 Exists for a Reason**
   - Prevents infinite loops by enforcing unidirectional flow

4. **Signals Enable Bi-directional Flow**
   - Through controlled re-checks within the synchronization loop

5. **Zoneless is the Future**
   - Pure reactive synchronization without Zone.js overhead

## Technical Depth

This presentation goes deep into Angular internals:
- LView structure
- Reactive nodes and dependency graphs
- markViewDirty algorithm
- ApplicationRef.synchronize() loop
- Signal propagation
- Change detection scheduling

Perfect for audiences who want to truly understand how Angular works under the hood!
