# Quick Reference - Angular Change Detection Architecture

## Key Concepts

### LView (Logical View)
- Data structure representing a component internally
- Contains: DOM references, component instance, oldValues array
- One-to-one relationship with component

### Bindings
- Maps component properties to DOM element properties
- Defines: property name + expression to evaluate
- Created by Angular compiler during template analysis

### Dirty Checking
- Compare current value to oldValue stored in LView
- If different → update DOM + update oldValues
- Name comes from "checking if data is dirty (changed)"

### Zone.js
- **NOT** change detection itself
- Patches async APIs (setTimeout, Promise, addEventListener, etc.)
- Emits `onMicrotaskEmpty` event
- ApplicationRef.tick() does actual change detection

### Unidirectional Data Flow
- Data flows parent → child only
- Parent checked before children
- Once checked, component properties must stay stable
- Prevents infinite loops

### NG100 Error
- ExpressionChangedAfterItHasBeenCheckedError
- Thrown in dev mode when values change after being checked
- Enforcement mechanism for unidirectional flow
- Prevents infinite change detection loops

### Change Detection Strategies

#### Default (CheckAlways)
- Checked every CD cycle
- Simple but potentially wasteful

#### OnPush (CheckOnce)
- Skipped unless marked dirty
- Made dirty by:
  - @Input reference change
  - markForCheck() called
  - Template event fired
  - async pipe emission
  - ComponentRef.setInput()

### Signals

#### Core Properties
- **Automatic tracking**: Dependencies tracked during reads
- **Lazy computed**: Only recompute when read
- **Glitch-free**: Consistent state within tick
- **Fine-grained**: Only affected consumers notified

#### Reactive Graph
```
Signal (Producer) ←→ Computed/Effect (Consumer)
  ↓ liveConsumerNode
  ↑ producerNode
```

#### Active Consumer Pattern
1. Set global activeConsumer
2. Run consumer's callback
3. Producer reads see activeConsumer
4. Link nodes bidirectionally

### Change Detection Modes

#### Global Mode (Zone.js)
- Checks CheckAlways + Dirty flags
- Full tree traversal
- Any async event → entire tree

#### Targeted Mode (Signals)
- Only checks RefreshView flag
- Traverses HasChildViewsToRefresh
- Skips unaffected subtrees
- signal.set() → minimal path

### synchronize() Loop (v18+)
```typescript
while (dirtyFlags !== None && runs++ < 10) {
  1. Run effects
  2. Refresh views (CD)
  3. Run render hooks
}
```

Allows controlled re-checks for Signals!

### Zoneless Change Detection

#### Triggers CD:
- ✅ signal.set/update
- ✅ markForCheck()
- ✅ ComponentRef.setInput()
- ✅ Template events
- ✅ async pipe

#### No Longer Triggers:
- ❌ setTimeout/setInterval
- ❌ Promise.then
- ❌ addEventListener (direct)
- ❌ XMLHttpRequest

### Key Internal Functions

- `refreshView()` - Actually performs CD for a view
- `detectChangesInView()` - Decides if view should refresh
- `markViewDirty()` - Sets Dirty flag, bubbles up, notifies scheduler
- `markAncestorsForTraversal()` - Signals variant, sets RefreshView
- `property()` - Ivy instruction for property bindings
- `bindingUpdated()` - Dirty checking implementation
- `consumerPollProducersForChange()` - Check signal dependencies

## How Signals Solve NG100

**Problem**: Child updates parent during CD → NG100

**Solution**: 
1. Signal.set() marks component dirty
2. synchronize() loop detects dirty views
3. Loop re-runs (up to 10 times)
4. Values stabilize without error

**Why it works**: Controlled bi-directional flow within the loop, not uncontrolled changes across cycles.

## Hybrid Mode (v18+)

Signal changes ALWAYS schedule CD, even outside Angular zone:
```typescript
zone.runOutsideAngular(() => {
  signal.set(value); // Now schedules CD! ✨
});
```

No more execution context dependency!
