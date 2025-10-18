import React, { useState } from 'react';
import { ChevronRight, ChevronLeft, Zap, AlertTriangle } from 'lucide-react';

const Presentation = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      title: "Angular Change Detection",
      subtitle: "From Zone.js to Signals: The Complete Architecture",
      content: (
        <div className="space-y-8 flex flex-col justify-center h-full">
          <div className="text-7xl font-bold bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent text-center">
            UI = fn(state)
          </div>
          <div className="space-y-6 text-2xl">
            <div className="flex items-center gap-4">
              <Zap className="text-yellow-500" size={32} />
              <span>React: vDOM = fn(state)</span>
            </div>
            <div className="flex items-center gap-4">
              <Zap className="text-red-500" size={32} />
              <span>Angular: deltaUI = fn(deltaState)</span>
            </div>
          </div>
          <p className="text-2xl text-gray-400 text-center mt-12">
            The evolution from dirty checking to reactive synchronization
          </p>
        </div>
      )
    },
    {
      title: "Web Development 101",
      subtitle: "The Manual Era",
      content: (
        <div className="space-y-8">
          <div className="bg-gray-900 p-6 rounded-lg font-mono text-base overflow-x-auto">
            <div className="text-green-400 text-lg mb-3">// Plain JavaScript - Manual CD</div>
            <pre className="text-white">
{`let textContent = 'Initial';

function render() {
  el.textContent = textContent;
}

function changeDetection() {
  if (el.textContent !== textContent) {
    el.textContent = textContent;
  }
}`}
            </pre>
          </div>
          <div className="text-yellow-400 flex items-start gap-4 text-xl">
            <AlertTriangle className="mt-1 flex-shrink-0" size={28} />
            <div>
              <p className="font-semibold">The setTimeout Problem</p>
              <p className="text-gray-400 text-lg">Asynchronous changes do not trigger detection automatically</p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Component Views and Bindings",
      subtitle: "The Foundation of Angular Architecture",
      content: (
        <div className="space-y-8">
          <div className="bg-gray-900 p-6 rounded-lg">
            <h3 className="text-2xl font-semibold mb-6 text-blue-400">Two Building Blocks</h3>
            <div className="space-y-6">
              <div className="border-l-4 border-green-500 pl-6">
                <p className="font-semibold text-green-400 text-xl">Component View (LView)</p>
                <p className="text-lg text-gray-400">Container for DOM references, component instance, and oldValues array</p>
              </div>
              <div className="border-l-4 border-purple-500 pl-6">
                <p className="font-semibold text-purple-400 text-xl">Associated Bindings</p>
                <p className="text-lg text-gray-400">Maps component properties to DOM element properties</p>
              </div>
            </div>
          </div>
          <div className="bg-gray-900 p-6 rounded-lg font-mono text-base overflow-x-auto">
            <div className="text-green-400 text-lg mb-3">// Binding Structure</div>
            <pre className="text-white">
{`binding = {
  name: 'textContent',
  expression: 'time | date',
  oldValue: stored_in_LView
}`}
            </pre>
          </div>
        </div>
      )
    },
    {
      title: "The Ivy Instructions - Part 1",
      subtitle: "How Templates Become Change Detection Code",
      content: (
        <div className="space-y-8">
          <div className="bg-gray-900 p-6 rounded-lg font-mono text-base overflow-x-auto">
            <div className="text-green-400 text-lg mb-3">// Template to compiled code</div>
            <pre className="text-white">
{`// Template: 
[className]="'fa-star ' + (rating > 0 ? 'fas' : 'far')"

// Compiled to:
if (changeDetectionPhase) {
  property("className", 
    "fa-star " + (ctx.rating > 0 ? "fas" : "far")
  );
}`}
            </pre>
          </div>
          <p className="text-gray-300 text-2xl bg-gray-800 p-6 rounded-lg">
            This is <strong className="text-yellow-400">dirty checking</strong> at its core: compare oldValue to update if different
          </p>
        </div>
      )
    },
    {
      title: "The Ivy Instructions - Part 2",
      subtitle: "The property() Implementation",
      content: (
        <div className="space-y-6">
          <div className="bg-gray-900 p-6 rounded-lg font-mono text-base overflow-x-auto">
            <div className="text-green-400 text-lg mb-3">// property implementation</div>
            <pre className="text-white">
{`export function property(propName, value) {
  const lView = getLView();
  const bindingIndex = nextBindingIndex();
  
  if (bindingUpdated(lView, bindingIndex, value)) {
    elementPropertyInternal(..., propName, value);
  }
  
  return property; // chainable
}`}
            </pre>
          </div>
          <div className="space-y-4 text-lg text-gray-300 bg-gray-800 p-6 rounded-lg">
            <p><strong className="text-blue-400 text-xl">Key Steps:</strong></p>
            <ol className="list-decimal list-inside space-y-3 ml-4">
              <li>Get the current LView (component data)</li>
              <li>Get the binding index for this property</li>
              <li>Check if value changed (dirty check)</li>
              <li>If changed, update DOM via elementPropertyInternal</li>
              <li>Return self for chaining</li>
            </ol>
          </div>
        </div>
      )
    },
    {
      title: "Zone.js - The Notification System",
      subtitle: "Intercepting Async Operations",
      content: (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-blue-900 to-purple-900 p-6 rounded-lg">
            <h3 className="text-2xl font-semibold mb-4">Zone.js is not Change Detection</h3>
            <p className="text-gray-300 text-xl">Zone.js is a <strong>notifier</strong>, not the detector</p>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-gray-900 p-6 rounded-lg">
              <h4 className="font-semibold text-green-400 mb-4 text-xl">What Zone.js Does</h4>
              <ul className="text-lg space-y-2 text-gray-300">
                <li>• Patches async APIs</li>
                <li>• Tracks microtask queue</li>
                <li>• Emits onMicrotaskEmpty</li>
                <li>• Notifies ApplicationRef</li>
              </ul>
            </div>
            <div className="bg-gray-900 p-6 rounded-lg">
              <h4 className="font-semibold text-red-400 mb-4 text-xl">What Zone.js Does Not Do</h4>
              <ul className="text-lg space-y-2 text-gray-300">
                <li>• Run change detection</li>
                <li>• Know what changed</li>
                <li>• Update the DOM</li>
                <li>• Track dependencies</li>
              </ul>
            </div>
          </div>
          <div className="bg-gray-900 p-6 rounded-lg font-mono text-base overflow-x-auto">
            <div className="text-green-400 text-lg mb-3">// Inside ApplicationRef</div>
            <pre className="text-white">
{`this._zone.onMicrotaskEmpty.subscribe({
  next: () => {
    this._zone.run(() => {
      this.tick(); // Actual CD happens here
    });
  }
});`}
            </pre>
          </div>
        </div>
      )
    },
    {
      title: "The Unidirectional Data Flow",
      subtitle: "Why Angular Checks Top-Down",
      content: (
        <div className="space-y-6">
          <div className="bg-gray-900 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-4 text-blue-400">The Invariant Problem</h3>
            <div className="bg-gray-800 p-4 rounded font-mono text-sm">
              <pre className="text-white">
{`@if (user) {
  {{ user.name }}
}`}
              </pre>
            </div>
            <p className="mt-4 text-gray-300">
              If we check user.name before checking the @if, we crash when user becomes undefined.
            </p>
            <p className="mt-2 text-red-400 font-semibold">
              Parents must run first to enforce invariants on children
            </p>
          </div>
          <div className="bg-gray-900 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-3 text-green-400">Change Detection Order</h3>
            <div className="space-y-2 text-sm font-mono">
              <div>1. Update @Input bindings on child</div>
              <div>2. Call OnInit, DoCheck, OnChanges on child</div>
              <div>3. Render parent template</div>
              <div>4. Run CD for child (recursive)</div>
              <div>5. Call AfterViewInit, AfterViewChecked on child</div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "NG0100 - ExpressionChanged Error",
      subtitle: "The Enforcement Mechanism",
      content: (
        <div className="space-y-6">
          <div className="bg-red-900 bg-opacity-30 border border-red-500 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-4 text-red-400">The Two-Phase Check</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <span className="text-green-400 font-bold">Phase 1:</span>
                <span>Run change detection, update DOM, store values in oldValues</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-purple-400 font-bold">Phase 2:</span>
                <span>Run again (dev mode), compare to oldValues, throw if different</span>
              </div>
            </div>
          </div>
          <div className="bg-gray-900 p-6 rounded-lg font-mono text-xs overflow-x-auto">
            <div className="text-green-400">// Why the check exists</div>
            <pre className="mt-2 text-gray-300">
{`Without it, Angular could enter an infinite loop:

CD Run 1: value = A, update DOM
Lifecycle hook: value = B
CD Run 2: value = B, update DOM
Lifecycle hook: value = C
CD Run 3: value = C, update DOM
... infinite loop ...`}
            </pre>
          </div>
          <div className="bg-gray-900 p-6 rounded-lg">
            <h4 className="font-semibold text-yellow-400 mb-2">The Rule</h4>
            <p className="text-gray-300">
              Once Angular processes bindings for a component, you cannot update properties 
              used in those bindings until the next CD cycle.
            </p>
          </div>
        </div>
      )
    },
    {
      title: "OnPush Strategy",
      subtitle: "From Global to Selective Checking",
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-900 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-400 mb-3">Default (CheckAlways)</h4>
              <ul className="text-sm space-y-2 text-gray-300">
                <li>✓ Checks every CD cycle</li>
                <li>✓ Simple to reason about</li>
                <li>✗ Redundant checks</li>
                <li>✗ Does not scale</li>
              </ul>
            </div>
            <div className="bg-gray-900 p-4 rounded-lg">
              <h4 className="font-semibold text-purple-400 mb-3">OnPush (CheckOnce)</h4>
              <ul className="text-sm space-y-2 text-gray-300">
                <li>✓ Skips if not dirty</li>
                <li>✓ Scales with changes</li>
                <li>✗ Requires discipline</li>
                <li>✗ Easy to break</li>
              </ul>
            </div>
          </div>
          <div className="bg-gray-900 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-3 text-green-400">What Makes OnPush Dirty?</h3>
            <div className="space-y-2 text-sm">
              <div>• @Input reference change</div>
              <div>• markForCheck called</div>
              <div>• Template-bound event fires</div>
              <div>• async pipe emits</div>
              <div>• ComponentRef.setInput</div>
            </div>
          </div>
          <div className="bg-yellow-900 bg-opacity-30 border border-yellow-500 p-4 rounded-lg">
            <p className="text-sm text-yellow-200">
              <strong>Key Insight:</strong> OnPush does not prevent checking—it requires explicit dirtiness. 
              The Dirty flag is automatically unset after the first check.
            </p>
          </div>
        </div>
      )
    },
    {
      title: "markViewDirty - The Dirtiness Algorithm",
      subtitle: "How Dirtiness Bubbles Up",
      content: (
        <div className="space-y-6">
          <div className="bg-gray-900 p-6 rounded-lg font-mono text-sm overflow-x-auto">
            <div className="text-green-400 text-lg mb-3">// mark_view_dirty.ts</div>
            <pre className="text-white">
{`export function markViewDirty(lView: LView, source: NotificationSource) {
  // v18+: Notify the scheduler
  lView[ENVIRONMENT].changeDetectionScheduler?.notify(source);
  
  // Mark current view and bubble up
  while (lView) {
    lView[FLAGS] |= LViewFlags.Dirty | LViewFlags.RefreshView;
    const parent = getLViewParent(lView);
    if (isRootView(lView) && !parent) {
      return lView;
    }
    lView = parent;
  }
}`}
            </pre>
          </div>
          <div className="bg-blue-900 bg-opacity-30 border border-blue-500 p-6 rounded-lg">
            <h4 className="font-semibold text-blue-400 mb-3 text-xl">Why Bubble Up?</h4>
            <p className="text-lg text-gray-300">
              Angular traverses top-down. If only the child is marked dirty, the parent might skip its subtree. 
              By marking all ancestors, we ensure the dirty component is reached during traversal.
            </p>
          </div>
        </div>
      )
    },
    {
      title: "The Synchronization Loop",
      subtitle: "How ApplicationRef.tick Actually Works",
      content: (
        <div className="space-y-6">
          <div className="bg-gray-900 p-6 rounded-lg font-mono text-xs overflow-x-auto">
            <div className="text-green-400">// Simplified ApplicationRef.synchronize</div>
            <pre className="mt-2 text-white">
{`private synchronize() {
  let runs = 0;
  while (
    this.dirtyFlags !== ApplicationRefDirtyFlags.None &&
    runs++ < MAXIMUM_REFRESH_RERUNS
  ) {
    this.synchronizeOnce();
  }
  
  if (runs >= MAXIMUM_REFRESH_RERUNS) {
    throw 'Infinite change detection';
  }
}`}
            </pre>
          </div>
          <div className="bg-gray-900 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-3 text-purple-400">The Loop Flow</h3>
            <div className="space-y-2 text-sm">
              <div>1. Check if dirtyFlags indicate work needed</div>
              <div>2. Run synchronizeOnce (effects then views then render hooks)</div>
              <div>3. If views are still dirty after checking, loop back (max 10 times)</div>
              <div>4. This allows Signals to re-mark components during CD</div>
            </div>
          </div>
          <div className="bg-green-900 bg-opacity-30 border border-green-500 p-4 rounded-lg">
            <p className="text-sm text-green-200">
              <strong>Signals Era:</strong> Unlike Zone.js era where NG0100 would throw, 
              Signals can legitimately mark views dirty during CD, and the loop handles it gracefully.
            </p>
          </div>
        </div>
      )
    },
    {
      title: "Signals - The Reactive Graph",
      subtitle: "From Push Notifications to Pull-Based Computation",
      content: (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-purple-900 to-pink-900 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-4">The Paradigm Shift</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-semibold text-red-400 mb-2">Zone.js Era</p>
                <p className="text-gray-300">Something happened, check everything</p>
              </div>
              <div>
                <p className="font-semibold text-green-400 mb-2">Signals Era</p>
                <p className="text-gray-300">This specific thing changed, update only dependents</p>
              </div>
            </div>
          </div>
          <div className="bg-gray-900 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-3 text-blue-400">Dependency Tracking</h3>
            <div className="bg-gray-800 p-4 rounded font-mono text-xs overflow-x-auto">
              <pre className="text-white">
{`const counter = signal(0);
const isEven = computed(() => counter() % 2 === 0);

// Template reads isEven creates reactive consumer
// consumer tracks: isEven to counter`}
              </pre>
            </div>
          </div>
          <div className="bg-gray-900 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-3 text-purple-400">Active Consumer Pattern</h3>
            <p className="text-sm text-gray-300 mb-3">
              When a computed is evaluated, it becomes the active consumer. 
              Any signal read during evaluation registers itself as a dependency.
            </p>
            <div className="space-y-2 text-xs">
              <div>1. Set activeConsumer = isEven</div>
              <div>2. Run computed callback</div>
              <div>3. counter reads signal sees activeConsumer</div>
              <div>4. counter adds itself to isEven.producerNode</div>
              <div>5. isEven adds itself to counter.liveConsumerNode</div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Signals + OnPush = Local Change Detection",
      subtitle: "Fine-Grained Reactivity Without Zone.js",
      content: (
        <div className="space-y-6">
          <div className="bg-gray-900 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-3 text-green-400">markAncestorsForTraversal</h3>
            <p className="text-sm text-gray-300 mb-3">
              When a signal changes, it does not mark the component as Dirty. 
              Instead, it marks it as RefreshView and ancestors as HasChildViewsToRefresh.
            </p>
            <div className="bg-gray-800 p-4 rounded text-xs overflow-x-auto">
              <pre className="text-white">
{`// Traditional markViewDirty
Parent: Dirty | RefreshView
Child: Dirty | RefreshView

// Signal-based marking
Parent: HasChildViewsToRefresh
Child: RefreshView (reactive consumer dirty)`}
              </pre>
            </div>
          </div>
          <div className="bg-blue-900 bg-opacity-30 border border-blue-500 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-400 mb-2">Why This Matters</h4>
            <p className="text-sm text-gray-300">
              Only the component with the signal binding is checked. 
              Parent components are traversed but not checked unless they are also dirty. 
              This is semi-local or glocal change detection.
            </p>
          </div>
        </div>
      )
    },
    {
      title: "Zoneless Change Detection",
      subtitle: "The Final Form",
      content: (
        <div className="space-y-6">
          <div className="bg-gray-900 p-6 rounded-lg font-mono text-xs overflow-x-auto">
            <div className="text-green-400">// provideZonelessChangeDetection</div>
            <pre className="mt-2 text-white">
{`export function provideZonelessChangeDetection() {
  return makeEnvironmentProviders([
    { provide: ChangeDetectionScheduler,
      useExisting: ChangeDetectionSchedulerImpl },
    { provide: NgZone, useClass: NoopNgZone }
  ]);
}`}
            </pre>
          </div>
          <div className="bg-gray-900 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-3 text-purple-400">What Triggers CD in Zoneless?</h3>
            <div className="space-y-2 text-sm">
              <div>✓ signal.set / signal.update</div>
              <div>✓ markForCheck</div>
              <div>✓ ComponentRef.setInput</div>
              <div>✓ Template event listeners</div>
              <div>✓ Async pipe emissions</div>
              <div className="text-red-400">✗ setTimeout, setInterval (no Zone.js)</div>
              <div className="text-red-400">✗ Promise.then (no Zone.js)</div>
            </div>
          </div>
          <div className="bg-purple-900 bg-opacity-30 border border-purple-500 p-4 rounded-lg">
            <p className="text-sm text-purple-200">
              <strong>The Future:</strong> No more Zone.js overhead. Change detection only runs when 
              the framework explicitly knows something changed. Pure reactive synchronization.
            </p>
          </div>
        </div>
      )
    },
    {
      title: "Hybrid Mode (v18+)",
      subtitle: "The Best of Both Worlds",
      content: (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-blue-900 to-green-900 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-4">Zone.js + Signals Together</h3>
            <p className="text-gray-300">Angular v18 introduced hybrid mode where both systems coexist</p>
          </div>
          <div className="bg-gray-900 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-3 text-green-400">The Problem It Solves</h3>
            <div className="bg-gray-800 p-4 rounded font-mono text-xs overflow-x-auto">
              <pre className="text-white">
{`// Before v18: This would NOT trigger CD
zone.runOutsideAngular(() => {
  setTimeout(() => {
    mySignal.set(newValue); // Signal updated but no CD!
  }, 1000);
});

// v18+: Signal.set now schedules CD regardless of zone context`}
              </pre>
            </div>
          </div>
          <div className="bg-gray-900 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-3 text-blue-400">shouldScheduleTick Logic</h3>
            <div className="space-y-3 text-sm">
              <div>
                <strong className="text-purple-400">Mode 1: Pure Zoneless</strong>
                <p className="text-gray-400 ml-4">Scheduler always handles CD</p>
              </div>
              <div>
                <strong className="text-yellow-400">Mode 2: Pure Zone.js</strong>
                <p className="text-gray-400 ml-4">Inside Angular Zone: Zone.js handles it</p>
              </div>
              <div>
                <strong className="text-green-400">Mode 3: Hybrid</strong>
                <p className="text-gray-400 ml-4">Outside Angular Zone: Scheduler handles it</p>
              </div>
            </div>
          </div>
          <div className="bg-green-900 bg-opacity-30 border border-green-500 p-4 rounded-lg">
            <p className="text-sm text-green-200">
              <strong>Key Insight:</strong> signal.set and markForCheck now ALWAYS schedule CD, 
              even outside the Angular zone. Execution context no longer matters.
            </p>
          </div>
        </div>
      )
    },
    {
      title: "detectChanges - Local Change Detection",
      subtitle: "Running CD for a Specific Subtree",
      content: (
        <div className="space-y-6">
          <div className="bg-gray-900 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-3 text-blue-400">What is detectChanges?</h3>
            <p className="text-sm text-gray-300 mb-3">
              A method on ChangeDetectorRef that runs change detection for a specific component and its children only
            </p>
          </div>
          <div className="bg-gray-900 p-6 rounded-lg font-mono text-xs overflow-x-auto">
            <div className="text-green-400">// ViewRef implementation</div>
            <pre className="mt-2 text-white">
{`export class ViewRef implements ChangeDetectorRef {
  constructor(public _lView: LView) {}
  
  detectChanges() {
    detectChangesInternal(this._lView[TVIEW], this._lView, ...);
  }
}

// Under the hood
export function detectChangesInternal(tView, lView, context) {
  try {
    refreshView(tView, lView, ...);
  } catch (error) { ... }
}`}
            </pre>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-green-900 bg-opacity-30 border border-green-500 p-4 rounded-lg">
              <h4 className="font-semibold text-green-400 mb-2">Use Cases</h4>
              <ul className="text-xs space-y-1">
                <li>• Manual CD after async operations</li>
                <li>• Third-party library integration</li>
                <li>• Optimizing specific subtrees</li>
              </ul>
            </div>
            <div className="bg-yellow-900 bg-opacity-30 border border-yellow-500 p-4 rounded-lg">
              <h4 className="font-semibold text-yellow-400 mb-2">Gotcha: ngDoCheck</h4>
              <p className="text-xs text-gray-300">
                ngDoCheck is NOT called on the component you call detectChanges on - only on its children
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "markForCheck - The Dirty Flag API",
      subtitle: "Requesting Change Detection Without Running It",
      content: (
        <div className="space-y-6">
          <div className="bg-red-900 bg-opacity-30 border border-red-500 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-4 text-red-400">Critical Distinction</h3>
            <p className="text-gray-300">
              <strong>markForCheck() does NOT trigger change detection</strong>
            </p>
            <p className="text-sm text-gray-400 mt-2">
              It only marks the component and ancestors as dirty. CD must be scheduled separately.
            </p>
          </div>
          <div className="bg-gray-900 p-6 rounded-lg font-mono text-xs overflow-x-auto">
            <div className="text-green-400">// Typical usage with OnPush</div>
            <pre className="mt-2 text-white">
{`@Component({
  selector: 'my-component',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MyComponent {
  private cdr = inject(ChangeDetectorRef);
  
  constructor() {
    someService.data$.subscribe(data => {
      this.data = data;
      this.cdr.markForCheck(); // Mark dirty
      // CD will run on next Zone.js tick or scheduler notify
    });
  }
}`}
            </pre>
          </div>
          <div className="bg-gray-900 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-3 text-purple-400">What markForCheck Actually Does</h3>
            <div className="space-y-2 text-sm">
              <div>1. Sets LViewFlags.Dirty on current component</div>
              <div>2. Walks up the tree setting RefreshView on ancestors</div>
              <div>3. Stops at root or a non-OnPush ancestor</div>
              <div>4. Does NOT call ApplicationRef.tick()</div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "AsyncPipe - The OnPush Enabler",
      subtitle: "Automatic markForCheck on Observable Emissions",
      content: (
        <div className="space-y-6">
          <div className="bg-gray-900 p-6 rounded-lg font-mono text-xs overflow-x-auto">
            <div className="text-green-400">// AsyncPipe implementation (simplified)</div>
            <pre className="mt-2 text-white">
{`export class AsyncPipe {
  private _latestValue: any = null;
  private _subscription: Subscription | null = null;
  
  transform(obj: Observable<any>) {
    if (!this._subscription) {
      this._subscription = obj.subscribe({
        next: (value) => {
          this._latestValue = value;
          this._ref.markForCheck(); // Key line!
        }
      });
    }
    return this._latestValue;
  }
}`}
            </pre>
          </div>
          <div className="bg-blue-900 bg-opacity-30 border border-blue-500 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-400 mb-2">Why AsyncPipe Works with OnPush</h4>
            <p className="text-sm text-gray-300">
              Every emission calls markForCheck, ensuring the component is checked 
              even if it uses OnPush strategy and the input references haven't changed
            </p>
          </div>
          <div className="bg-yellow-900 bg-opacity-30 border border-yellow-500 p-4 rounded-lg">
            <h4 className="font-semibold text-yellow-400 mb-2">Important Note</h4>
            <p className="text-sm text-gray-300">
              AsyncPipe does NOT compare values. It marks for check on EVERY emission, 
              even if the value is identical to the previous one.
            </p>
          </div>
        </div>
      )
    },
    {
      title: "The Problem - Bi-directional Flow",
      subtitle: "When Child Updates Parent During CD",
      content: (
        <div className="space-y-6">
          <div className="bg-red-900 bg-opacity-40 border-2 border-red-500 p-6 rounded-lg">
            <h3 className="text-2xl font-bold mb-4 text-red-400">The NG100 Trap</h3>
            <p className="text-gray-300">
              Child component updates parent state during its lifecycle hooks, 
              breaking Angular's unidirectional data flow assumption
            </p>
          </div>
          <div className="bg-gray-900 p-6 rounded-lg font-mono text-xs overflow-x-auto">
            <div className="text-red-400">// This will throw NG100</div>
            <pre className="mt-2 text-white">
{`// Parent
@Component({
  template: \`<child [data]="parentData"></child>
              <div>{{ parentData }}</div>\`
})
export class Parent {
  parentData = 'initial';
}

// Child
@Component({ selector: 'child' })
export class Child implements AfterViewInit {
  @Input() data;
  @Output() update = new EventEmitter();
  
  ngAfterViewInit() {
    // This runs DURING parent's CD cycle
    this.update.emit('changed'); // Parent updates parentData
    // NG100: parentData changed after being checked!
  }
}`}
            </pre>
          </div>
          <div className="bg-gray-900 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-3 text-yellow-400">Why This Happens</h3>
            <div className="space-y-2 text-sm text-gray-300">
              <div>1. Angular checks parent, reads parentData = 'initial'</div>
              <div>2. Angular updates child @Input binding</div>
              <div>3. Child's AfterViewInit runs, emits event</div>
              <div>4. Parent updates parentData = 'changed'</div>
              <div>5. Dev mode check runs: parentData !== 'initial' → NG100!</div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Traditional Solutions to NG100",
      subtitle: "Working Around Unidirectional Flow",
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-900 p-4 rounded-lg">
              <h4 className="font-semibold text-green-400 mb-3">Solution 1: setTimeout</h4>
              <div className="bg-gray-800 p-3 rounded font-mono text-xs overflow-x-auto">
                <pre className="text-white">
{`ngAfterViewInit() {
  setTimeout(() => {
    this.update.emit('changed');
  }, 0);
}`}
                </pre>
              </div>
              <p className="text-xs text-gray-400 mt-2">
                Defers update to next CD cycle via macro task
              </p>
            </div>
            <div className="bg-gray-900 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-400 mb-3">Solution 2: Promise</h4>
              <div className="bg-gray-800 p-3 rounded font-mono text-xs overflow-x-auto">
                <pre className="text-white">
{`ngAfterViewInit() {
  Promise.resolve().then(() => {
    this.update.emit('changed');
  });
}`}
                </pre>
              </div>
              <p className="text-xs text-gray-400 mt-2">
                Defers update via microtask queue
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-900 p-4 rounded-lg">
              <h4 className="font-semibold text-purple-400 mb-3">Solution 3: ChangeDetectorRef</h4>
              <div className="bg-gray-800 p-3 rounded font-mono text-xs overflow-x-auto">
                <pre className="text-white">
{`ngAfterViewInit() {
  this.update.emit('changed');
  this.cdr.detectChanges();
}`}
                </pre>
              </div>
              <p className="text-xs text-gray-400 mt-2">
                Manually run CD for parent subtree
              </p>
            </div>
            <div className="bg-gray-900 p-4 rounded-lg">
              <h4 className="font-semibold text-yellow-400 mb-3">Solution 4: Redesign</h4>
              <div className="bg-gray-800 p-3 rounded font-mono text-xs overflow-x-auto">
                <pre className="text-white">
{`// Move state up or
// use service for
// shared state`}
                </pre>
              </div>
              <p className="text-xs text-gray-400 mt-2">
                Respect unidirectional flow by design
              </p>
            </div>
          </div>
          <div className="bg-red-900 bg-opacity-30 border border-red-500 p-4 rounded-lg">
            <p className="text-sm text-red-200">
              <strong>Problem:</strong> All workarounds are manual, error-prone, or sacrifice performance
            </p>
          </div>
        </div>
      )
    },
    {
      title: "Signals - The Reactive Primitive",
      subtitle: "Fine-Grained Reactivity with Automatic Tracking",
      content: (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-green-900 to-blue-900 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-4">The Signal Contract</h3>
            <p className="text-gray-300">
              Signals are reactive values that track their consumers and notify them automatically when changed
            </p>
          </div>
          <div className="bg-gray-900 p-6 rounded-lg font-mono text-xs overflow-x-auto">
            <div className="text-green-400">// Signal basics</div>
            <pre className="mt-2 text-white">
{`// Create a signal
const count = signal(0);

// Read a signal (tracks dependency)
console.log(count()); // 0

// Update a signal (notifies consumers)
count.set(1);
count.update(c => c + 1);

// Computed signals (lazy evaluation)
const doubled = computed(() => count() * 2);

// Effects (side effects)
effect(() => {
  console.log('Count is:', count());
});`}
            </pre>
          </div>
          <div className="bg-gray-900 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-3 text-purple-400">Key Properties</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="border-l-4 border-green-500 pl-3">
                <strong className="text-green-400">Automatic Tracking</strong>
                <p className="text-xs text-gray-400">Dependencies tracked during read</p>
              </div>
              <div className="border-l-4 border-blue-500 pl-3">
                <strong className="text-blue-400">Lazy Computed</strong>
                <p className="text-xs text-gray-400">Only recompute when read</p>
              </div>
              <div className="border-l-4 border-purple-500 pl-3">
                <strong className="text-purple-400">Glitch-Free</strong>
                <p className="text-xs text-gray-400">Consistent state within one tick</p>
              </div>
              <div className="border-l-4 border-pink-500 pl-3">
                <strong className="text-pink-400">Fine-Grained</strong>
                <p className="text-xs text-gray-400">Only affected consumers notified</p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "The Reactive Graph",
      subtitle: "Producer-Consumer Dependency Tracking",
      content: (
        <div className="space-y-6">
          <div className="bg-gray-900 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-3 text-blue-400">Reactive Node Structure</h3>
            <div className="bg-gray-800 p-4 rounded font-mono text-xs overflow-x-auto">
              <pre className="text-white">
{`interface ReactiveNode {
  producerNode: ReactiveNode[];      // My dependencies
  liveConsumerNode: ReactiveNode[];  // Who depends on me
  dirty: boolean;                    // Need recomputation?
  consumerAllowSignalWrites: boolean;
}`}
              </pre>
            </div>
          </div>
          <div className="bg-gray-900 p-6 rounded-lg font-mono text-xs overflow-x-auto">
            <div className="text-green-400">// Tracking example</div>
            <pre className="mt-2 text-white">
{`const firstName = signal('John');
const lastName = signal('Doe');
const fullName = computed(() => \`\${firstName()} \${lastName()}\`);

// Graph after evaluation:
//        fullName (consumer)
//          /           \\
//   firstName      lastName
//  (producer)      (producer)

firstName.liveConsumerNode = [fullName];
lastName.liveConsumerNode = [fullName];
fullName.producerNode = [firstName, lastName];`}
            </pre>
          </div>
          <div className="bg-gray-900 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-3 text-purple-400">Active Consumer Pattern</h3>
            <div className="space-y-2 text-sm text-gray-300">
              <div>1. Set global activeConsumer = fullName</div>
              <div>2. Run fullName's callback</div>
              <div>3. firstName() reads → sees activeConsumer → links nodes</div>
              <div>4. lastName() reads → sees activeConsumer → links nodes</div>
              <div>5. Clear activeConsumer</div>
              <div>6. Graph is now connected!</div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Signal.set → markAncestorsForTraversal",
      subtitle: "How Signals Schedule Change Detection",
      content: (
        <div className="space-y-6">
          <div className="bg-gray-900 p-6 rounded-lg font-mono text-xs overflow-x-auto">
            <div className="text-green-400">// signal_impl.ts</div>
            <pre className="mt-2 text-white">
{`export function signalSetFn(node: SignalNode, newValue: T) {
  if (!node.equal(node.value, newValue)) {
    node.value = newValue;
    node.version++; // Increment version
    
    // Propagate dirty flag to consumers
    signalValueChanged(node);
  }
}

function signalValueChanged(node: ReactiveNode) {
  node.version++;
  
  // Mark all consumers as dirty
  for (const consumer of node.liveConsumerNode) {
    consumerMarkDirty(consumer);
  }
  
  // If any consumer is a component, schedule CD
  producerNotifyConsumers(node);
}`}
            </pre>
          </div>
          <div className="bg-gray-900 p-6 rounded-lg font-mono text-xs overflow-x-auto">
            <div className="text-green-400">// mark_view_dirty_from_signal.ts</div>
            <pre className="mt-2 text-white">
{`export function markAncestorsForTraversal(lView: LView) {
  let parent = lView;
  
  while (parent !== null) {
    // Mark for traversal, NOT as fully dirty
    parent[FLAGS] |= LViewFlags.RefreshView;
    
    // Mark parent as having dirty children
    if (parent[PARENT]) {
      parent[PARENT][FLAGS] |= LViewFlags.HasChildViewsToRefresh;
    }
    
    parent = parent[PARENT];
  }
  
  // Notify scheduler
  lView[ENVIRONMENT].changeDetectionScheduler?.notify(
    NotificationSource.SetInput
  );
}`}
            </pre>
          </div>
        </div>
      )
    },
    {
      title: "Global vs Targeted CD Mode",
      subtitle: "How Signals Enable Surgical Updates",
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-900 p-4 rounded-lg">
              <h4 className="font-semibold text-red-400 mb-3">Global Mode (Default/Zone.js)</h4>
              <div className="space-y-2 text-xs">
                <div className="text-gray-300">• Checks CheckAlways components</div>
                <div className="text-gray-300">• Checks Dirty components</div>
                <div className="text-gray-300">• Full tree traversal</div>
                <div className="text-yellow-400 mt-2">Zone.js event → entire tree checked</div>
              </div>
            </div>
            <div className="bg-gray-900 p-4 rounded-lg">
              <h4 className="font-semibold text-green-400 mb-3">Targeted Mode (Signals)</h4>
              <div className="space-y-2 text-xs">
                <div className="text-gray-300">• Only checks RefreshView</div>
                <div className="text-gray-300">• Traverses HasChildViewsToRefresh</div>
                <div className="text-gray-300">• Skips unaffected subtrees</div>
                <div className="text-green-400 mt-2">Signal change → minimal path checked</div>
              </div>
            </div>
          </div>
          <div className="bg-gray-900 p-6 rounded-lg font-mono text-xs overflow-x-auto">
            <div className="text-green-400">// detectChangesInView logic</div>
            <pre className="mt-2 text-white">
{`function detectChangesInView(lView: LView, mode: ChangeDetectionMode) {
  const flags = lView[FLAGS];
  
  let shouldRefreshView = !!(
    flags & (LViewFlags.CheckAlways | LViewFlags.Dirty) &&
    mode === ChangeDetectionMode.Global
  ) || !!(
    flags & LViewFlags.RefreshView &&
    mode === ChangeDetectionMode.Targeted
  );
  
  // Check if signal consumer is dirty
  const consumer = lView[REACTIVE_TEMPLATE_CONSUMER];
  shouldRefreshView ||= consumer?.dirty && 
    consumerPollProducersForChange(consumer);
  
  if (shouldRefreshView) {
    refreshView(lView); // Actually check this component
  } else if (flags & LViewFlags.HasChildViewsToRefresh) {
    // Don't check this component, but traverse children
    detectChangesInChildViews(lView, mode);
  }
}`}
            </pre>
          </div>
        </div>
      )
    },
    {
      title: "How Signals Solve NG100",
      subtitle: "Bi-directional Flow Without Breaking Invariants",
      content: (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-purple-900 to-green-900 p-6 rounded-lg">
            <h3 className="text-2xl font-bold mb-4 text-center">The Magic Moment</h3>
            <p className="text-center text-gray-300">
              Signals enable controlled bi-directional flow within the synchronization loop
            </p>
          </div>
          <div className="bg-gray-900 p-6 rounded-lg font-mono text-xs overflow-x-auto">
            <div className="text-green-400">// With Signals - No NG100!</div>
            <pre className="mt-2 text-white">
{`// Parent
@Component({
  template: \`<child [data]="parentData()"></child>
              <div>{{ parentData() }}</div>\`
})
export class Parent {
  parentData = signal('initial');
}

// Child
@Component({ selector: 'child' })
export class Child implements AfterViewInit {
  @Input() data;
  parent = inject(Parent);
  
  ngAfterViewInit() {
    // This is now SAFE!
    this.parent.parentData.set('changed');
    // No NG100 because signals mark dirty & schedule re-check
  }
}`}
            </pre>
          </div>
          <div className="bg-gray-900 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-3 text-blue-400">Why This Works</h3>
            <div className="space-y-2 text-sm text-gray-300">
              <div>1. Parent is checked, reads parentData signal</div>
              <div>2. Child's AfterViewInit runs</div>
              <div>3. Signal.set() marks parent dirty</div>
              <div>4. synchronize() loop detects dirty views (dirtyFlags !== None)</div>
              <div>5. Loop runs again (up to 10 times)</div>
              <div>6. Parent is re-checked with new value</div>
              <div>7. Values stabilize, no NG100!</div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "The synchronize() Loop",
      subtitle: "Allowing Controlled Re-checks",
      content: (
        <div className="space-y-6">
          <div className="bg-gray-900 p-6 rounded-lg font-mono text-xs overflow-x-auto">
            <div className="text-green-400">// ApplicationRef.synchronize (v18+)</div>
            <pre className="mt-2 text-white">
{`private synchronize() {
  const MAXIMUM_REFRESH_RERUNS = 10;
  let runs = 0;
  
  while (
    this.dirtyFlags !== ApplicationRefDirtyFlags.None &&
    runs++ < MAXIMUM_REFRESH_RERUNS
  ) {
    this.synchronizeOnce();
  }
  
  if (ngDevMode && runs >= MAXIMUM_REFRESH_RERUNS) {
    throw new RuntimeError(
      'Infinite change detection: ApplicationRef detected ' +
      'that change detection has been triggered repeatedly.'
    );
  }
}

private synchronizeOnce() {
  // 1. Run effects
  if (this.dirtyFlags & ApplicationRefDirtyFlags.Effects) {
    this.dirtyFlags &= ~ApplicationRefDirtyFlags.Effects;
    this.effectManager.flush();
  }
  
  // 2. Refresh views (actual CD)
  if (this.dirtyFlags & ApplicationRefDirtyFlags.ViewRefresh) {
    this.dirtyFlags &= ~ApplicationRefDirtyFlags.ViewRefresh;
    this.views.forEach(view => detectChangesInView(view));
  }
  
  // 3. Run render hooks
  if (this.dirtyFlags & ApplicationRefDirtyFlags.AfterRender) {
    // ...
  }
}`}
            </pre>
          </div>
          <div className="bg-green-900 bg-opacity-30 border border-green-500 p-4 rounded-lg">
            <h4 className="font-semibold text-green-400 mb-2">The Key Difference</h4>
            <p className="text-sm text-gray-300">
              Zone.js era: Run CD once, then check for changes (throw if different)<br/>
              Signals era: Run CD, check if still dirty, re-run if needed (up to 10 times)
            </p>
          </div>
        </div>
      )
    },
    {
      title: "Effects - Side Effects with Dependencies",
      subtitle: "The Final Piece of the Reactive Puzzle",
      content: (
        <div className="space-y-6">
          <div className="bg-gray-900 p-6 rounded-lg font-mono text-xs overflow-x-auto">
            <div className="text-green-400">// effect() API</div>
            <pre className="mt-2 text-white">
{`@Component({...})
export class MyComponent {
  count = signal(0);
  
  constructor() {
    // Runs whenever count changes
    effect(() => {
      console.log('Count is now:', this.count());
      
      // Can read multiple signals
      const doubled = this.count() * 2;
      console.log('Doubled:', doubled);
    });
  }
}`}
            </pre>
          </div>
          <div className="bg-gray-900 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-3 text-purple-400">Effect Scheduling</h3>
            <div className="space-y-2 text-sm text-gray-300">
              <div>• Effects run BEFORE view refresh</div>
              <div>• Automatically tracked dependencies</div>
              <div>• Can mark views dirty via signal writes</div>
              <div>• Part of the synchronize() loop</div>
              <div>• Use allowSignalWrites: true to write signals in effects</div>
            </div>
          </div>
          <div className="bg-blue-900 bg-opacity-30 border border-blue-500 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-400 mb-2">Execution Order</h4>
            <p className="text-sm text-gray-300">
              1. Run effects (can mark views dirty)<br/>
              2. Refresh views (CD happens)<br/>
              3. Run afterRender hooks<br/>
              4. Check dirtyFlags, loop if needed
            </p>
          </div>
        </div>
      )
    },
    {
      title: "Zoneless in Production",
      subtitle: "What Changes, What Stays",
      content: (
        <div className="space-y-6">
          <div className="bg-gray-900 p-6 rounded-lg font-mono text-xs overflow-x-auto">
            <div className="text-green-400">// main.ts</div>
            <pre className="mt-2 text-white">
{`import { provideZonelessChangeDetection } from '@angular/core';

bootstrapApplication(AppComponent, {
  providers: [
    provideZonelessChangeDetection()
  ]
});`}
            </pre>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-green-900 bg-opacity-30 border border-green-500 p-4 rounded-lg">
              <h4 className="font-semibold text-green-400 mb-3">Still Works ✓</h4>
              <ul className="text-xs space-y-1">
                <li>• signal.set/update</li>
                <li>• markForCheck()</li>
                <li>• ComponentRef.setInput()</li>
                <li>• Template event bindings</li>
                <li>• async pipe</li>
                <li>• ViewContainerRef operations</li>
              </ul>
            </div>
            <div className="bg-red-900 bg-opacity-30 border border-red-500 p-4 rounded-lg">
              <h4 className="font-semibold text-red-400 mb-3">No Longer Works ✗</h4>
              <ul className="text-xs space-y-1">
                <li>• Plain setTimeout/setInterval</li>
                <li>• Promise.then without signals</li>
                <li>• XMLHttpRequest callbacks</li>
                <li>• addEventListener (direct)</li>
                <li>• Implicit CD from Zone.js</li>
              </ul>
            </div>
          </div>
          <div className="bg-yellow-900 bg-opacity-30 border border-yellow-500 p-4 rounded-lg">
            <h4 className="font-semibold text-yellow-400 mb-2">Migration Path</h4>
            <p className="text-xs text-gray-300">
              Use signals for all state. HttpClient already integrated. 
              Template events still work. Manual markForCheck for third-party libs.
            </p>
          </div>
        </div>
      )
    },
    {
      title: "The shouldScheduleTick Strategy",
      subtitle: "Hybrid Mode - Best of Both Worlds (v18+)",
      content: (
        <div className="space-y-6">
          <div className="bg-gray-900 p-6 rounded-lg font-mono text-xs overflow-x-auto">
            <div className="text-green-400">// ChangeDetectionSchedulerImpl</div>
            <pre className="mt-2 text-white">
{`private shouldScheduleTick(): boolean {
  // Mode 1: Pure Zoneless
  if (this.zonelessEnabled) {
    return true; // Always schedule via scheduler
  }
  
  // Mode 2 & 3: Hybrid/Zone-based
  if (
    this.pendingRenderTaskId !== null ||
    this.runningTick ||
    this.appRef.destroyed
  ) {
    return false; // Already scheduled or destroyed
  }
  
  // Check if we're inside Angular Zone
  if (typeof Zone !== 'undefined' && 
      Zone.current.get('isAngularZone')) {
    // Inside Zone: let Zone.js handle it
    return false;
  }
  
  // Outside Zone: scheduler handles it (hybrid mode!)
  return true;
}`}
            </pre>
          </div>
          <div className="bg-green-900 bg-opacity-30 border border-green-500 p-4 rounded-lg">
            <h4 className="font-semibold text-green-400 mb-2">Hybrid Mode Magic</h4>
            <p className="text-sm text-gray-300">
              signal.set() and markForCheck() now ALWAYS schedule CD, even outside the Angular zone. 
              No more runOutsideAngular() gotchas!
            </p>
          </div>
        </div>
      )
    },
    {
      title: "The Grand Finale",
      subtitle: "From Manual Ticks to Intelligent Synchronization",
      content: (
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-purple-900 via-pink-900 to-red-900 p-8 rounded-lg">
            <h3 className="text-2xl font-bold mb-6 text-center">The Evolution Timeline</h3>
            <div className="space-y-4 text-sm">
              <div className="flex items-start gap-3">
                <span className="text-2xl">📝</span>
                <div>
                  <strong className="text-blue-400">Manual Era:</strong>
                  <p className="text-gray-300">Explicit changeDetection calls after every state change</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">⚙️</span>
                <div>
                  <strong className="text-yellow-400">Zone.js Era:</strong>
                  <p className="text-gray-300">Automatic but wasteful - check everything on any async event</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">🎯</span>
                <div>
                  <strong className="text-purple-400">OnPush Era:</strong>
                  <p className="text-gray-300">Manual optimization via immutability and explicit marking</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">⚡</span>
                <div>
                  <strong className="text-green-400">Signals Era:</strong>
                  <p className="text-gray-300">Fine-grained reactivity - only check what actually changed</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">🚀</span>
                <div>
                  <strong className="text-pink-400">Zoneless Future:</strong>
                  <p className="text-gray-300">Pure reactive synchronization without Zone.js overhead</p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-900 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-4 text-center text-blue-400">
              The Core Insight
            </h3>
            <p className="text-center text-gray-300 text-lg">
              Change Detection is not about checking for changes—
              <br />
              <strong className="text-green-400">it is about synchronizing state with the UI efficiently</strong>
            </p>
          </div>
          <div className="bg-gradient-to-r from-green-900 to-purple-900 p-6 rounded-lg mt-6">
            <h3 className="text-xl font-semibold mb-4 text-center text-green-400">
              Signals: The Beautiful Solution
            </h3>
            <div className="space-y-3 text-sm text-gray-300">
              <div>✓ No more NG100 errors with controlled bi-directional flow</div>
              <div>✓ Fine-grained updates via dependency tracking</div>
              <div>✓ OnPush by default with explicit reactivity</div>
              <div>✓ Zoneless capability with explicit scheduling</div>
              <div>✓ Synchronization loop handles re-checks gracefully</div>
            </div>
          </div>
        </div>
      )
    }
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  // Keyboard navigation
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'ArrowLeft':
          if (currentSlide > 0) prevSlide();
          break;
        case 'ArrowRight':
          if (currentSlide < slides.length - 1) nextSlide();
          break;
        case ' ':
          event.preventDefault();
          if (currentSlide < slides.length - 1) nextSlide();
          break;
        case 'Home':
          setCurrentSlide(0);
          break;
        case 'End':
          setCurrentSlide(slides.length - 1);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentSlide, slides.length]);

  return (
    <div className="w-screen h-screen bg-gray-950 text-white overflow-hidden flex items-center justify-center">
      <div className="w-full h-full max-w-[1920px] max-h-[1080px] flex flex-col p-12">
        <div className="mb-6">
          <h1 className="text-5xl font-bold mb-3">{slides[currentSlide].title}</h1>
          <h2 className="text-2xl text-gray-400">{slides[currentSlide].subtitle}</h2>
        </div>
        
        <div className="flex-1 bg-gray-900 rounded-lg p-8 overflow-hidden flex flex-col">
          <div className="flex-1 overflow-auto">
            {slides[currentSlide].content}
          </div>
        </div>

        
        <div className="mt-6 flex items-center justify-between">
          <button
            onClick={prevSlide}
            disabled={currentSlide === 0}
            className="flex items-center gap-3 px-8 py-4 bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed transition-colors text-lg font-semibold"
          >
            <ChevronLeft size={24} />
            Previous
          </button>
          
          <div className="flex flex-col items-center gap-1">
            <div className="text-gray-400 text-2xl font-semibold">
              {currentSlide + 1} / {slides.length}
            </div>
            <div className="text-gray-500 text-sm">
              Use ← → arrow keys or space to navigate
            </div>
          </div>
          
          <button
            onClick={nextSlide}
            disabled={currentSlide === slides.length - 1}
            className="flex items-center gap-3 px-8 py-4 bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed transition-colors text-lg font-semibold"
          >
            Next
            <ChevronRight size={24} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Presentation

